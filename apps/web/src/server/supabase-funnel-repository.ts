import 'server-only';
import { createSeedFunnel, slugSchema, validateFunnel } from '@funnel/schema';
import type { Funnel, FunnelDefinition, FunnelVersion } from '@funnel/schema';
import type { PostgrestError, SupabaseClient } from '@supabase/supabase-js';
import { z } from 'zod';
import { MAX_DOMAINS_PER_FUNNEL, domainStatusSchema } from '@/lib/domains';
import { normalizeHostname } from '@/lib/hostname';
import { createSupabaseServiceClient } from '@/lib/supabase/service';
import {
  DefinitionInvalidError,
  DomainLimitError,
  DomainNotFoundError,
  DomainTakenError,
  ForbiddenError,
  FunnelNotFoundError,
  FunnelValidationError,
  RevisionConflictError,
  SlugTakenError,
  VersionUnreadableError,
} from './funnel-repository';
import type {
  CustomDomain,
  DomainCheck,
  FunnelDraft,
  FunnelRepository,
  PublishedFunnel,
  PublishedReader,
  VersionSummary,
} from './funnel-repository';
import { parseStoredDefinition } from './stored-definition';

const FUNNEL_COLUMNS = 'id, project_id, slug, name, status, published_version_id, draft_revision';
const VERSION_SUMMARY_COLUMNS = 'id, funnel_id, version, created_at';
const VERSION_COLUMNS = `${VERSION_SUMMARY_COLUMNS}, schema_version, definition`;
const UNIQUE_VIOLATION = '23505';
const SERIALIZATION_FAILURE = '40001';
const NO_DATA_FOUND = 'P0002';
const INSUFFICIENT_PRIVILEGE = '42501';
const FOREIGN_KEY_VIOLATION = '23503';
const INVALID_PARAMETER = '22023';
const PROGRAM_LIMIT_EXCEEDED = '54000';
const STALE_CLAIM_MESSAGE =
  'The TXT record no longer matches this claim; the hostname was verified by another funnel.';
const DOMAIN_COLUMNS =
  'id, project_id, funnel_id, hostname, status, verification_token, verified_at, last_checked_at, last_error, created_at';

const uuidSchema = z.string().uuid();

const funnelRowSchema = z.object({
  id: z.string(),
  project_id: z.string(),
  slug: z.string(),
  name: z.string(),
  status: z.enum(['draft', 'published']),
  published_version_id: z.string().nullable(),
  draft_revision: z.number().int(),
});

const draftRowSchema = z.object({
  id: z.string(),
  draft_definition: z.unknown(),
  draft_schema_version: z.number().int(),
  draft_revision: z.number().int(),
  updated_at: z.string(),
});

const membershipRowSchema = z.object({ project_id: z.string(), role: z.string() });

type MembershipRow = z.infer<typeof membershipRowSchema>;

const versionSummaryRowSchema = z.object({
  id: z.string(),
  funnel_id: z.string(),
  version: z.number().int(),
  created_at: z.string(),
});

const versionRowSchema = versionSummaryRowSchema.extend({
  schema_version: z.number().int(),
  definition: z.unknown(),
});

const publishedRowSchema = z.object({
  funnel_id: z.string(),
  project_id: z.string().uuid(),
  version: z.number().int(),
  definition: z.unknown(),
});

const publishedByHostRowSchema = publishedRowSchema.extend({ slug: z.string() });

const domainRowSchema = z.object({
  id: z.string(),
  project_id: z.string(),
  funnel_id: z.string(),
  hostname: z.string(),
  status: domainStatusSchema,
  verification_token: z.string(),
  verified_at: z.string().nullable(),
  last_checked_at: z.string().nullable(),
  last_error: z.string().nullable(),
  created_at: z.string(),
});

function toDomain(row: z.infer<typeof domainRowSchema>): CustomDomain {
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
    createdAt: row.created_at,
  };
}

