import 'server-only';
import { createHash } from 'node:crypto';
import type { AnalyticsScope } from '@/lib/analytics/events';
import { isMissingServiceKey } from '@/lib/supabase/service';
import { serverAnalytics } from './emitter';
import type { PaymentStore, RecordResult } from './store';
import type { PaymentEvent, PaymentProvider } from './types';

function isNamed(error: unknown, name: string): boolean {
  return error instanceof Error && error.name === name;
}

export interface WebhookOutcome {
  status: number;
  body: Record<string, unknown>;
}

function eventUuid(event: PaymentEvent, name: string): string {
  const hex = createHash('sha256')
    .update(`${event.provider}:${event.providerRef}:${name}`)
    .digest('hex');
  const variant = ((parseInt(hex.charAt(16), 16) & 0x3) | 0x8).toString(16);
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-5${hex.slice(13, 16)}-${variant}${hex.slice(17, 20)}-${hex.slice(20, 32)}`;
}

export async function recordVerifiedEvent(
  store: PaymentStore,
  event: PaymentEvent,
): Promise<RecordResult> {
  const result = await store.recordEvent(event);
  if (result.rejected !== null) return result;
  const scope: AnalyticsScope = {
    projectId: event.projectId,
    funnelId: event.funnelId ?? 'unknown',
    funnelVersion: null,
    runId: event.runId,
  };
  if (result.duplicate || !event.analyticsConsent) return result;
  if (event.status === 'succeeded') {
    serverAnalytics.emit(
      scope,
      {
        name: 'payment_succeeded',
        screenId: event.screenId,
        paymentId: event.providerRef,
        provider: event.provider,
        planKey: event.planKey,
        amount: event.amount,
        currency: event.currency,
      },
      { uuid: eventUuid(event, 'payment_succeeded') },
    );
  }
  if (event.status === 'failed' && event.reason !== 'expired') {
    serverAnalytics.emit(
      scope,
      {
        name: 'payment_failed',
        screenId: event.screenId,
        paymentId: event.providerRef,
        provider: event.provider,
        planKey: event.planKey,
        reason: event.reason,
      },
      { uuid: eventUuid(event, 'payment_failed') },
    );
  }
  return result;
}

export async function processWebhook(
  provider: PaymentProvider,
  store: PaymentStore,
  rawBody: string,
  headers: Headers,
): Promise<WebhookOutcome> {
  let event: PaymentEvent | null;
  try {
    event = await provider.verifyWebhook(rawBody, headers);
  } catch (error) {
    if (isMissingServiceKey(error)) {
      return { status: 503, body: { status: 'not_configured' } };
    }
    if (isNamed(error, 'WebhookSignatureError')) {
      return { status: 400, body: { error: 'invalid_signature' } };
    }
    if (isNamed(error, 'ProviderNotConfiguredError')) {
      return { status: 503, body: { status: 'not_configured' } };
    }
    throw error;
  }
  if (event === null) return { status: 200, body: { received: true, ignored: true } };
  try {
    const result = await recordVerifiedEvent(store, event);
    if (result.rejected !== null) {
      return { status: 200, body: { received: true, rejected: result.rejected } };
    }
    return { status: 200, body: { received: true, duplicate: result.duplicate } };
  } catch (error) {
    if (isMissingServiceKey(error)) {
      return { status: 503, body: { status: 'not_configured' } };
    }
    throw error;
  }
}
