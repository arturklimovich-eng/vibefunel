import type { ReturnParams } from '@/components/FunnelRuntime';
import { providerRefSchema, runIdSchema, screenIdSchema } from '@/server/payments/types';

export type SearchParams = Record<string, string | string[] | undefined>;

function single(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

export function parseReturnParams(query: SearchParams): ReturnParams | null {
  const run = runIdSchema.safeParse(single(query.run));
  const screen = screenIdSchema.safeParse(single(query.screen));
  const ref = providerRefSchema.safeParse(single(query.session_id));
  if (!run.success || !screen.success) return null;
  return { runId: run.data, screenId: screen.data, ref: ref.success ? ref.data : null };
}
