import 'server-only';
import Stripe from 'stripe';
import { z } from 'zod';
import { getPlan } from './plans';
import { PAYER_HASH_PATTERN, runTokenSecret } from './run-token';
import {
  PlanPriceMismatchError,
  ProviderNotConfiguredError,
  RecurringPriceUnsupportedError,
  WebhookSignatureError,
  planKeySchema,
  runIdSchema,
} from './types';
import type {
  CheckoutInput,
  CheckoutResult,
  PaymentAdjustment,
  PaymentEvent,
  WebhookEvent,
  PaymentProvider,
  PaymentReason,
  PaymentStatus,
  ProviderStatus,
} from './types';
import type { Plan } from './plans';

const SESSION_TTL_SECONDS = 31 * 60;

export const STRIPE_API_VERSION = '2026-09-30.endive';

const adjustmentMetadataSchema = z.object({
  funnelId: z.string().min(1).max(100),
  screenId: z.string().min(1).max(100),
  runId: runIdSchema,
  projectId: z.string().min(1).max(100),
  payer: z.string().regex(PAYER_HASH_PATTERN).optional(),
  analytics: z.enum(['0', '1']).default('0'),
});

const metadataSchema = z.object({
  funnelId: z.string().min(1).max(100),
  screenId: z.string().min(1).max(100),
  runId: runIdSchema,
  planKey: planKeySchema,
  projectId: z.string().min(1).max(100),
  payer: z.string().regex(PAYER_HASH_PATTERN),
  analytics: z.enum(['0', '1']).default('0'),
});

export interface StripeProviderDeps {
  funnelProjectId: (funnelId: string) => Promise<string | null>;
}

export class StripeProvider implements PaymentProvider {
  readonly id = 'stripe' as const;
  private readonly deps: StripeProviderDeps;
  private client: Stripe | null = null;
  private clientKey: string | null = null;

  constructor(deps: StripeProviderDeps) {
    this.deps = deps;
  }

  status(): ProviderStatus {
    const ready =
      Boolean(process.env.STRIPE_SECRET_KEY) &&
      Boolean(process.env.STRIPE_WEBHOOK_SECRET) &&
      Boolean(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY) &&
      runTokenSecret() !== null;
    return ready ? 'ready' : 'not_configured';
  }

