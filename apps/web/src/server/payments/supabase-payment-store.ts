import 'server-only';
import { z } from 'zod';
import { requireSupabaseEnv } from '@/lib/storage-mode';
import { createSupabaseServiceClient } from '@/lib/supabase/service';
import type {
  AdjustmentResult,
  FunnelPayment,
  PaymentStore,
  StaleDeferred,
  RecordResult,
  StatusDetail,
  StatusQuery,
} from './store';
import { paymentReasonSchema, revocationOf } from './types';
import type { PaymentAdjustment, PaymentEvent } from './types';

const statusSchema = z.enum(['pending', 'succeeded', 'failed']);
const projectRowSchema = z.object({ project_id: z.string() });
const statusRowSchema = z.object({
  status: statusSchema,
  reason: paymentReasonSchema.nullable(),
  updated_at: z.string(),
});
const accessRowSchema = z.object({
  status: statusSchema,
  reason: paymentReasonSchema.nullable(),
  amount: z.number().int(),
  amount_refunded: z.number().int(),
  dispute_status: z.string().nullable(),
});
const funnelPaymentRowSchema = accessRowSchema.extend({
  provider: z.enum(['stripe', 'solidgate', 'mock']),
  provider_ref: z.string(),
  screen_id: z.string(),
  plan_key: z.string(),
  currency: z.string(),
  created_at: z.string(),
});

function rowRevocation(row: z.infer<typeof accessRowSchema>) {
  return revocationOf({
    amount: row.amount,
    amountRefunded: row.amount_refunded,
    disputeStatus: row.dispute_status,
  });
}

type ServiceClient = ReturnType<typeof createSupabaseServiceClient>;

let cachedClient: { cacheKey: string; client: ServiceClient } | null = null;

function serviceClient(): ServiceClient {
  const { url } = requireSupabaseEnv();
  const cacheKey = `${url}\n${process.env.SUPABASE_SERVICE_ROLE_KEY ?? ''}`;
  if (cachedClient === null || cachedClient.cacheKey !== cacheKey) {
    cachedClient = { cacheKey, client: createSupabaseServiceClient() };
  }
  return cachedClient.client;
}

export class SupabasePaymentStore implements PaymentStore {
  async recordEvent(event: PaymentEvent): Promise<RecordResult> {
    if (!z.uuid().safeParse(event.projectId).success) {
      console.error(
        `PAYMENT_NEEDS_ATTENTION provider_ref=${event.providerRef} reason=invalid_project_id`,
      );
      return { duplicate: false, rejected: 'invalid_project_id' };
    }
    const { data, error } = await serviceClient().rpc('record_payment_event', {
      p_provider: event.provider,
      p_event_id: event.eventId,
      p_provider_ref: event.providerRef,
      p_run_id: event.runId,
      p_project_id: event.projectId,
      p_funnel_id: event.funnelId,
      p_screen_id: event.screenId,
      p_plan_key: event.planKey,
      p_amount: event.amount,
      p_currency: event.currency,
      p_status: event.status,
      p_reason: event.reason,
      p_payer_hash: event.payerHash,
      p_provider_payment_id: event.providerPaymentId,
    });
    if (error) throw new Error(`record_payment_event failed: ${error.message}`);
    const inserted = z.boolean().parse(data);
    return { duplicate: !inserted, rejected: null };
  }

  async recordAdjustment(adjustment: PaymentAdjustment): Promise<AdjustmentResult> {
    const { data, error } = await serviceClient().rpc('record_payment_adjustment', {
      p_provider: adjustment.provider,
      p_event_id: adjustment.eventId,
      p_provider_payment_id: adjustment.providerPaymentId,
      p_run_id: adjustment.runId,
      p_screen_id: adjustment.screenId,
      p_payer_hash: adjustment.payerHash,
      p_amount_refunded: adjustment.amountRefunded,
      p_dispute_status: adjustment.disputeStatus,
      p_occurred_at: adjustment.occurredAt,
    });
    if (error) throw new Error(`record_payment_adjustment failed: ${error.message}`);
    return z.enum(['recorded', 'duplicate', 'deferred']).parse(data);
  }

  async countSucceeded(runId: string, screenId: string): Promise<number> {
    const { count, error } = await serviceClient()
      .from('payments')
      .select('id', { count: 'exact', head: true })
      .eq('run_id', runId)
      .eq('screen_id', screenId)
      .eq('status', 'succeeded');
    if (error) throw new Error(`payment count failed: ${error.message}`);
    return count ?? 0;
  }

