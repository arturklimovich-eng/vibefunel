import 'server-only';
import { NextResponse } from 'next/server';
import type { z } from 'zod';
import type { StudioContext } from '../repository';
import { checkRateLimit, clientKey } from '../rate-limit';
import { costMicroUsd } from './pricing';
import { getImageModel, getTextModel } from './registry';
import type { ModelRef } from './registry';
import { AiError } from './types';
import type {
  AiFeature,
  AiUsage,
  GenerateImageInput,
  GenerateImageResult,
  GenerateObjectInput,
  ImageModel,
  TextModel,
} from './types';

const DEFAULT_DAILY_BUDGET_USD = 5;

const RATE_LIMITS: Record<AiFeature, { limit: number; windowMs: number }> = {
  brief: { limit: 10, windowMs: 60 * 60_000 },
  inline: { limit: 60, windowMs: 60_000 },
  images: { limit: 20, windowMs: 60 * 60_000 },
  chat: { limit: 30, windowMs: 60_000 },
};

function dailyBudgetMicroUsd(): number {
  const raw = Number(process.env.AI_DAILY_BUDGET_USD);
  const usd = Number.isFinite(raw) && raw >= 0 ? raw : DEFAULT_DAILY_BUDGET_USD;
  return Math.round(usd * 1_000_000);
}

function startOfUtcDay(now: Date = new Date()): Date {
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
}

export interface AiSession {
  model: TextModel & { ref: ModelRef };
  projectId: string;
  generate<T extends z.ZodType>(input: GenerateObjectInput<T>): Promise<z.infer<T>>;
  spentMicroUsd(): number;
  remainingMicroUsd(): number;
  addSpend(spent: () => number): void;
}

export type AiSessionResult = { ok: true; session: AiSession } | { ok: false; response: Response };

export function aiErrorResponse(error: AiError): Response {
  if (error.code === 'provider_error' || error.code === 'quota_exhausted') {
    console.error('[ai]', error.message, error.detail ?? '');
  }
  const status =
    error.code === 'budget_exhausted' ||
    error.code === 'rate_limited' ||
    error.code === 'quota_exhausted'
      ? 429
      : error.code === 'refusal' || error.code === 'invalid_output' || error.code === 'truncated'
        ? 422
        : 502;
  return NextResponse.json({ error: error.code, message: error.message }, { status });
}

type Scope = { funnelId?: string; groupId?: string | null };

type Opened =
  | { ok: true; projectId: string; spentBefore: number; budget: number }
  | { ok: false; response: Response };

const notConfigured = (): { ok: false; response: Response } => ({
  ok: false,
  response: NextResponse.json({ error: 'ai_not_configured' }, { status: 503 }),
});

async function openScope(
  context: StudioContext,
  request: Request,
  feature: AiFeature,
  scope: Scope,
): Promise<Opened> {
  const rate = RATE_LIMITS[feature];
  const limit = checkRateLimit(
    `ai-${feature}`,
    context.userEmail ?? clientKey(request),
    rate.limit,
    rate.windowMs,
  );
  if (!limit.ok) {
    return {
      ok: false,
      response: NextResponse.json(
        { error: 'rate_limited' },
        { status: 429, headers: { 'retry-after': String(limit.retryAfterSeconds) } },
      ),
    };
  }
  const { repo } = context;
  let projectId: string;
  if (scope.funnelId) {
    const funnel = await repo.getFunnel(scope.funnelId);
    if (!funnel) {
      return { ok: false, response: NextResponse.json({ error: 'not_found' }, { status: 404 }) };
    }
    projectId = funnel.projectId;
  } else {
    projectId = await repo.aiProjectId(scope.groupId ?? null);
  }
  const budget = dailyBudgetMicroUsd();
  const spentBefore = await repo.aiSpendSince(projectId, startOfUtcDay());
  if (spentBefore >= budget) {
    return {
      ok: false,
      response: aiErrorResponse(
        new AiError('budget_exhausted', 'The daily AI budget for this project is used up.'),
      ),
    };
  }
  return { ok: true, projectId, spentBefore, budget };
}

