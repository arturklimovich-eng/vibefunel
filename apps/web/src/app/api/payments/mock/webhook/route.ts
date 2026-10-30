import { slugSchema } from '@funnel/schema';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { isMissingServiceKey } from '@/lib/supabase/service';
import { resolveCheckoutTarget } from '@/server/payments/checkout-target';
import { isMockEnabled } from '@/server/payments/mock-provider';
import { getPaymentStore } from '@/server/payments/registry';
import { planKeySchema, runIdSchema, screenIdSchema } from '@/server/payments/types';
import type { PaymentEvent } from '@/server/payments/types';
import { recordVerifiedEvent } from '@/server/payments/webhook';
import { getPublishedReader } from '@/server/repository';

export const dynamic = 'force-dynamic';

const formSchema = z.object({
  slug: slugSchema,
  screenId: screenIdSchema,
  runId: runIdSchema,
  planKey: planKeySchema,
  eventId: z.string().regex(/^mock_evt_[a-f0-9]{24}$/),
  providerRef: z.string().regex(/^mock_ref_[a-f0-9]{24}$/),
  outcome: z.enum(['success', 'failure']),
  payer: z.string().regex(/^[a-f0-9]{64}$/),
  analytics: z.enum(['0', '1']).default('0'),
});

export async function POST(request: Request) {
  if (!isMockEnabled()) return NextResponse.json({ error: 'not_found' }, { status: 404 });
  let form: FormData;
  try {
    form = await request.formData();
  } catch (error) {
    if (error instanceof TypeError) {
      return NextResponse.json({ error: 'invalid_form' }, { status: 400 });
    }
    throw error;
  }
  const parsed = formSchema.safeParse(
    Object.fromEntries(
      [...form.entries()].map(([key, value]) => [key, typeof value === 'string' ? value : '']),
    ),
  );
  if (!parsed.success) return NextResponse.json({ error: 'invalid_form' }, { status: 400 });
  const input = parsed.data;
  const target = await resolveCheckoutTarget(getPublishedReader(), input);
  if (!target.ok) return NextResponse.json({ error: target.error }, { status: target.status });

  const event: PaymentEvent = {
    provider: 'mock',
    eventId: input.eventId,
    providerRef: input.providerRef,
    status: input.outcome === 'success' ? 'succeeded' : 'failed',
    amount: target.plan.amount,
    currency: target.plan.currency,
    planKey: input.planKey,
    projectId: target.projectId,
    funnelId: target.funnelId,
    screenId: input.screenId,
    runId: input.runId,
    reason: null,
    payerHash: input.payer,
    analyticsConsent: input.analytics === '1',
  };
  try {
    await recordVerifiedEvent(getPaymentStore(), event);
  } catch (error) {
    if (isMissingServiceKey(error)) {
      return NextResponse.json({ status: 'not_configured' }, { status: 503 });
    }
    throw error;
  }

  const back = `/f/${input.slug}?run=${input.runId}&screen=${encodeURIComponent(input.screenId)}&session_id=${input.providerRef}`;
  return NextResponse.redirect(new URL(back, request.url), 303);
}
