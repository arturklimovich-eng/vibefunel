import { NextResponse } from 'next/server';
import { isMissingServiceKey } from '@/lib/supabase/service';
import { cronAuthorized } from '@/server/cron-auth';
import { getPaymentStore } from '@/server/payments/registry';

export const dynamic = 'force-dynamic';

const STALE_AFTER_MS = 24 * 60 * 60 * 1000;
const LOG_LIMIT = 200;
const NO_STORE = { 'cache-control': 'no-store' };

export async function POST(request: Request) {
  const allowed = cronAuthorized(request);
  if (allowed === false) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401, headers: NO_STORE });
  }
  if (allowed === null) {
    return NextResponse.json({ status: 'not_configured' }, { status: 503, headers: NO_STORE });
  }
  try {
    const stale = await getPaymentStore().listStaleDeferred(
      new Date(Date.now() - STALE_AFTER_MS),
      LOG_LIMIT,
    );
    for (const item of stale.items) {
      console.error(
        `PAYMENT_NEEDS_ATTENTION ${item.provider} event ${item.eventId} has waited since ${item.firstSeenAt} for a payment that was never recorded`,
      );
    }
    return NextResponse.json(
      { staleDeferred: stale.total, logged: stale.items.length },
      { headers: NO_STORE },
    );
  } catch (error) {
    if (isMissingServiceKey(error)) {
      return NextResponse.json({ status: 'not_configured' }, { status: 503, headers: NO_STORE });
    }
    throw error;
  }
}
