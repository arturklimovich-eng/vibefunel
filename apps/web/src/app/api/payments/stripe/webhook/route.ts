import { NextResponse } from 'next/server';
import { getPaymentStore, getStripeProvider } from '@/server/payments/registry';
import { processWebhook } from '@/server/payments/webhook';

export const dynamic = 'force-dynamic';

const MAX_WEBHOOK_BYTES = 1024 * 1024;

export async function POST(request: Request) {
  if ((process.env.PAYMENT_PROVIDER ?? 'stripe') !== 'stripe') {
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
  const outcome = await processWebhook(
    getStripeProvider(),
    getPaymentStore(),
    rawBody,
    request.headers,
  );
  return NextResponse.json(outcome.body, { status: outcome.status });
}