function fail(context: string, error: PostgrestError): Error {
  return new Error(`${context}: ${error.message}`);
}

function toFunnel(row: z.infer<typeof funnelRowSchema>): Funnel {
  return {
    id: row.id,
    projectId: row.project_id,
    slug: row.slug,
    name: row.name,
    status: row.status,
    draftVersionId: `draft-${row.id}`,
    publishedVersionId: row.published_version_id,
    draftRevision: row.draft_revision,
  };
}

function toVersion(row: z.infer<typeof versionRowSchema>): FunnelVersion | null {
  const definition = parseStoredDefinition(row.definition);
  if (!definition) {
    console.error(`[SupabaseFunnelRepository] skipping unreadable version ${row.id}`);
    return null;
  }
  return {
    id: row.id,
    funnelId: row.funnel_id,
    version: row.version,
    schemaVersion: definition.schemaVersion,
    createdAt: row.created_at,
    definition,
  };
}

export class SupabaseFunnelRepository implements FunnelRepository {
  private memberships: Promise<MembershipRow[]> | null = null;

  constructor(
    private readonly client: SupabaseClient,
    private readonly userId: string,
  ) {}

  private memberRows(): Promise<MembershipRow[]> {
    if (!this.memberships) this.memberships = this.loadMemberships();
    return this.memberships;
  }

  private async loadMemberships(): Promise<MembershipRow[]> {
    const { data, error } = await this.client
      .from('project_members')
      .select('project_id, role')
      .eq('user_id', this.userId);
    if (error) throw fail('project_members', error);
    const rows = z.array(membershipRowSchema).parse(data);
    const owners = rows.filter((r) => r.role === 'owner');
    const others = rows.filter((r) => r.role !== 'owner');
    return [...owners, ...others];
  }

  private async memberProjectIds(): Promise<string[]> {
    return (await this.memberRows()).map((r) => r.project_id);
  }

  private async memberRole(projectId: string): Promise<string | null> {
    const row = (await this.memberRows()).find((r) => r.project_id === projectId);
    return row ? row.role : null;
  }

  private async requireFunnel(id: string): Promise<Funnel> {
    const funnel = await this.getFunnel(id);
    if (!funnel) throw new FunnelNotFoundError(`Funnel "${id}" not found.`);
    return funnel;
  }

  async listFunnels(): Promise<Funnel[]> {
    const ids = await this.memberProjectIds();
    if (ids.length === 0) return [];
    const { data, error } = await this.client
      .from('funnels')
      .select(FUNNEL_COLUMNS)
      .in('project_id', ids)
      .order('name');
    if (error) throw fail('listFunnels', error);
    return z.array(funnelRowSchema).parse(data).map(toFunnel);
  }

  async getFunnel(id: string): Promise<Funnel | null> {
    if (!uuidSchema.safeParse(id).success) return null;
    const ids = await this.memberProjectIds();
    if (ids.length === 0) return null;
    const { data, error } = await this.client
      .from('funnels')
      .select(FUNNEL_COLUMNS)
      .eq('id', id)
      .in('project_id', ids)
      .maybeSingle();
    if (error) throw fail('getFunnel', error);
    return data ? toFunnel(funnelRowSchema.parse(data)) : null;
  }

  async getDraft(funnelId: string): Promise<FunnelDraft | null> {
    if (!uuidSchema.safeParse(funnelId).success) return null;
    const ids = await this.memberProjectIds();
    if (ids.length === 0) return null;
    const { data, error } = await this.client
      .from('funnels')
      .select('id, draft_definition, draft_schema_version, draft_revision, updated_at')
      .eq('id', funnelId)
      .in('project_id', ids)
      .maybeSingle();
    if (error) throw fail('getDraft', error);
    if (!data) return null;
    const row = draftRowSchema.parse(data);
    const definition = parseStoredDefinition(row.draft_definition);
    if (!definition) return null;
    return {
      id: `draft-${row.id}`,
      funnelId: row.id,
      version: 0,
      schemaVersion: definition.schemaVersion,
      createdAt: row.updated_at,
      definition,
      revision: row.draft_revision,
    };
  }

