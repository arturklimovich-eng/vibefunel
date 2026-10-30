import 'server-only';
import { z } from 'zod';
import { requireSupabaseEnv } from '@/lib/storage-mode';
import { createSupabaseServiceClient } from '@/lib/supabase/service';
import type {
  AdjustmentResult,
  PaymentStore,
  StaleDeferred,
  RecordResult,
  StatusDetail,
  StatusQuery,
} from './store';
import { paymentReasonSchema } from './types';
import type { PaymentAdjustment, PaymentEvent } from './types';

const statusSchema = z.enum(['pending', 'succeeded', 'failed']);
const projectRowSchema = z.object({ project_id: z.string() });
const statusRowSchema = z.object({
  status: statusSchema,
  reason: paymentReasonSchema.nullable(),
  updated_at: z.string(),
});

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
    if (query.payers.length === 0) return { status: 'pending', reason: null, found: false };
    const base = () => {
      let request = serviceClient()
        .from('payments')
        .select('status, reason, updated_at')
        .eq('run_id', query.runId)
        .eq('screen_id', query.screenId)
        .in('payer_hash', query.payers);
      if (query.ref !== undefined) {
        request = request.eq('provider', query.provider ?? '').eq('provider_ref', query.ref);
      }
      return request;
    };
    const paid = await base().eq('status', 'succeeded').limit(1);
    if (paid.error) throw new Error(`payment status lookup failed: ${paid.error.message}`);
    const succeeded = z.array(statusRowSchema).parse(paid.data)[0];
    if (succeeded) return { status: 'succeeded', reason: succeeded.reason, found: true };
    const open = await base().eq('status', 'pending').limit(1);
    if (open.error) throw new Error(`payment status lookup failed: ${open.error.message}`);
    if (z.array(statusRowSchema).parse(open.data).length > 0) {
      return { status: 'pending', reason: null, found: true };
    }
    const { data, error } = await base().order('updated_at', { ascending: false }).limit(1);
    if (error) throw new Error(`payment status lookup failed: ${error.message}`);
    const latest = z.array(statusRowSchema).parse(data)[0];
    if (!latest) return { status: 'pending', reason: null, found: false };
    return { status: latest.status, reason: latest.reason, found: true };
  }

  async hasActivePayment(runId: string, screenId: string): Promise<boolean> {
    const { data, error } = await serviceClient()
      .from('payments')
      .select('status')
      .eq('run_id', runId)
      .eq('screen_id', screenId)
      .in('status', ['succeeded', 'pending'])
      .limit(1);
    if (error) throw new Error(`payment lookup failed: ${error.message}`);
    return z.array(z.object({ status: statusSchema })).parse(data).length > 0;
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
}
