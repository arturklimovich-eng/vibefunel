import 'server-only';
import { z } from 'zod';
import { domainStatusSchema } from '@/lib/domains';
import { createSupabaseServiceClient } from '@/lib/supabase/service';
import type {
  CustomDomain,
  DomainMaintenance,
  RecheckOutcome,
  RecheckResult,
} from '@/server/funnel-repository';

const rowSchema = z.object({
  id: z.string(),
  project_id: z.string(),
  funnel_id: z.string(),
  hostname: z.string(),
  status: domainStatusSchema,
  verification_token: z.string(),
  verified_at: z.string().nullable(),
  last_checked_at: z.string().nullable(),
  last_error: z.string().nullable(),
  recheck_failures: z.number().int(),
  created_at: z.string(),
});

const resultSchema = z.enum([
  'kept',
  'restored',
  'taken',
  'warned',
  'revoked',
  'still_missing',
  'unknown',
  'skipped',
]);

function toDomain(row: z.infer<typeof rowSchema>): CustomDomain {
  return {
    id: row.id,
    projectId: row.project_id,
    funnelId: row.funnel_id,
    hostname: row.hostname,
    status: row.status,
    verificationToken: row.verification_token,
    verifiedAt: row.verified_at,
    lastCheckedAt: row.last_checked_at,
    lastError: row.last_error,
    recheckFailures: row.recheck_failures,
    createdAt: row.created_at,
  };
}

export class SupabaseDomainMaintenance implements DomainMaintenance {
  async claimDueDomains(checkedBefore: Date, limit: number): Promise<CustomDomain[]> {
    const { data, error } = await createSupabaseServiceClient().rpc('claim_domain_rechecks', {
      p_cutoff: checkedBefore.toISOString(),
      p_limit: limit,
    });
    if (error) throw new Error(`claimDueDomains: ${error.message}`);
    return z.array(rowSchema).parse(data).map(toDomain);
  }

  async releaseClaim(domain: CustomDomain, checkedAt: Date): Promise<void> {
    if (domain.lastCheckedAt === null) return;
    const { error } = await createSupabaseServiceClient()
      .from('domains')
      .update({ last_checked_at: checkedAt.toISOString() })
      .eq('id', domain.id)
      .eq('last_checked_at', domain.lastCheckedAt);
    if (error) throw new Error(`releaseClaim: ${error.message}`);
  }

  async recordRecheck(
    domainId: string,
    outcome: RecheckOutcome,
    error: string | null,
    revokeAfter: number,
  ): Promise<RecheckResult> {
    const { data, error: rpcError } = await createSupabaseServiceClient().rpc(
      'record_domain_recheck',
      { p_domain_id: domainId, p_outcome: outcome, p_error: error, p_revoke_after: revokeAfter },
    );
    if (rpcError) throw new Error(`recordRecheck: ${rpcError.message}`);
    return resultSchema.parse(data);
  }
}