  private async mapRpcError(
    context: string,
    funnelId: string,
    error: PostgrestError,
  ): Promise<Error> {
    if (error.code === SERIALIZATION_FAILURE) {
      const current = await this.requireFunnel(funnelId);
      return new RevisionConflictError(current.draftRevision);
    }
    if (error.code === NO_DATA_FOUND) {
      return new FunnelNotFoundError(`Funnel "${funnelId}" not found.`);
    }
    if (error.code === INVALID_PARAMETER) {
      return new DefinitionInvalidError('The definition failed the structural check.');
    }
    return fail(context, error);
  }

  async saveDraft(
    funnelId: string,
    definition: FunnelDefinition,
    expectedRevision: number,
  ): Promise<FunnelDraft> {
    await this.requireFunnel(funnelId);
    const { data, error } = await this.client.rpc('save_draft', {
      p_funnel_id: funnelId,
      p_expected_revision: expectedRevision,
      p_definition: definition,
      p_schema_version: definition.schemaVersion,
    });
    if (error) throw await this.mapRpcError('saveDraft', funnelId, error);
    return {
      id: `draft-${funnelId}`,
      funnelId,
      version: 0,
      schemaVersion: definition.schemaVersion,
      createdAt: new Date().toISOString(),
      definition,
      revision: z.number().int().parse(data),
    };
  }

  async publish(funnelId: string, expectedRevision: number): Promise<FunnelVersion> {
    const draft = await this.getDraft(funnelId);
    if (!draft) throw new FunnelNotFoundError(`Draft for "${funnelId}" not found.`);
    if (draft.revision !== expectedRevision) throw new RevisionConflictError(draft.revision);
    const result = validateFunnel(draft.definition);
    if (!result.ok) throw new FunnelValidationError(result.issues);
    const { data, error } = await this.client.rpc('publish_funnel', {
      p_funnel_id: funnelId,
      p_expected_revision: expectedRevision,
    });
    if (error) throw await this.mapRpcError('publish', funnelId, error);
    const version = toVersion(versionRowSchema.parse(data));
    if (!version) throw new Error('publish: stored version could not be read back.');
    return version;
  }

  async rollback(funnelId: string, versionId: string): Promise<Funnel> {
    await this.requireFunnel(funnelId);
    if (!uuidSchema.safeParse(versionId).success) {
      throw new FunnelNotFoundError(`Version "${versionId}" not found for funnel "${funnelId}".`);
    }
    const found = await this.client
      .from('funnel_versions')
      .select(VERSION_COLUMNS)
      .eq('id', versionId)
      .eq('funnel_id', funnelId)
      .maybeSingle();
    if (found.error) throw fail('rollback', found.error);
    if (!found.data) {
      throw new FunnelNotFoundError(`Version "${versionId}" not found for funnel "${funnelId}".`);
    }
    if (!parseStoredDefinition(versionRowSchema.parse(found.data).definition)) {
      throw new VersionUnreadableError(
        `Version "${versionId}" does not parse with the current schema and cannot be made live.`,
      );
    }
    const { data, error } = await this.client.rpc('rollback_funnel', {
      p_funnel_id: funnelId,
      p_version_id: versionId,
    });
    if (error) {
      const notFound =
        error.code === NO_DATA_FOUND ||
        error.code === INSUFFICIENT_PRIVILEGE ||
        error.code === FOREIGN_KEY_VIOLATION;
      if (notFound) {
        throw new FunnelNotFoundError(`Version "${versionId}" not found for funnel "${funnelId}".`);
      }
      throw fail('rollback', error);
    }
    return toFunnel(funnelRowSchema.parse(data));
  }

