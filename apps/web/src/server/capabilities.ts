import 'server-only';
import { CURRENT_SCHEMA_VERSION } from '@funnel/schema';
import { resolveStorageMode } from '@/lib/storage-mode';
import type { StorageMode } from '@/lib/storage-mode';
import { agentAccessConfigured } from './agent-auth';
import { aiBriefOptions, aiChatEnabled, aiImagesEnabled, aiInlineEnabled } from './ai/registry';
import { domainTarget } from './domains/target';
import { isMockEnabled } from './payments/mock-provider';
import { loadPlans } from './payments/plans';

export const API_VERSION = 1;

export type PaymentProviderName = 'stripe' | 'solidgate' | 'mock';

export interface Capabilities {
  apiVersion: number;
  schemaVersion: number;
  storage: StorageMode;
  appUrl: string | null;
  payments: { provider: PaymentProviderName | null; planKeys: string[]; planError: string | null };
  ai: { brief: boolean; inline: boolean; chat: boolean; images: boolean };
  analytics: boolean;
  customDomains: boolean;
  agentAccess: boolean;
}

function paymentProvider(): PaymentProviderName | null {
  if (isMockEnabled()) return 'mock';
  const choice = process.env.PAYMENT_PROVIDER ?? 'stripe';
  if (choice === 'stripe') return process.env.STRIPE_SECRET_KEY ? 'stripe' : null;
  if (choice === 'solidgate') return process.env.SOLIDGATE_SECRET_KEY ? 'solidgate' : null;
  return null;
}

export function appUrl(): string | null {
  const raw = process.env.APP_URL?.trim();
  if (!raw) return null;
  try {
    return new URL(raw).origin;
  } catch {
    return null;
  }
}

export function getCapabilities(): Capabilities {
  const plans = loadPlans();
  return {
    apiVersion: API_VERSION,
    schemaVersion: CURRENT_SCHEMA_VERSION,
    storage: resolveStorageMode(),
    appUrl: appUrl(),
    payments: {
      provider: paymentProvider(),
      planKeys: plans.ok ? Object.keys(plans.plans) : [],
      planError: plans.ok ? null : plans.error,
    },
    ai: {
      brief: aiBriefOptions() !== null,
      inline: aiInlineEnabled(),
      chat: aiChatEnabled(),
      images: aiImagesEnabled(),
    },
    analytics: Boolean(process.env.POSTHOG_KEY || process.env.NEXT_PUBLIC_POSTHOG_KEY),
    customDomains: domainTarget().cnameTarget !== null,
    agentAccess: agentAccessConfigured(),
  };
}
