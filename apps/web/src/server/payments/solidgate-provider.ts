import 'server-only';
import { createCipheriv, createHash, createHmac, randomBytes, timingSafeEqual } from 'node:crypto';
import { z } from 'zod';
import { getPlan } from './plans';
import { PAYER_HASH_PATTERN, runTokenSecret } from './run-token';
import {
  ProviderNotConfiguredError,
  WebhookSignatureError,
  planKeySchema,
  runIdSchema,
} from './types';
import type {
  CheckoutInput,
  CheckoutResult,
  PaymentAdjustment,
  PaymentEvent,
  PaymentProvider,
  PaymentReason,
  PaymentStatus,
  ProviderStatus,
  WebhookEvent,
} from './types';

const DEFAULT_API_URL = 'https://pay.solidgate.com/api/v1';
const ORDER_PREFIX = 'sg_';
const STATUS_TIMEOUT_MS = 10_000;

export const solidgateOrderIdSchema = z.string().regex(/^sg_[a-f0-9]{32}$/);

const metadataSchema = z.object({
  funnelId: z.string().min(1).max(100),
  screenId: z.string().min(1).max(100),
  runId: runIdSchema,
  planKey: planKeySchema,
  projectId: z.string().min(1).max(100),
  payer: z.string().regex(PAYER_HASH_PATTERN),
  analytics: z.enum(['0', '1']).default('0'),
});

const orderSchema = z.object({
  order_id: z.string(),
  amount: z.number().int(),
  currency: z.string(),
  status: z.string(),
  refunded_amount: z.number().int().optional().default(0),
});

const statusSchema = z.object({
  order: orderSchema.passthrough().optional(),
  order_metadata: z.record(z.string(), z.unknown()).nullable().optional(),
  chargebacks: z.array(z.unknown()).nullable().optional(),
  error: z.object({ code: z.string() }).passthrough().optional(),
});

const webhookSchema = z.object({
  order: z.object({ order_id: z.string() }).passthrough(),
});

type OrderSnapshot = z.infer<typeof statusSchema>;

const SUCCEEDED = new Set(['settle_ok', 'partial_settled', 'refunded']);
const FAILED = new Set(['auth_failed', 'void_ok', 'declined']);

interface Keys {
  publicKey: string;
  secretKey: string;
}

function apiKeys(): Keys | null {
  const publicKey = process.env.SOLIDGATE_PUBLIC_KEY;
  const secretKey = process.env.SOLIDGATE_SECRET_KEY;
  if (!publicKey || !secretKey || secretKey.length < 32) return null;
  return { publicKey, secretKey };
}

function webhookKeys(): Keys | null {
  const publicKey = process.env.SOLIDGATE_WEBHOOK_PUBLIC_KEY;
  const secretKey = process.env.SOLIDGATE_WEBHOOK_SECRET_KEY;
  if (!publicKey || !secretKey) return null;
  return { publicKey, secretKey };
}

export function solidgateSignature(keys: Keys, body: string): string {
  const hex = createHmac('sha512', keys.secretKey)
    .update(keys.publicKey + body + keys.publicKey)
    .digest('hex');
  return Buffer.from(hex).toString('base64');
}

