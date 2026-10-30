import 'server-only';
import { resolveStorageMode } from '@/lib/storage-mode';
import { getDataDir, getFileRepository } from '../repository';
import { FilePaymentStore } from './file-payment-store';
import { MockProvider, isMockEnabled } from './mock-provider';
import { SolidgateProvider } from './solidgate-provider';
import { StripeProvider } from './stripe-provider';
import { SupabasePaymentStore } from './supabase-payment-store';
import type { PaymentStore } from './store';
import type { PaymentProvider } from './types';

const globalForPayments = globalThis as typeof globalThis & {
  filePaymentStore?: FilePaymentStore;
  stripeProvider?: StripeProvider;
};

export function getPaymentStore(): PaymentStore {
  if (resolveStorageMode() === 'supabase') return new SupabasePaymentStore();
  if (!globalForPayments.filePaymentStore) {
    globalForPayments.filePaymentStore = new FilePaymentStore(getDataDir(), async (funnelId) => {
      const funnel = await getFileRepository().getFunnel(funnelId);
      return funnel ? funnel.projectId : null;
    });
  }
  return globalForPayments.filePaymentStore;
}

export function getStripeProvider(): StripeProvider {
  if (!globalForPayments.stripeProvider) {
    globalForPayments.stripeProvider = new StripeProvider({
      funnelProjectId: (funnelId) => getPaymentStore().getFunnelProjectId(funnelId),
    });
  }
  return globalForPayments.stripeProvider;
}

export function getPaymentProvider(): PaymentProvider | null {
  if (isMockEnabled()) return new MockProvider();
  const choice = process.env.PAYMENT_PROVIDER ?? 'stripe';
  if (choice === 'solidgate') return new SolidgateProvider();
  if (choice === 'stripe') return getStripeProvider();
  return null;
}
