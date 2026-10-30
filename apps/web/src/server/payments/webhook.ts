import 'server-only';
import { createHash } from 'node:crypto';
import type { AnalyticsScope } from '@/lib/analytics/events';
import { isMissingServiceKey } from '@/lib/supabase/service';
import { serverAnalytics } from './emitter';
import type { PaymentStore, RecordResult } from './store';
import { isAdjustment } from './types';
import type { PaymentAdjustment, PaymentEvent, PaymentProvider, WebhookEvent } from './types';

function isNamed(error: unknown, name: string): boolean {
  return error instanceof Error && error.name === name;
}

export interface WebhookOutcome {
  status: number;
  body: Record<string, unknown>;
}

function eventUuid(event: PaymentEvent, name: string): string {
  return uuidFrom(`${event.provider}:${event.providerRef}:${name}`);
}

function uuidFrom(seed: string): string {
  const hex = createHash('sha256').update(seed).digest('hex');
  const variant = ((parseInt(hex.charAt(16), 16) & 0x3) | 0x8).toString(16);
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-5${hex.slice(13, 16)}-${variant}${hex.slice(17, 20)}-${hex.slice(20, 32)}`;
}

export async function recordVerifiedEvent(
  store: PaymentStore,
  event: PaymentEvent,
): Promise<RecordResult> {
  const result = await store.recordEvent(event);
  if (result.rejected !== null) return result;
  if (!result.duplicate && event.status === 'succeeded') {
    try {
      const paid = await store.countSucceeded(event.runId, event.screenId);
      if (paid > 1) {
        console.error(
          `PAYMENT_NEEDS_ATTENTION duplicate_payment run=${event.runId} screen=${event.screenId} provider_ref=${event.providerRef} succeeded_payments=${paid}`,
        );
      }
    } catch (error) {
      console.error(
        `[payments] duplicate-payment check for run ${event.runId} failed:`,
        error instanceof Error ? error.message : error,
      );
    }
  }
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
        providerPaymentId: event.providerPaymentId,
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
        providerPaymentId: event.providerPaymentId,
        provider: event.provider,
        planKey: event.planKey,
        reason: event.reason,
      },
      { uuid: eventUuid(event, 'payment_failed') },
    );
  }
  return result;
}

function emitAdjustment(adjustment: PaymentAdjustment): void {
  if (!adjustment.analyticsConsent) return;
  const scope: AnalyticsScope = {
    projectId: adjustment.projectId,
    funnelId: adjustment.funnelId,
    funnelVersion: null,
    runId: adjustment.runId,
  };
  const uuid = uuidFrom(`${adjustment.provider}:${adjustment.eventId}`);
  if (adjustment.amountRefunded !== null) {
    serverAnalytics.emit(
      scope,
      {
        name: 'payment_refunded',
        screenId: adjustment.screenId,
        paymentId: adjustment.providerPaymentId ?? adjustment.chargeRef,
        providerPaymentId: adjustment.providerPaymentId,
        chargeId: adjustment.chargeRef,
        provider: adjustment.provider,
        amountRefundedTotal: adjustment.amountRefunded,
        currency: adjustment.currency,
      },
      { uuid },
    );
  }
  if (adjustment.disputeStatus !== null) {
    serverAnalytics.emit(
      scope,
      {
        name: 'payment_disputed',
        screenId: adjustment.screenId,
        paymentId: adjustment.providerPaymentId ?? adjustment.chargeRef,
        providerPaymentId: adjustment.providerPaymentId,
        chargeId: adjustment.chargeRef,
        provider: adjustment.provider,
        status: adjustment.disputeStatus,
      },
      { uuid },
    );
  }
}

async function processAdjustment(
  store: PaymentStore,
  adjustment: PaymentAdjustment,
): Promise<WebhookOutcome> {
  const result = await store.recordAdjustment(adjustment);
  if (result === 'duplicate') return { status: 200, body: { received: true, duplicate: true } };
  emitAdjustment(adjustment);
  if (result === 'deferred') {
    console.warn(
      `[payments] ${adjustment.provider} event ${adjustment.eventId} for charge ${adjustment.chargeRef} is waiting for its payment; it will be applied when the payment is recorded`,
    );
    return { status: 200, body: { received: true, deferred: true } };
  }
  return { status: 200, body: { received: true, duplicate: false } };
}

export async function processWebhook(
  provider: PaymentProvider,
  store: PaymentStore,
  rawBody: string,
  headers: Headers,
): Promise<WebhookOutcome> {
  let event: WebhookEvent | null;
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
    if (isAdjustment(event)) return await processAdjustment(store, event);
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
