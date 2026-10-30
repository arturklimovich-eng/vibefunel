import 'server-only';
import { UnsupportedError } from './types';
import type {
  CheckoutInput,
  CheckoutResult,
  PaymentEvent,
  PaymentProvider,
  ProviderStatus,
} from './types';

export class SolidgateProvider implements PaymentProvider {
  readonly id = 'solidgate' as const;

  status(): ProviderStatus {
    return 'not_configured';
  }

  createCheckout(input: CheckoutInput): Promise<CheckoutResult> {
    void input;
    return Promise.reject(new UnsupportedError('Solidgate createCheckout'));
  }

  verifyWebhook(rawBody: string, headers: Headers): Promise<PaymentEvent | null> {
    void rawBody;
    void headers;
    return Promise.reject(new UnsupportedError('Solidgate verifyWebhook'));
  }
}
