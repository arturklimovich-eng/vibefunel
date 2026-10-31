import { NextResponse } from 'next/server';
import { z } from 'zod';
import { isMissingServiceKey } from '@/lib/supabase/service';
import { checkRateLimit, clientKey, ipLimit } from '@/server/rate-limit';
import {
  getPaymentProvider,
  getPaymentStore,
  getSolidgateProvider,
} from '@/server/payments/registry';
import { solidgateOrderIdSchema } from '@/server/payments/solidgate-provider';
import { processEvents } from '@/server/payments/webhook';
import type { StatusQuery } from '@/server/payments/store';
import { payerHashesFromRequest } from '@/server/payments/run-token';
import {
  providerRefSchema,
  runIdSchema,
  screenIdSchema,
  toPublicPaymentStatus,
} from '@/server/payments/types';

export const dynamic = 'force-dynamic';

const querySchema = z.object({
  runId: runIdSchema,
  screenId: screenIdSchema,
  ref: providerRefSchema.optional(),
});

const NO_STORE = { 'cache-control': 'no-store' };

export async function GET(request: Request) {
  const limit = checkRateLimit('status', clientKey(request), ipLimit(request, 600, 120), 60_000);
  if (!limit.ok) {
    return NextResponse.json(
      { error: 'rate_limited' },
      { status: 429, headers: { 'retry-after': String(limit.retryAfterSeconds) } },
    );
  }
  const params = new URL(request.url).searchParams;
  const parsed = querySchema.safeParse({
    runId: params.get('runId'),
    screenId: params.get('screenId'),
    ref: params.get('ref') ?? undefined,
  });
  if (!parsed.success) return NextResponse.json({ error: 'invalid_query' }, { status: 400 });
  const { runId, screenId, ref } = parsed.data;
  const payers = payerHashesFromRequest(request, runId, screenId);
  if (payers.length === 0) {
    return NextResponse.json({ status: 'pending' }, { headers: NO_STORE });
  }
  const provider = getPaymentProvider();
  if (ref !== undefined && provider === null) {
    return NextResponse.json({ status: 'pending' }, { headers: NO_STORE });
  }
  try {
    const store = getPaymentStore();
    const query: StatusQuery = { runId, screenId, payers, provider: provider?.id, ref };
    let detail = await store.getStatus(query);
    if (
      provider?.id === 'solidgate' &&
      ref !== undefined &&
      detail.status === 'pending' &&
      solidgateOrderIdSchema.safeParse(ref).success &&
      checkRateLimit('solidgate-confirm', ref, 20, 60_000).ok
    ) {
      try {
        const events = await getSolidgateProvider().confirm(ref);
        if (events.length > 0) {
          await processEvents(store, events);
          detail = await store.getStatus(query);
        }
      } catch (error) {
        if (isMissingServiceKey(error)) throw error;
        console.error(
          `[payments] solidgate status check for ${ref} failed:`,
          error instanceof Error ? error.message : error,
        );
      }
    }
    return NextResponse.json(
      { status: toPublicPaymentStatus(detail.status, detail.reason, detail.found, detail.revoked) },
      { headers: NO_STORE },
    );
  } catch (error) {
    if (isMissingServiceKey(error)) {
      return NextResponse.json({ status: 'not_configured' }, { status: 503 });
    }
    throw error;
  }
}
