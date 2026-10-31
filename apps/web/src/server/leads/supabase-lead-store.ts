import 'server-only';
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

  async listFunnelLeads(
    projectId: string,
    funnelId: string,
    limit: number | null,
  ): Promise<FunnelLead[]> {
    if (!z.uuid().safeParse(projectId).success || !z.uuid().safeParse(funnelId).success) {
      return [];
    }
    const client = createSupabaseServiceClient();
    const leads: FunnelLead[] = [];
    for (;;) {
      const from = leads.length;
      const size = limit === null ? PAGE_SIZE : Math.min(PAGE_SIZE, limit - from);
      if (size <= 0) break;
      const { data, error } = await client
        .from('leads')
        .select('email, consent, consent_text, screen_id, block_id, run_id, created_at')
        .eq('project_id', projectId)
        .eq('funnel_id', funnelId)
        .order('created_at', { ascending: false })
        .order('id', { ascending: true })
        .range(from, from + size - 1);
      if (error) throw new Error(`lead list failed: ${error.message}`);
      const rows = z.array(leadRowSchema).parse(data);
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
