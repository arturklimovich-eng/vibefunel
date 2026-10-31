import { z } from 'zod';

export type ProviderId = 'stripe' | 'solidgate' | 'mock';
export type PaymentStatus = 'pending' | 'succeeded' | 'failed';
export type PaymentRevocation = 'refunded' | 'disputed';
export type PublicPaymentStatus = PaymentStatus | 'needs_review' | 'processing' | PaymentRevocation;
export type ProviderStatus = 'ready' | 'not_configured';

export const paymentReasonSchema = z.enum([
  'amount_mismatch',
  'currency_mismatch',
  'plan_mismatch',
  'project_mismatch',
  'funnel_missing',
  'expired',
]);
export type PaymentReason = z.infer<typeof paymentReasonSchema>;

const REVIEW_REASONS: ReadonlySet<PaymentReason> = new Set<PaymentReason>([
  'amount_mismatch',
  'currency_mismatch',
  'plan_mismatch',
  'project_mismatch',
  'funnel_missing',
]);

const ACCESS_SUSPENDING_DISPUTES: ReadonlySet<string> = new Set([
  'needs_response',
  'under_review',
  'lost',
]);

export function revocationOf(payment: {
  amount: number;
  amountRefunded: number;
  disputeStatus: string | null;
}): PaymentRevocation | null {
  if (payment.disputeStatus !== null && ACCESS_SUSPENDING_DISPUTES.has(payment.disputeStatus)) {
    return 'disputed';
  }
  if (payment.disputeStatus === 'charge_refunded') return 'refunded';
  if (payment.amount > 0 && payment.amountRefunded >= payment.amount) return 'refunded';
  return null;
}

export function toPublicPaymentStatus(
  status: PaymentStatus,
  reason: PaymentReason | null,
  found: boolean,
  revoked: PaymentRevocation | null = null,
): PublicPaymentStatus {
  if (status === 'succeeded' && revoked !== null) return revoked;
  if (status === 'pending' && found) return 'processing';
  if (status === 'failed' && reason !== null && REVIEW_REASONS.has(reason)) return 'needs_review';
  return status;
}

export const runIdSchema = z.string().regex(/^[A-Za-z0-9_-]{16,64}$/);
export const planKeySchema = z.string().regex(/^[a-z0-9_-]{1,64}$/);
export const providerRefSchema = z.string().regex(/^[A-Za-z0-9_]{1,255}$/);
export const screenIdSchema = z.string().min(1).max(100);

export interface CheckoutInput {
  funnelId: string;
  projectId: string;
  slug: string;
  screenId: string;
  runId: string;
  planKey: string;
  returnUrl: string;
  payerHash: string;
  analyticsConsent: boolean;
}

export type CheckoutResult =
  | { mode: 'embedded'; clientSecret: string }
  | { mode: 'redirect'; url: string }
  | { mode: 'solidgate'; merchant: string; signature: string; paymentIntent: string; ref: string };

export interface PaymentEvent {
  provider: ProviderId;
  eventId: string;
  providerRef: string;
  status: PaymentStatus;
  amount: number;
  currency: string;
  planKey: string;
  projectId: string;
  funnelId: string | null;
  screenId: string;
  runId: string;
  reason: PaymentReason | null;
  payerHash: string | null;
  providerPaymentId: string | null;
  analyticsConsent: boolean;
}

export interface PaymentAdjustment {
  kind: 'adjustment';
  provider: ProviderId;
  eventId: string;
  chargeRef: string;
  providerPaymentId: string | null;
  projectId: string;
  funnelId: string;
  screenId: string;
  runId: string;
  payerHash: string | null;
  currency: string;
  amountRefunded: number | null;
  disputeStatus: string | null;
  occurredAt: string;
  analyticsConsent: boolean;
}

export type WebhookEvent = PaymentEvent | PaymentAdjustment;

export function isAdjustment(event: WebhookEvent): event is PaymentAdjustment {
  return 'kind' in event && event.kind === 'adjustment';
}

export interface PaymentProvider {
  readonly id: ProviderId;
  status(): ProviderStatus;
  createCheckout(input: CheckoutInput): Promise<CheckoutResult>;
  verifyWebhook(rawBody: string, headers: Headers): Promise<WebhookEvent | null>;
}

export class WebhookSignatureError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'WebhookSignatureError';
  }
}

export class ProviderNotConfiguredError extends Error {
  constructor(provider: ProviderId) {
    super(`Payment provider "${provider}" is not configured.`);
    this.name = 'ProviderNotConfiguredError';
  }
}

export class UnsupportedError extends Error {
  constructor(what: string) {
    super(`unsupported: ${what}`);
    this.name = 'UnsupportedError';
  }
}

export class RecurringPriceUnsupportedError extends Error {
  constructor() {
    super('Recurring prices are not supported; plans are one-time payments.');
    this.name = 'RecurringPriceUnsupportedError';
  }
}

export class PlanPriceMismatchError extends Error {
  constructor(planKey: string, detail: string) {
    super(`Provider price for plan "${planKey}" does not match the catalogue: ${detail}.`);
    this.name = 'PlanPriceMismatchError';
  }
}

export class MockForbiddenError extends Error {
  constructor() {
    super(
      'The mock payment provider is not available in production or without PAYMENTS_MOCK=true.',
    );
    this.name = 'MockForbiddenError';
  }
}