  async listVersionSummaries(funnelId: string): Promise<VersionSummary[]> {
    await this.requireFunnel(funnelId);
    const { data, error } = await this.client
      .from('funnel_versions')
      .select(VERSION_SUMMARY_COLUMNS)
      .eq('funnel_id', funnelId)
      .order('version', { ascending: false });
    if (error) throw fail('listVersionSummaries', error);
    return z
      .array(versionSummaryRowSchema)
      .parse(data)
      .map((row) => ({
        id: row.id,
        funnelId: row.funnel_id,
        version: row.version,
        createdAt: row.created_at,
      }));
  }

  async createFunnel(name: string, slug: string): Promise<Funnel> {
    const ids = await this.memberProjectIds();
    const projectId = ids[0];
    if (!projectId) throw new Error('createFunnel: the current user has no project.');
    const definition = createSeedFunnel();
    const { data, error } = await this.client
      .from('funnels')
      .insert({
        project_id: projectId,
        slug,
        name,
        status: 'draft',
        draft_definition: definition,
        draft_schema_version: definition.schemaVersion,
      })
      .select(FUNNEL_COLUMNS)
      .single();
    if (error) {
      if (error.code === UNIQUE_VIOLATION) throw new SlugTakenError(slug);
      throw fail('createFunnel', error);
    }
    return toFunnel(funnelRowSchema.parse(data));
  }

  async listDomains(funnelId: string): Promise<CustomDomain[]> {
    await this.requireFunnel(funnelId);
    const { data, error } = await this.client
      .from('domains')
      .select(DOMAIN_COLUMNS)
      .eq('funnel_id', funnelId)
      .order('created_at');
    if (error) throw fail('listDomains', error);
    return z.array(domainRowSchema).parse(data).map(toDomain);
  }

  async getDomain(funnelId: string, domainId: string): Promise<CustomDomain | null> {
    if (!uuidSchema.safeParse(domainId).success) return null;
    const funnel = await this.getFunnel(funnelId);
    if (!funnel) return null;
    const { data, error } = await this.client
      .from('domains')
      .select(DOMAIN_COLUMNS)
      .eq('id', domainId)
      .eq('funnel_id', funnelId)
      .maybeSingle();
    if (error) throw fail('getDomain', error);
    return data ? toDomain(domainRowSchema.parse(data)) : null;
  }

  async addDomain(funnelId: string, hostname: string): Promise<CustomDomain> {
    const funnel = await this.requireFunnel(funnelId);
    const { data, error } = await this.client
      .from('domains')
      .insert({ project_id: funnel.projectId, funnel_id: funnelId, hostname })
      .select(DOMAIN_COLUMNS)
      .single();
    if (error) {
      if (error.code === UNIQUE_VIOLATION) throw new DomainTakenError(hostname);
      if (error.code === PROGRAM_LIMIT_EXCEEDED) throw new DomainLimitError(MAX_DOMAINS_PER_FUNNEL);
      throw fail('addDomain', error);
    }
    return toDomain(domainRowSchema.parse(data));
  }

  async recordDomainCheck(
    funnelId: string,
    domainId: string,
    check: DomainCheck,
  ): Promise<CustomDomain> {
    const domain = await this.getDomain(funnelId, domainId);
    if (!domain) throw new DomainNotFoundError(`Domain "${domainId}" not found.`);
    const service = createSupabaseServiceClient();
    const { data, error } = await service.rpc('record_domain_check', {
      p_domain_id: domain.id,
      p_verified: check.verified,
      p_error: check.error,
    });
    if (error) {
      if (error.code === UNIQUE_VIOLATION) throw new DomainTakenError(domain.hostname);
      if (error.code === NO_DATA_FOUND) {
        throw new DomainNotFoundError(`Domain "${domainId}" not found.`);
      }
      throw fail('recordDomainCheck', error);
    }
    return toDomain(domainRowSchema.parse(data));
  }

