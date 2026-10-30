import { z } from 'zod';
import { randomId } from '@/lib/ids';
import { MAX_RUN_HISTORY } from '@/lib/run-state';
import type { RunState } from '@/lib/run-state';

const answersSchema = z.record(z.string(), z.union([z.string(), z.array(z.string())]));

const persistedSchema = z.object({
  currentScreenId: z.string().max(100),
  answers: answersSchema,
  history: z
    .array(z.object({ screenId: z.string().max(100), answers: answersSchema }))
    .max(MAX_RUN_HISTORY),
});

export const RUN_ID_PATTERN = /^[A-Za-z0-9_-]{16,64}$/;

function runIdKey(funnelId: string): string {
  return `funnel-run-id:${funnelId}`;
}

function stateKey(funnelId: string, runId: string): string {
  return `funnel-run-state:${funnelId}:${runId}`;
}

function storage(): Storage | null {
  try {
    return window.sessionStorage;
  } catch (error) {
    console.warn('sessionStorage is unavailable:', error instanceof Error ? error.message : error);
    return null;
  }
}

function write(key: string, value: string): void {
  try {
    storage()?.setItem(key, value);
  } catch (error) {
    console.warn('sessionStorage write failed:', error instanceof Error ? error.message : error);
  }
}

export function getOrCreateRunId(funnelId: string): string {
  const store = storage();
  const existing = store?.getItem(runIdKey(funnelId)) ?? null;
  if (existing !== null && RUN_ID_PATTERN.test(existing)) return existing;
  const created = randomId(32);
  write(runIdKey(funnelId), created);
  return created;
}

export function adoptRunId(funnelId: string, runId: string): void {
  write(runIdKey(funnelId), runId);
}

export function saveRun(funnelId: string, runId: string, state: RunState): void {
  const persisted = {
    currentScreenId: state.currentScreenId,
    answers: state.answers,
    history: state.history.map((entry) => ({ screenId: entry.screenId, answers: entry.answers })),
  };
  write(stateKey(funnelId, runId), JSON.stringify(persisted));
}

export function loadRun(funnelId: string, runId: string): RunState | null {
  const raw = storage()?.getItem(stateKey(funnelId, runId)) ?? null;
  if (raw === null) return null;
  let json: unknown;
  try {
    json = JSON.parse(raw);
  } catch (error) {
    if (error instanceof SyntaxError) return null;
    throw error;
  }
  const parsed = persistedSchema.safeParse(json);
  if (!parsed.success) return null;
  return {
    currentScreenId: parsed.data.currentScreenId,
    answers: parsed.data.answers,
    emails: {},
    payments: {},
    history: parsed.data.history.map((entry) => ({
      screenId: entry.screenId,
      answers: entry.answers,
      emails: {},
      payments: {},
    })),
  };
}