  async listStaleDeferred(
    seenBefore: Date,
    limit: number,
  ): Promise<{ total: number; items: StaleDeferred[] }> {
    const { data, error, count } = await serviceClient()
      .from('payment_orphans')
      .select('provider, event_id, first_seen_at', { count: 'exact' })
      .lt('first_seen_at', seenBefore.toISOString())
      .order('first_seen_at', { ascending: true })
      .limit(limit);
    if (error) throw new Error(`payment_orphans lookup failed: ${error.message}`);
    const items = z
      .array(
        z.object({
          provider: z.enum(['stripe', 'solidgate', 'mock']),
          event_id: z.string(),
          first_seen_at: z.string(),
        }),
      )
      .parse(data)
      .map((row) => ({
        provider: row.provider,
        eventId: row.event_id,
        firstSeenAt: row.first_seen_at,
      }));
    return { total: count ?? items.length, items };
  }

  async getStatus(query: StatusQuery): Promise<StatusDetail> {
    if (query.payers.length === 0) {
      return { status: 'pending', reason: null, found: false, revoked: null };
    }
    const base = () => {
      let request = serviceClient()
        .from('payments')
        .select('status, reason, updated_at, amount, amount_refunded, dispute_status')
        .eq('funnel_id', query.funnelId)
        .eq('run_id', query.runId)
        .eq('screen_id', query.screenId)
        .in('payer_hash', query.payers);
      if (query.ref !== undefined) {
        request = request.eq('provider', query.provider ?? '').eq('provider_ref', query.ref);
      }
      return request;
    };
    const paidResult = await base().eq('status', 'succeeded').limit(50);
    if (paidResult.error) {
      throw new Error(`payment status lookup failed: ${paidResult.error.message}`);
    }
    const paid = z.array(accessRowSchema).parse(paidResult.data);
    const active = paid.find((row) => rowRevocation(row) === null);
    if (active) return { status: 'succeeded', reason: active.reason, found: true, revoked: null };
    const open = await base().eq('status', 'pending').limit(1);
    if (open.error) throw new Error(`payment status lookup failed: ${open.error.message}`);
    if (z.array(statusRowSchema).parse(open.data).length > 0) {
      return { status: 'pending', reason: null, found: true, revoked: null };
    }
    const revokedRow = paid.find((row) => rowRevocation(row) === 'disputed') ?? paid[0];
    if (revokedRow) {
      return {
        status: 'succeeded',
        reason: revokedRow.reason,
        found: true,
        revoked: rowRevocation(revokedRow),
      };
    }
    const { data, error } = await base().order('updated_at', { ascending: false }).limit(1);
    if (error) throw new Error(`payment status lookup failed: ${error.message}`);
    const latest = z.array(statusRowSchema).parse(data)[0];
    if (!latest) return { status: 'pending', reason: null, found: false, revoked: null };
    return { status: latest.status, reason: latest.reason, found: true, revoked: null };
  }

  async hasActivePayment(funnelId: string, runId: string, screenId: string): Promise<boolean> {
    const { data, error } = await serviceClient()
      .from('payments')
      .select('status, reason, amount, amount_refunded, dispute_status')
      .eq('funnel_id', funnelId)
      .eq('run_id', runId)
      .eq('screen_id', screenId)
      .in('status', ['succeeded', 'pending'])
      .limit(50);
    if (error) throw new Error(`payment lookup failed: ${error.message}`);
    return z
      .array(accessRowSchema)
      .parse(data)
      .some((row) => row.status === 'pending' || rowRevocation(row) !== 'refunded');
  }

  async getFunnelProjectId(funnelId: string): Promise<string | null> {
    if (!z.uuid().safeParse(funnelId).success) return null;
    const { data, error } = await serviceClient()
      .from('funnels')
      .select('project_id')
      .eq('id', funnelId)
      .maybeSingle();
    if (error) throw new Error(`funnel lookup failed: ${error.message}`);
    if (data === null) return null;
    return projectRowSchema.parse(data).project_id;
  }

  async listFunnelPayments(
    projectId: string,
    funnelId: string,
    limit: number,
    since?: string,
  ): Promise<FunnelPayment[]> {
    if (!z.uuid().safeParse(projectId).success || !z.uuid().safeParse(funnelId).success) {
      return [];
    }
    let request = serviceClient()
      .from('payments')
      .select(
        'provider, provider_ref, screen_id, plan_key, amount, currency, status, reason, amount_refunded, dispute_status, created_at',
      )
      .eq('project_id', projectId)
      .eq('funnel_id', funnelId);
    if (since !== undefined) request = request.gte('created_at', since);
    const { data, error } = await request.order('created_at', { ascending: false }).limit(limit);
    if (error) throw new Error(`payment list failed: ${error.message}`);
    return z
      .array(funnelPaymentRowSchema)
      .parse(data)
      .map((row) => ({
        provider: row.provider,
        providerRef: row.provider_ref,
        screenId: row.screen_id,
        planKey: row.plan_key,
        amount: row.amount,
        currency: row.currency,
        status: row.status,
        reason: row.reason,
        amountRefunded: row.amount_refunded,
        disputeStatus: row.dispute_status,
        revoked: row.status === 'succeeded' ? rowRevocation(row) : null,
        createdAt: row.created_at,
      }));
  }
}