function encryptIntent(secretKey: string, intent: string): string {
  const iv = randomBytes(16);
  const cipher = createCipheriv('aes-256-cbc', Buffer.from(secretKey.slice(0, 32), 'utf8'), iv);
  const encrypted = Buffer.concat([iv, cipher.update(intent, 'utf8'), cipher.final()]);
  return encrypted.toString('base64').replace(/\+/g, '-').replace(/\//g, '_');
}

function safeEqual(a: string, b: string): boolean {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  return left.length === right.length && timingSafeEqual(left, right);
}

export function isSolidgateConfigured(): boolean {
  return apiKeys() !== null;
}

export interface SolidgateProviderDeps {
  funnelProjectId: (funnelId: string) => Promise<string | null>;
}

export class SolidgateProvider implements PaymentProvider {
  readonly id = 'solidgate' as const;
  private readonly deps: SolidgateProviderDeps;

  constructor(deps: SolidgateProviderDeps) {
    this.deps = deps;
  }

  status(): ProviderStatus {
    return apiKeys() !== null && webhookKeys() !== null && runTokenSecret() !== null
      ? 'ready'
      : 'not_configured';
  }

  async createCheckout(input: CheckoutInput): Promise<CheckoutResult> {
    const keys = apiKeys();
    if (this.status() !== 'ready' || keys === null) {
      throw new ProviderNotConfiguredError('solidgate');
    }
    const plan = getPlan(input.planKey);
    if (!plan) throw new Error(`Unknown plan "${input.planKey}".`);
    const orderId = `${ORDER_PREFIX}${randomBytes(16).toString('hex')}`;
    const separator = input.returnUrl.includes('?') ? '&' : '?';
    const back = `${input.returnUrl}${separator}session_id=${orderId}`;
    const intent = JSON.stringify({
      order_id: orderId,
      amount: plan.amount,
      currency: plan.currency.toUpperCase(),
      order_description: plan.title.slice(0, 100),
      platform: 'WEB',
      success_url: back,
      fail_url: back,
      order_metadata: {
        funnelId: input.funnelId,
        screenId: input.screenId,
        runId: input.runId,
        planKey: input.planKey,
        projectId: input.projectId,
        payer: input.payerHash,
        analytics: input.analyticsConsent ? '1' : '0',
      },
    });
    const paymentIntent = encryptIntent(keys.secretKey, intent);
    return {
      mode: 'solidgate',
      merchant: keys.publicKey,
      signature: solidgateSignature(keys, paymentIntent),
      paymentIntent,
      ref: orderId,
    };
  }

  async fetchOrder(orderId: string): Promise<OrderSnapshot | null> {
    const keys = apiKeys();
    if (keys === null) throw new ProviderNotConfiguredError('solidgate');
    const body = JSON.stringify({ order_id: orderId });
    const base = process.env.SOLIDGATE_API_URL || DEFAULT_API_URL;
    const response = await fetch(`${base}/status`, {
      method: 'POST',
      headers: {
        merchant: keys.publicKey,
        signature: solidgateSignature(keys, body),
        'content-type': 'application/json',
        accept: 'application/json',
      },
      body,
      signal: AbortSignal.timeout(STATUS_TIMEOUT_MS),
      cache: 'no-store',
    });
    if (response.status >= 500) throw new Error(`Solidgate status answered ${response.status}.`);
    const parsed = statusSchema.safeParse(await response.json());
    if (!parsed.success) throw new Error('Solidgate status response has an unexpected shape.');
    if (parsed.data.error?.code === '2.01') return null;
    if (parsed.data.error) throw new Error(`Solidgate status error ${parsed.data.error.code}.`);
    if (!parsed.data.order) return null;
    return parsed.data;
  }

  async confirm(orderId: string): Promise<WebhookEvent[]> {
    if (!solidgateOrderIdSchema.safeParse(orderId).success) return [];
    const snapshot = await this.fetchOrder(orderId);
    if (snapshot === null || !snapshot.order) return [];
    const base = `status:${orderId}:${snapshot.order.status}:${snapshot.order.refunded_amount}`;
    return this.toEvents(base, new Date(), snapshot);
  }

  async verifyWebhookEvents(rawBody: string, headers: Headers): Promise<WebhookEvent[]> {
    const keys = webhookKeys();
    if (keys === null || apiKeys() === null) throw new ProviderNotConfiguredError('solidgate');
    const merchant = headers.get('merchant');
    const signature = headers.get('signature');
    if (!merchant || !signature) throw new WebhookSignatureError('Missing Solidgate signature.');
    if (!safeEqual(merchant, keys.publicKey)) {
      throw new WebhookSignatureError('Unknown Solidgate webhook key.');
    }
    if (!safeEqual(signature, solidgateSignature(keys, rawBody))) {
      throw new WebhookSignatureError('Solidgate signature verification failed.');
    }
    let json: unknown;
    try {
      json = JSON.parse(rawBody);
    } catch (error) {
      if (error instanceof SyntaxError) return [];
      throw error;
    }
    const parsed = webhookSchema.safeParse(json);
    if (!parsed.success) return [];
    const orderId = parsed.data.order.order_id;
    if (!solidgateOrderIdSchema.safeParse(orderId).success) return [];
    const snapshot = await this.fetchOrder(orderId);
    if (snapshot === null || !snapshot.order) return [];
    const headerId = headers.get('solidgate-event-id');
    const eventId =
      headerId && /^[A-Za-z0-9_.:-]{1,200}$/.test(headerId)
        ? headerId
        : createHash('sha256').update(rawBody).digest('hex');
    const created = Date.parse(headers.get('solidgate-event-created-at') ?? '');
    return this.toEvents(
      eventId,
      Number.isFinite(created) ? new Date(created) : new Date(),
      snapshot,
    );
  }

  async verifyWebhook(rawBody: string, headers: Headers): Promise<WebhookEvent | null> {
    const events = await this.verifyWebhookEvents(rawBody, headers);
    return events[0] ?? null;
  }

  private async toEvents(
    baseId: string,
    occurredAt: Date,
    snapshot: OrderSnapshot,
  ): Promise<WebhookEvent[]> {
    const order = snapshot.order;
    if (!order) return [];
    const parsed = metadataSchema.safeParse(snapshot.order_metadata ?? {});
    if (!parsed.success) {
      console.warn(`[payments] solidgate order ${order.order_id} ignored: metadata is not ours.`);
      return [];
    }
    const meta = parsed.data;
    const projectOfFunnel = await this.deps.funnelProjectId(meta.funnelId);
    const currency = order.currency.toLowerCase();

    let status: PaymentStatus = 'pending';
    if (SUCCEEDED.has(order.status)) status = 'succeeded';
    else if (FAILED.has(order.status)) status = 'failed';

    let reason: PaymentReason | null = null;
    if (status === 'succeeded') {
      const plan = getPlan(meta.planKey);
      if (projectOfFunnel === null) reason = 'funnel_missing';
      else if (projectOfFunnel !== meta.projectId) reason = 'project_mismatch';
      else if (!plan) reason = 'plan_mismatch';
      else if (order.amount !== plan.amount) reason = 'amount_mismatch';
      else if (currency !== plan.currency) reason = 'currency_mismatch';
      if (reason !== null) {
        status = 'failed';
        console.error(`PAYMENT_NEEDS_ATTENTION provider_ref=${order.order_id} reason=${reason}`);
      }
    }

    const payment: PaymentEvent = {
      provider: 'solidgate',
      eventId: `${baseId}:payment`,
      providerRef: order.order_id,
      status,
      amount: order.amount,
      currency: /^[a-z]{3}$/.test(currency) ? currency : 'xxx',
      planKey: meta.planKey,
      projectId: meta.projectId,
      funnelId: projectOfFunnel === null ? null : meta.funnelId,
      screenId: meta.screenId,
      runId: meta.runId,
      reason,
      payerHash: meta.payer,
      providerPaymentId: order.order_id,
      analyticsConsent: meta.analytics === '1',
    };
    const events: WebhookEvent[] = [payment];
    if (status !== 'succeeded' || projectOfFunnel === null) return events;

    const scopeTrusted = projectOfFunnel === meta.projectId;
    const adjustment = (suffix: string, amountRefunded: number | null, dispute: string | null) =>
      ({
        kind: 'adjustment',
        provider: 'solidgate',
        eventId: `${baseId}:${suffix}`,
        chargeRef: order.order_id,
        providerPaymentId: order.order_id,
        projectId: meta.projectId,
        funnelId: meta.funnelId,
        screenId: meta.screenId,
        runId: meta.runId,
        payerHash: meta.payer,
        currency: payment.currency,
        amountRefunded,
        disputeStatus: dispute,
        occurredAt: occurredAt.toISOString(),
        analyticsConsent: scopeTrusted && meta.analytics === '1',
      }) satisfies PaymentAdjustment;

    const refunded = order.status === 'refunded' ? order.amount : order.refunded_amount;
    if (refunded > 0) events.push(adjustment(`refund:${refunded}`, refunded, null));
    const chargebacks = snapshot.chargebacks ?? [];
    if (chargebacks.length > 0) {
      console.error(
        `PAYMENT_NEEDS_ATTENTION provider_ref=${order.order_id} reason=chargeback count=${chargebacks.length}`,
      );
      events.push(adjustment(`chargeback:${chargebacks.length}`, null, 'needs_response'));
    }
    return events;
  }
}
