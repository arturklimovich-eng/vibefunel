import { z } from 'zod';

const statusResponse = z.object({
  status: z.enum([
    'pending',
    'processing',
    'succeeded',
    'failed',
    'needs_review',
    'refunded',
    'disputed',
  ]),
});

export type PublicStatus = z.infer<typeof statusResponse>['status'];

export type StatusResult =
  | { kind: 'status'; status: PublicStatus }
  | { kind: 'not_configured' }
  | { kind: 'rate_limited'; retryAfterMs: number };

const RETRY_AFTER_DEFAULT_S = 5;
const RETRY_AFTER_MAX_S = 30;

export function retryAfterMs(response: Response): number {
  const header = response.headers.get('retry-after');
  const parsed = header === null ? Number.NaN : Number.parseInt(header, 10);
  const seconds = Number.isFinite(parsed) && parsed > 0 ? parsed : RETRY_AFTER_DEFAULT_S;
  return Math.min(seconds, RETRY_AFTER_MAX_S) * 1000;
}

export async function fetchPaymentStatus(
  slug: string,
  runId: string,
  screenId: string,
  signal: AbortSignal,
  ref: string | null,
): Promise<StatusResult> {
  const query = new URLSearchParams({ slug, runId, screenId });
  if (ref !== null) query.set('ref', ref);
  const response = await fetch(`/api/payments/status?${query.toString()}`, {
    signal,
    cache: 'no-store',
  });
  if (response.status === 503) return { kind: 'not_configured' };
  if (response.status === 429)
    return { kind: 'rate_limited', retryAfterMs: retryAfterMs(response) };
  if (!response.ok) throw new Error(`Status check failed (${response.status}).`);
  return { kind: 'status', status: statusResponse.parse(await response.json()).status };
}
