import 'server-only';
import { NextResponse } from 'next/server';
import type { z } from 'zod';
import type { StudioContext } from '../repository';
import { checkRateLimit, clientKey } from '../rate-limit';
import { costMicroUsd } from './pricing';
import { getImageModel, getTextModel } from './registry';
import type { ModelRef } from './registry';
import { AiError, EMPTY_USAGE } from './types';
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
  budget: { spentBefore: number; budget: number };
  remainingMicroUsd(): number;
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

interface LedgerEntry {
  day: number;
  spent: number;
  reserved: number;
}

const ledger = new Map<string, LedgerEntry>();

function ledgerEntry(projectId: string): LedgerEntry {
  const day = startOfUtcDay().getTime();
  let entry = ledger.get(projectId);
  if (!entry) {
    entry = { day, spent: 0, reserved: 0 };
    ledger.set(projectId, entry);
  } else if (entry.day !== day) {
    entry.day = day;
    entry.spent = 0;
  }
  return entry;
}

interface Meter {
  remaining(): number;
  run<R extends { usage: AiUsage }>(estimate: number, call: () => Promise<R>): Promise<R>;
}

function meter(
  context: StudioContext,
  opened: { projectId: string; spentBefore: number; budget: number },
  feature: AiFeature,
  ref: ModelRef,
): Meter {
  const { projectId, spentBefore, budget } = opened;
  const base = ledgerEntry(projectId).spent;
  const used = () => {
    const entry = ledgerEntry(projectId);
    return spentBefore + Math.max(0, entry.spent - base) + entry.reserved;
  };
  const record = async (usage: AiUsage) => {
    const cost = costMicroUsd(ref.price, usage);
    ledgerEntry(projectId).spent += cost;
    try {
      await context.repo.recordAiUsage({
        projectId,
        feature,
        provider: ref.provider,
        model: ref.model,
        inputTokens: usage.inputTokens + usage.cacheWriteTokens,
        outputTokens: usage.outputTokens,
        cachedInputTokens: usage.cachedInputTokens,
        images: usage.images,
        costMicroUsd: cost,
      });
    } catch (error) {
      console.error('[ai] usage not recorded', error);
    }
  };
  return {
    remaining: () => budget - used(),
    async run(estimate, call) {
      if (used() >= budget) {
        throw new AiError('budget_exhausted', 'The daily AI budget for this project is used up.');
      }
      const reservation = Math.max(0, estimate);
      ledgerEntry(projectId).reserved += reservation;
      let result;
      try {
        result = await call();
      } catch (error) {
        if (error instanceof AiError && hasUsage(error.usage)) await record(error.usage);
        throw error;
      } finally {
        ledgerEntry(projectId).reserved -= reservation;
      }
      await record(result.usage);
      return result;
    },
  };
}

function hasUsage(usage: AiUsage): boolean {
  return usage.inputTokens + usage.outputTokens + usage.cacheWriteTokens + usage.images > 0;
}

function textEstimate(ref: ModelRef, input: GenerateObjectInput<z.ZodType>): number {
  const chars = input.system.length + (input.prefix?.length ?? 0) + input.prompt.length;
  return costMicroUsd(ref.price, {
    ...EMPTY_USAGE,
    inputTokens: Math.ceil(chars / 3),
    outputTokens: input.maxTokens,
  });
}

function imageEstimate(ref: ModelRef): number {
  return costMicroUsd(ref.price, { ...EMPTY_USAGE, outputTokens: 2000, images: 1 });
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
  const gate = meter(context, opened, feature, model.ref);
  const session: AiSession = {
    model,
    projectId: opened.projectId,
    budget: { spentBefore: opened.spentBefore, budget: opened.budget },
    remainingMicroUsd: gate.remaining,
    async generate(input) {
      const result = await gate.run(textEstimate(model.ref, input), () =>
        model.generateObject(input),
      );
      return result.object;
    },
  };
  return { ok: true, session };
}

export interface ImageSession {
  projectId: string;
  model: ImageModel & { ref: ModelRef };
  generate(input: GenerateImageInput): Promise<GenerateImageResult>;
}

function imageSession(
  context: StudioContext,
  opened: { projectId: string; spentBefore: number; budget: number },
  model: ImageModel & { ref: ModelRef },
): ImageSession {
  const gate = meter(context, opened, 'images', model.ref);
  return {
    projectId: opened.projectId,
    model,
    generate: (input) => gate.run(imageEstimate(model.ref), () => model.generateImage(input)),
  };
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
  return { ok: true, session: imageSession(context, opened, model) };
}

export async function companionImageSession(
  context: StudioContext,
  session: AiSession,
): Promise<ImageSession | null> {
  const model = await getImageModel();
  if (!model) return null;
  return imageSession(context, { projectId: session.projectId, ...session.budget }, model);
}
