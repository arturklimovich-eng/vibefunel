import 'server-only';
import { runTokenSecret } from './run-token';
import { MockForbiddenError, UnsupportedError } from './types';
import type {
  CheckoutInput,
  CheckoutResult,
  PaymentEvent,
  PaymentProvider,
  ProviderStatus,
} from './types';

export function isMockEnabled(): boolean {
  return process.env.PAYMENTS_MOCK === 'true' && process.env.NODE_ENV !== 'production';
}

export class MockProvider implements PaymentProvider {
  readonly id = 'mock' as const;

  constructor() {
    if (!isMockEnabled()) throw new MockForbiddenError();
  }

  status(): ProviderStatus {
    if (!isMockEnabled()) throw new MockForbiddenError();
    return runTokenSecret() === null ? 'not_configured' : 'ready';
  }

  createCheckout(input: CheckoutInput): Promise<CheckoutResult> {
    if (!isMockEnabled()) return Promise.reject(new MockForbiddenError());
    const params = new URLSearchParams({
      runId: input.runId,
      screenId: input.screenId,
      planKey: input.planKey,
      slug: input.slug,
      payer: input.payerHash,
      analytics: input.analyticsConsent ? '1' : '0',
    });
    return Promise.resolve({
      mode: 'redirect',
      url: `/api/payments/mock/confirm?${params.toString()}`,
    });
  }

  verifyWebhook(rawBody: string, headers: Headers): Promise<PaymentEvent | null> {
    void rawBody;
    void headers;
    return Promise.reject(new UnsupportedError('mock webhooks use /api/payments/mock/webhook'));
  }
}
