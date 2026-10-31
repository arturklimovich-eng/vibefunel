import { slugSchema } from '@funnel/schema';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { parseJsonBody } from '@/server/parse-body';
import { resolveCheckoutTarget } from '@/server/payments/checkout-target';
import { checkRateLimit, clientKey, ipLimit } from '@/server/rate-limit';
import { getPaymentProvider } from '@/server/payments/registry';
import { isMissingServiceKey } from '@/lib/supabase/service';
import { getPaymentStore } from '@/server/payments/registry';
import {
  mergeRunCookie,
  newPayerNonce,
  payerHash,
  readCookie,
  runCookieName,
} from '@/server/payments/run-token';
import { planKeySchema, runIdSchema, screenIdSchema } from '@/server/payments/types';
import { customDomainOrigin, platformRequestOrigin } from '@/server/public-origin';
import { getPublishedReader } from '@/server/repository';

export const dynamic = 'force-dynamic';

const bodySchema = z.object({
  slug: slugSchema,
  screenId: screenIdSchema,
  runId: runIdSchema,
  planKey: planKeySchema,
  analyticsConsent: z.boolean().default(false),
});

function appOrigin(request: Request): string | null {
  const configured = process.env.APP_URL;
  if (configured) {
    try {
      return new URL(configured).origin;
    } catch (error) {
      if (!(error instanceof TypeError)) throw error;
    }
  }
  if (process.env.NODE_ENV === 'production') return null;
  return new URL(request.url).origin;
}

function rateLimited(retryAfterSeconds: number): NextResponse {
  return NextResponse.json(
    { error: 'rate_limited' },
    { status: 429, headers: { 'retry-after': String(retryAfterSeconds) } },
  );
}

export async function POST(request: Request) {
  const limit = checkRateLimit('checkout', clientKey(request), ipLimit(request, 60, 10), 60_000);
  if (!limit.ok) return rateLimited(limit.retryAfterSeconds);

  const provider = getPaymentProvider();
  if (provider === null || provider.status() !== 'ready') {
    return NextResponse.json({ status: 'not_configured' }, { status: 503 });
  }

  const body = await parseJsonBody(request, bodySchema);
  if (!body.ok) return body.response;
  const { slug, screenId, runId, planKey, analyticsConsent } = body.data;

  const perRun = checkRateLimit('checkout-run', `${slug}:${runId}`, 5, 60_000);
  if (!perRun.ok) return rateLimited(perRun.retryAfterSeconds);

  const target = await resolveCheckoutTarget(getPublishedReader(), { slug, screenId, planKey });
  if (!target.ok) return NextResponse.json({ error: target.error }, { status: target.status });

  const nonce = newPayerNonce();
  const payer = payerHash(runId, screenId, nonce);
  if (payer === null) return NextResponse.json({ status: 'not_configured' }, { status: 503 });

  let active: boolean;
  try {
    active = await getPaymentStore().hasActivePayment(runId, screenId);
  } catch (error) {
    if (isMissingServiceKey(error)) {
      return NextResponse.json({ status: 'not_configured' }, { status: 503 });
    }
    throw error;
  }
  if (active) return NextResponse.json({ error: 'payment_exists' }, { status: 409 });

  const custom = await customDomainOrigin(request, target.funnelId);
  const origin = custom ?? platformRequestOrigin(request) ?? appOrigin(request);
  if (origin === null) return NextResponse.json({ status: 'not_configured' }, { status: 503 });

  const returnPath = custom === null ? `/f/${slug}` : '/';
  const returnUrl = `${origin}${returnPath}?run=${runId}&screen=${encodeURIComponent(screenId)}`;
  try {
    const result = await provider.createCheckout({
      funnelId: target.funnelId,
      projectId: target.projectId,
      slug,
      screenId,
      runId,
      planKey,
      returnUrl,
      payerHash: payer,
      analyticsConsent,
    });
    const response = NextResponse.json({ ...result, provider: provider.id });
    response.cookies.set(
      runCookieName(runId),
      mergeRunCookie(readCookie(request, runCookieName(runId)), nonce),
      {
        httpOnly: true,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
        path: '/api/payments',
        maxAge: 60 * 60 * 24 * 30,
      },
    );
    return response;
  } catch (error) {
    if (error instanceof Error && error.name === 'RecurringPriceUnsupportedError') {
      return NextResponse.json({ error: 'recurring_price_unsupported' }, { status: 502 });
    }
    if (error instanceof Error && error.name === 'PlanPriceMismatchError') {
      console.error('[payments] plan price check failed:', error.message);
      return NextResponse.json({ error: 'plan_price_mismatch' }, { status: 502 });
    }
    console.error(
      '[payments] createCheckout failed:',
      error instanceof Error ? error.message : error,
    );
    return NextResponse.json({ error: 'provider_error' }, { status: 502 });
  }
}
