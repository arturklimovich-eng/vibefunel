import 'server-only';
import type { Funnel } from '@funnel/schema';
import type { FunnelRepository } from '../funnel-repository';

export const AI_RUN_MAX_MS = 5 * 60_000;
export const AI_DRAFT_TTL_MS = 7 * 24 * 60 * 60_000;

interface AiRun {
  owner: string;
  controller: AbortController;
}

const globalRuns = globalThis as typeof globalThis & { __aiRuns?: Map<string, AiRun> };
const runs = (globalRuns.__aiRuns ??= new Map<string, AiRun>());

export function startAiRun(
  runId: string,
  owner: string,
): { signal: AbortSignal; finish: () => void } | null {
  if (runs.has(runId)) return null;
  const controller = new AbortController();
  runs.set(runId, { owner, controller });
  const timer = setTimeout(() => controller.abort(), AI_RUN_MAX_MS);
  return {
    signal: controller.signal,
    finish: () => {
      clearTimeout(timer);
      if (runs.get(runId)?.controller === controller) runs.delete(runId);
    },
  };
}

export function cancelAiRun(runId: string, owner: string): boolean {
  const run = runs.get(runId);
  if (!run || run.owner !== owner) return false;
  run.controller.abort();
  return true;
}

export async function withoutExpiredAiDrafts(
  repo: FunnelRepository,
  funnels: Funnel[],
): Promise<Funnel[]> {
  const now = new Date();
  const expired = funnels.filter(
    (f) => f.status === 'draft' && f.aiDraftExpiresAt && new Date(f.aiDraftExpiresAt) <= now,
  );
  if (expired.length === 0) return funnels;
  try {
    const removed = new Set(
      await repo.deleteExpiredAiDrafts(
        expired.map((f) => f.id),
        now,
      ),
    );
    return funnels.filter((f) => !removed.has(f.id));
  } catch (error) {
    console.error('[ai/drafts] purge failed', error);
    return funnels;
  }
}