  async releaseStaleClaim(
    hostname: string,
    stillOwned: (token: string) => Promise<boolean>,
  ): Promise<boolean> {
    const service = createSupabaseServiceClient();
    const found = await service
      .from('domains')
      .select('id, verification_token')
      .eq('hostname', hostname)
      .eq('status', 'verified')
      .maybeSingle();
    if (found.error) throw fail('releaseStaleClaim', found.error);
    if (!found.data) return false;
    const claim = z.object({ id: z.string(), verification_token: z.string() }).parse(found.data);
    if (await stillOwned(claim.verification_token)) return false;
    const { error } = await service.rpc('record_domain_check', {
      p_domain_id: claim.id,
      p_verified: false,
      p_error: STALE_CLAIM_MESSAGE,
    });
    if (error) throw fail('releaseStaleClaim', error);
    return true;
  }

  async removeDomain(funnelId: string, domainId: string): Promise<void> {
    const domain = await this.getDomain(funnelId, domainId);
    if (!domain) throw new DomainNotFoundError(`Domain "${domainId}" not found.`);
    const { data, error } = await this.client
      .from('domains')
      .delete()
      .eq('id', domain.id)
      .eq('funnel_id', funnelId)
      .select('id');
    if (error) throw fail('removeDomain', error);
    if (z.array(z.object({ id: z.string() })).parse(data).length === 0) {
      throw new DomainNotFoundError(`Domain "${domainId}" not found.`);
    }
  }

  async deleteFunnel(funnelId: string): Promise<void> {
    const funnel = await this.requireFunnel(funnelId);
    if ((await this.memberRole(funnel.projectId)) !== 'owner') {
      throw new ForbiddenError('Only project owners can delete funnels.');
    }
    const ids = await this.memberProjectIds();
    const { data, error } = await this.client
      .from('funnels')
      .delete()
      .eq('id', funnelId)
      .in('project_id', ids)
      .select('id');
    if (error) throw fail('deleteFunnel', error);
    if (z.array(z.object({ id: z.string() })).parse(data).length === 0) {
      throw new FunnelNotFoundError(`Funnel "${funnelId}" not found.`);
    }
  }
}

export class SupabasePublishedReader implements PublishedReader {
  constructor(private readonly client: SupabaseClient) {}

  async getPublishedBySlug(slug: string): Promise<PublishedFunnel | null> {
    if (!slugSchema.safeParse(slug).success) return null;
    const { data, error } = await this.client.rpc('get_published_funnel', { p_slug: slug });
    if (error) throw fail('getPublishedBySlug', error);
    const row = z.array(publishedRowSchema).parse(data)[0];
    if (!row) return null;
    const definition = parseStoredDefinition(row.definition);
    if (!definition) return null;
    return {
      funnelId: row.funnel_id,
      projectId: row.project_id,
      slug,
      version: row.version,
      definition,
    };
  }

  async getPublishedByHost(hostname: string): Promise<PublishedFunnel | null> {
    if (normalizeHostname(hostname) !== hostname) return null;
    const { data, error } = await this.client.rpc('get_published_funnel_by_host', {
      p_host: hostname,
    });
    if (error) throw fail('getPublishedByHost', error);
    const row = z.array(publishedByHostRowSchema).parse(data)[0];
    if (!row) return null;
    const definition = parseStoredDefinition(row.definition);
    if (!definition) return null;
    return {
      funnelId: row.funnel_id,
      projectId: row.project_id,
      slug: row.slug,
      version: row.version,
      definition,
    };
  }

  async isHostServable(hostname: string): Promise<boolean> {
    if (normalizeHostname(hostname) !== hostname) return false;
    const { data, error } = await this.client.rpc('is_host_servable', { p_host: hostname });
    if (error) throw fail('isHostServable', error);
    return z.boolean().parse(data);
  }
}
