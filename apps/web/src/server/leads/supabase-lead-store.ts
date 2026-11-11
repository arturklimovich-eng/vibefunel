import 'server-only';
import type { SupabaseClient } from '@supabase/supabase-js';
import { z } from 'zod';
import { createSupabaseServiceClient } from '@/lib/supabase/service';
import type { FunnelLead, LeadInput, LeadStore } from './store';

const PAGE_SIZE = 1000;

const leadRowSchema = z.object({
  email: z.string(),
  consent: z.boolean(),
  consent_text: z.string().nullable(),
  screen_id: z.string(),
  block_id: z.string(),
  run_id: z.string(),
  created_at: z.string(),
});

export class SupabaseLeadStore implements LeadStore {
  constructor(private readonly reader: SupabaseClient | null = null) {}

  async recordLead(lead: LeadInput): Promise<{ duplicate: boolean }> {
    const { data, error } = await createSupabaseServiceClient().rpc('record_lead', {
      p_funnel_id: lead.funnelId,
      p_version: lead.version,
      p_run_id: lead.runId,
      p_screen_id: lead.screenId,
      p_block_id: lead.blockId,
      p_email: lead.email,
      p_consent: lead.consent,
      p_consent_text: lead.consentText,
    });
    if (error) throw new Error(`record_lead failed: ${error.message}`);
    return { duplicate: !z.boolean().parse(data) };
  }

  async countFunnelLeads(projectId: string, funnelId: string, since: string): Promise<number> {
    if (!z.uuid().safeParse(projectId).success || !z.uuid().safeParse(funnelId).success) {
      return 0;
    }
    const { count, error } = await createSupabaseServiceClient()
      .from('leads')
      .select('id', { count: 'exact', head: true })
      .eq('project_id', projectId)
      .eq('funnel_id', funnelId)
      .gte('created_at', since);
    if (error) throw new Error(`lead count failed: ${error.message}`);
    return count ?? 0;
  }

  async listFunnelLeads(
    projectId: string,
    funnelId: string,
    limit: number | null,
    since?: string,
  ): Promise<FunnelLead[]> {
    if (!z.uuid().safeParse(projectId).success || !z.uuid().safeParse(funnelId).success) {
      return [];
    }
    const client = this.reader ?? createSupabaseServiceClient();
    const leads: FunnelLead[] = [];
    let cursor: { createdAt: string; id: string } | null = null;
    for (;;) {
      const size = limit === null ? PAGE_SIZE : Math.min(PAGE_SIZE, limit - leads.length);
      if (size <= 0) break;
      let request = client
        .from('leads')
        .select('id, email, consent, consent_text, screen_id, block_id, run_id, created_at')
        .eq('project_id', projectId)
        .eq('funnel_id', funnelId);
      if (since !== undefined) request = request.gte('created_at', since);
      if (cursor !== null) {
        request = request.or(
          `created_at.lt."${cursor.createdAt}",and(created_at.eq."${cursor.createdAt}",id.lt.${cursor.id})`,
        );
      }
      const { data, error } = await request
        .order('created_at', { ascending: false })
        .order('id', { ascending: false })
        .limit(size);
      if (error) throw new Error(`lead list failed: ${error.message}`);
      const rows = z.array(leadRowSchema.extend({ id: z.uuid() })).parse(data);
      const last = rows[rows.length - 1];
      if (last) cursor = { createdAt: last.created_at, id: last.id };
      for (const row of rows) {
        leads.push({
          email: row.email,
          consent: row.consent,
          consentText: row.consent_text,
          screenId: row.screen_id,
          blockId: row.block_id,
          runId: row.run_id,
          createdAt: row.created_at,
        });
      }
      if (rows.length < size) break;
    }
    return leads;
  }
}
