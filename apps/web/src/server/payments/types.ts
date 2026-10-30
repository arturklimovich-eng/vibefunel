import { z } from 'zod';

export type ProviderId = 'stripe' | 'solidgate' | 'mock';
export type PaymentStatus = 'pending' | 'succeeded' | 'failed';
export type PublicPaymentStatus = PaymentStatus | 'needs_review' | 'processing';
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

export function toPublicPaymentStatus(
  status: PaymentStatus,
  reason: PaymentReason | null,
  found: boolean,
): PublicPaymentStatus {
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
  { mode: 'embedded'; clientSecret: string } | { mode: 'redirect'; url: string };

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
  analyticsConsent: boolean;
}

export interface PaymentProvider {
  readonly id: ProviderId;
  status(): ProviderStatus;
  createCheckout(input: CheckoutInput): Promise<CheckoutResult>;
  verifyWebhook(rawBody: string, headers: Headers): Promise<PaymentEvent | null>;
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