  private stripe(): Stripe {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) throw new ProviderNotConfiguredError('stripe');
    if (!this.client || this.clientKey !== key) {
      this.client = new Stripe(key, { apiVersion: STRIPE_API_VERSION });
      this.clientKey = key;
    }
    return this.client;
  }

  private async verifyPrice(planKey: string, plan: Plan, priceId: string): Promise<void> {
    const price = await this.stripe().prices.retrieve(priceId);
    if (price.type === 'recurring') throw new RecurringPriceUnsupportedError();
    if (!price.active) throw new PlanPriceMismatchError(planKey, 'price is inactive');
    if (price.unit_amount !== plan.amount) {
      throw new PlanPriceMismatchError(planKey, 'unit_amount differs from the catalogue');
    }
    if (price.currency.toLowerCase() !== plan.currency.toLowerCase()) {
      throw new PlanPriceMismatchError(planKey, 'currency differs from the catalogue');
    }
  }

  async createCheckout(input: CheckoutInput): Promise<CheckoutResult> {
    if (this.status() !== 'ready') throw new ProviderNotConfiguredError('stripe');
    const plan = getPlan(input.planKey);
    if (!plan) throw new Error(`Unknown plan "${input.planKey}".`);
    let lineItem: Stripe.Checkout.SessionCreateParams.LineItem;
    if (plan.stripePriceId) {
      await this.verifyPrice(input.planKey, plan, plan.stripePriceId);
      lineItem = { price: plan.stripePriceId, quantity: 1 };
    } else {
      lineItem = {
        quantity: 1,
        price_data: {
          currency: plan.currency,
          unit_amount: plan.amount,
          product_data: { name: plan.title },
        },
      };
    }
    const metadata = {
      funnelId: input.funnelId,
      screenId: input.screenId,
      runId: input.runId,
      planKey: input.planKey,
      projectId: input.projectId,
      payer: input.payerHash,
      analytics: input.analyticsConsent ? '1' : '0',
    };
    const separator = input.returnUrl.includes('?') ? '&' : '?';
    const session = await this.stripe().checkout.sessions.create({
      mode: 'payment',
      ui_mode: 'embedded_page',
      line_items: [lineItem],
      metadata,
      payment_intent_data: { metadata },
      expires_at: Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS,
      return_url: `${input.returnUrl}${separator}session_id={CHECKOUT_SESSION_ID}`,
    });
    if (!session.client_secret) throw new Error('Stripe returned no client secret.');
    return { mode: 'embedded', clientSecret: session.client_secret };
  }

  async verifyWebhook(rawBody: string, headers: Headers): Promise<WebhookEvent | null> {
    const secret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!secret || !process.env.STRIPE_SECRET_KEY) throw new ProviderNotConfiguredError('stripe');
    const signature = headers.get('stripe-signature');
    if (!signature) throw new WebhookSignatureError('Missing stripe-signature header.');
    let event: Stripe.Event;
    try {
      event = this.stripe().webhooks.constructEvent(rawBody, signature, secret);
    } catch (error) {
      if (error instanceof Stripe.errors.StripeSignatureVerificationError) {
        throw new WebhookSignatureError('Stripe signature verification failed.');
      }
      throw error;
    }
    if (event.type === 'charge.refunded') {
      const charge = event.data.object;
      return this.toAdjustment(
        event.id,
        event.type,
        event.created,
        charge,
        charge.amount_refunded,
        null,
      );
    }
    if (event.type === 'charge.dispute.created' || event.type === 'charge.dispute.closed') {
      const dispute = event.data.object;
      const chargeId = typeof dispute.charge === 'string' ? dispute.charge : dispute.charge.id;
      const charge = await this.stripe().charges.retrieve(chargeId);
      return this.toAdjustment(event.id, event.type, event.created, charge, null, dispute.status);
    }
    if (
      event.type !== 'checkout.session.completed' &&
      event.type !== 'checkout.session.async_payment_succeeded' &&
      event.type !== 'checkout.session.async_payment_failed' &&
      event.type !== 'checkout.session.expired'
    ) {
      return null;
    }
    return this.toPaymentEvent(event.id, event.type, event.data.object);
  }

  private async adjustmentMetadata(charge: Stripe.Charge) {
    const own = adjustmentMetadataSchema.safeParse(charge.metadata ?? {});
    if (own.success) return own.data;
    const paymentIntent =
      typeof charge.payment_intent === 'string' ? charge.payment_intent : charge.payment_intent?.id;
    if (!paymentIntent) return null;
    const sessions = await this.stripe().checkout.sessions.list({
      payment_intent: paymentIntent,
      limit: 1,
    });
    const session = sessions.data[0];
    if (!session) return null;
    const fromSession = adjustmentMetadataSchema.safeParse(session.metadata ?? {});
    return fromSession.success ? fromSession.data : null;
  }

  private async toAdjustment(
    eventId: string,
    type: string,
    createdSeconds: number,
    charge: Stripe.Charge,
    amountRefunded: number | null,
    disputeStatus: string | null,
  ): Promise<PaymentAdjustment | null> {
    const meta = await this.adjustmentMetadata(charge);
    if (meta === null) {
      console.warn(
        `[payments] stripe ${type} ${eventId} ignored: charge ${charge.id} is not from a funnel checkout.`,
      );
      return null;
    }
    const paymentIntent =
      typeof charge.payment_intent === 'string'
        ? charge.payment_intent
        : (charge.payment_intent?.id ?? null);
    const projectOfFunnel = await this.deps.funnelProjectId(meta.funnelId);
    const scopeTrusted = projectOfFunnel !== null && projectOfFunnel === meta.projectId;
    if (!scopeTrusted) {
      console.error(
        `PAYMENT_NEEDS_ATTENTION provider_ref=${charge.id} event=${eventId} reason=${projectOfFunnel === null ? 'funnel_missing' : 'project_mismatch'}`,
      );
    }
    return {
      kind: 'adjustment',
      provider: 'stripe',
      eventId,
      chargeRef: charge.id,
      providerPaymentId: paymentIntent,
      projectId: meta.projectId,
      funnelId: meta.funnelId,
      screenId: meta.screenId,
      runId: meta.runId,
      payerHash: meta.payer ?? null,
      currency: charge.currency.toLowerCase(),
      amountRefunded,
      disputeStatus:
        disputeStatus !== null && /^[a-z_]{1,40}$/.test(disputeStatus) ? disputeStatus : null,
      occurredAt: (Number.isFinite(createdSeconds) && createdSeconds > 0
        ? new Date(createdSeconds * 1000)
        : new Date()
      ).toISOString(),
      analyticsConsent: scopeTrusted && meta.analytics === '1',
    };
  }

  private async toPaymentEvent(
    eventId: string,
    type: string,
    session: Stripe.Checkout.Session,
  ): Promise<PaymentEvent | null> {
    const parsed = metadataSchema.safeParse(session.metadata ?? {});
    if (!parsed.success) {
      console.warn(`[payments] stripe event ${eventId} ignored: session metadata is not ours.`);
      return null;
    }
    const meta = parsed.data;
    const projectOfFunnel = await this.deps.funnelProjectId(meta.funnelId);
    const currency = (session.currency ?? '').toLowerCase();

    let status: PaymentStatus;
    if (type === 'checkout.session.async_payment_failed') status = 'failed';
    else if (type === 'checkout.session.expired') status = 'failed';
    else if (session.payment_status === 'paid') status = 'succeeded';
    else status = 'pending';

    let reason: PaymentReason | null = null;
    if (type === 'checkout.session.expired') {
      reason = 'expired';
    } else {
      const plan = getPlan(meta.planKey);
      if (projectOfFunnel === null) reason = 'funnel_missing';
      else if (projectOfFunnel !== meta.projectId) reason = 'project_mismatch';
      else if (!plan) reason = 'plan_mismatch';
      else if (session.amount_total !== plan.amount) reason = 'amount_mismatch';
      else if (currency !== plan.currency) reason = 'currency_mismatch';
      if (reason !== null) status = 'failed';
    }
    if (reason !== null && reason !== 'expired') {
      console.error(`PAYMENT_NEEDS_ATTENTION provider_ref=${session.id} reason=${reason}`);
    }

    return {
      provider: 'stripe',
      eventId,
      providerRef: session.id,
      status,
      amount: session.amount_total ?? 0,
      currency: /^[a-z]{3}$/.test(currency) ? currency : 'xxx',
      planKey: meta.planKey,
      projectId: meta.projectId,
      funnelId: projectOfFunnel === null ? null : meta.funnelId,
      screenId: meta.screenId,
      runId: meta.runId,
      reason,
      payerHash: meta.payer,
      providerPaymentId:
        typeof session.payment_intent === 'string'
          ? session.payment_intent
          : (session.payment_intent?.id ?? null),
      analyticsConsent: meta.analytics === '1',
    };
  }
}
