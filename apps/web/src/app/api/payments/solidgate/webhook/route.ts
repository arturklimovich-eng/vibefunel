import { NextResponse } from 'next/server';
import { getPaymentStore, getSolidgateProvider } from '@/server/payments/registry';
import { isSolidgateConfigured } from '@/server/payments/solidgate-provider';
import { processEvents, verificationFailure } from '@/server/payments/webhook';
import type { WebhookEvent } from '@/server/payments/types';

export const dynamic = 'force-dynamic';

const MAX_WEBHOOK_BYTES = 1024 * 1024;

export async function POST(request: Request) {
  if (!isSolidgateConfigured()) {
    return NextResponse.json({ status: 'not_configured' }, { status: 503 });
  }
  const declared = Number(request.headers.get('content-length') ?? '0');
  if (Number.isFinite(declared) && declared > MAX_WEBHOOK_BYTES) {
    return NextResponse.json({ error: 'payload_too_large' }, { status: 413 });
  }
  const rawBody = await request.text();
  if (Buffer.byteLength(rawBody, 'utf8') > MAX_WEBHOOK_BYTES) {
    return NextResponse.json({ error: 'payload_too_large' }, { status: 413 });
  }
  let events: WebhookEvent[];
  try {
    events = await getSolidgateProvider().verifyWebhookEvents(rawBody, request.headers);
  } catch (error) {
    const failure = verificationFailure(error);
    if (failure === null) throw error;
    return NextResponse.json(failure.body, { status: failure.status });
  }
  const outcome = await processEvents(getPaymentStore(), events);
  return NextResponse.json(outcome.body, { status: outcome.status });
}