function usageRecorder(
  context: StudioContext,
  projectId: string,
  feature: AiFeature,
  ref: ModelRef,
) {
  let spent = 0;
  return {
    spent: () => spent,
    async record(usage: AiUsage): Promise<void> {
      const cost = costMicroUsd(ref.price, usage);
      spent += cost;
      await context.repo.recordAiUsage({
        projectId,
        feature,
        provider: ref.provider,
        model: ref.model,
        inputTokens: usage.inputTokens,
        outputTokens: usage.outputTokens,
        cachedInputTokens: usage.cachedInputTokens,
        images: usage.images,
        costMicroUsd: cost,
      });
    },
  };
}

function hasUsage(usage: AiUsage): boolean {
  return usage.inputTokens + usage.outputTokens + usage.images > 0;
}

export async function openAiSession(
  context: StudioContext,
  request: Request,
  feature: AiFeature,
  scope: Scope,
): Promise<AiSessionResult> {
  const model = await getTextModel(feature);
  if (!model) return notConfigured();
  const opened = await openScope(context, request, feature, scope);
  if (!opened.ok) return opened;
  const { projectId, spentBefore, budget } = opened;
  const usage = usageRecorder(context, projectId, feature, model.ref);
  const extras: Array<() => number> = [];
  const extraSpent = () => extras.reduce((sum, spent) => sum + spent(), 0);

  const session: AiSession = {
    addSpend: (spent) => extras.push(spent),
    model,
    projectId,
    spentMicroUsd: usage.spent,
    remainingMicroUsd: () => budget - spentBefore - usage.spent() - extraSpent(),
    async generate(input) {
      if (spentBefore + usage.spent() + extraSpent() >= budget) {
        throw new AiError('budget_exhausted', 'The daily AI budget for this project is used up.');
      }
      try {
        const result = await model.generateObject(input);
        await usage.record(result.usage);
        return result.object;
      } catch (error) {
        if (error instanceof AiError && hasUsage(error.usage)) await usage.record(error.usage);
        throw error;
      }
    },
  };
  return { ok: true, session };
}

export interface ImageSession {
  projectId: string;
  model: ImageModel & { ref: ModelRef };
  generate(input: GenerateImageInput): Promise<GenerateImageResult>;
}

export async function openImageSession(
  context: StudioContext,
  request: Request,
  scope: Scope,
): Promise<{ ok: true; session: ImageSession } | { ok: false; response: Response }> {
  const model = await getImageModel();
  if (!model) return notConfigured();
  const opened = await openScope(context, request, 'images', scope);
  if (!opened.ok) return opened;
  const usage = usageRecorder(context, opened.projectId, 'images', model.ref);
  return {
    ok: true,
    session: {
      projectId: opened.projectId,
      model,
      async generate(input) {
        try {
          const result = await model.generateImage(input);
          await usage.record(result.usage);
          return result;
        } catch (error) {
          if (error instanceof AiError && hasUsage(error.usage)) await usage.record(error.usage);
          throw error;
        }
      },
    },
  };
}

export async function companionImageSession(
  context: StudioContext,
  session: AiSession,
): Promise<ImageSession | null> {
  const model = await getImageModel();
  if (!model) return null;
  const usage = usageRecorder(context, session.projectId, 'images', model.ref);
  session.addSpend(usage.spent);
  return {
    projectId: session.projectId,
    model,
    async generate(input) {
      if (session.remainingMicroUsd() <= 0) {
        throw new AiError('budget_exhausted', 'The daily AI budget for this project is used up.');
      }
      try {
        const result = await model.generateImage(input);
        await usage.record(result.usage);
        return result;
      } catch (error) {
        if (error instanceof AiError && hasUsage(error.usage)) await usage.record(error.usage);
        throw error;
      }
    },
  };
}
