export type AnalyticsSource = 'browser' | 'server';

export interface AnalyticsScope {
  projectId: string | null;
  funnelId: string;
  funnelVersion: number | null;
  runId: string | null;
}

export type AnalyticsEvent =
  | { name: 'funnel_view' }
  | { name: 'screen_view'; screenId: string; screenType: string }
  | { name: 'answer_selected'; screenId: string; optionIds: string[] }
  | { name: 'step_completed'; screenId: string }
  | { name: 'paywall_view'; screenId: string }
  | { name: 'checkout_started'; screenId: string; planKey: string }
  | {
      name: 'payment_succeeded';
      screenId: string;
      paymentId: string;
      providerPaymentId: string | null;
      provider: string;
      planKey: string;
      amount: number;
      currency: string;
    }
  | {
      name: 'payment_failed';
      screenId: string;
      paymentId: string;
      providerPaymentId: string | null;
      provider: string;
      planKey: string;
      reason: string | null;
    }
  | {
      name: 'payment_refunded';
      screenId: string;
      paymentId: string;
      providerPaymentId: string | null;
      chargeId: string;
      provider: string;
      amountRefundedTotal: number;
      currency: string;
    }
  | {
      name: 'payment_disputed';
      screenId: string;
      paymentId: string;
      providerPaymentId: string | null;
      chargeId: string;
      provider: string;
      status: string;
    }
  | { name: 'funnel_completed' };

export type AnalyticsEventName = AnalyticsEvent['name'];

export type ServerOnlyAnalyticsEvent = Extract<
  AnalyticsEvent,
  { name: 'payment_succeeded' | 'payment_failed' | 'payment_refunded' | 'payment_disputed' }
>;

export type BrowserAnalyticsEvent = Exclude<AnalyticsEvent, ServerOnlyAnalyticsEvent>;

export type AnalyticsPropertyValue = string | number | boolean | string[] | null;

export type AnalyticsProperties = Record<string, AnalyticsPropertyValue>;

export interface EmitOptions {
  uuid?: string;
}

export interface AnalyticsEmitter {
  emit(scope: AnalyticsScope, event: AnalyticsEvent, options?: EmitOptions): void;
}

export interface PropertyOptions {
  source: AnalyticsSource;
  includeOptionIds: boolean;
}

export function toProperties(
  scope: AnalyticsScope,
  event: AnalyticsEvent,
  options: PropertyOptions,
): AnalyticsProperties {
  const base: AnalyticsProperties = {
    source: options.source,
    project_id: scope.projectId,
    funnel_id: scope.funnelId,
    funnel_version: scope.funnelVersion,
    run_id: scope.runId,
  };
  switch (event.name) {
    case 'funnel_view':
    case 'funnel_completed':
      return base;
    case 'screen_view':
      return { ...base, screen_id: event.screenId, screen_type: event.screenType };
    case 'step_completed':
    case 'paywall_view':
      return { ...base, screen_id: event.screenId };
    case 'answer_selected':
      return {
        ...base,
        screen_id: event.screenId,
        option_count: event.optionIds.length,
        ...(options.includeOptionIds ? { option_ids: event.optionIds } : {}),
      };
    case 'checkout_started':
      return { ...base, screen_id: event.screenId, plan_key: event.planKey };
    case 'payment_succeeded':
      return {
        ...base,
        screen_id: event.screenId,
        payment_id: event.paymentId,
        provider_payment_id: event.providerPaymentId,
        provider: event.provider,
        plan_key: event.planKey,
        amount: event.amount,
        currency: event.currency,
      };
    case 'payment_failed':
      return {
        ...base,
        screen_id: event.screenId,
        payment_id: event.paymentId,
        provider_payment_id: event.providerPaymentId,
        provider: event.provider,
        plan_key: event.planKey,
        reason: event.reason,
      };
    case 'payment_refunded':
      return {
        ...base,
        screen_id: event.screenId,
        payment_id: event.paymentId,
        provider_payment_id: event.providerPaymentId,
        provider: event.provider,
        charge_id: event.chargeId,
        amount_refunded_total: event.amountRefundedTotal,
        currency: event.currency,
      };
    case 'payment_disputed':
      return {
        ...base,
        screen_id: event.screenId,
        payment_id: event.paymentId,
        provider_payment_id: event.providerPaymentId,
        provider: event.provider,
        charge_id: event.chargeId,
        dispute_status: event.status,
      };
  }
}
