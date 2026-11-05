import 'server-only';
import { randomUUID } from 'node:crypto';
import { createStarterFunnel, slugSchema, validateFunnel } from '@funnel/schema';
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
  GroupNotFoundError,
  MAX_LISTED_ASSETS,
  RevisionConflictError,
  SlugTakenError,
  VersionUnreadableError,
} from './funnel-repository';
import type {
  AiUsageRecord,
  Asset,
  CustomDomain,
  DomainCheck,
  FunnelDraft,
  FunnelGroup,
  FunnelRepository,
  NewAsset,
  PublishedFunnel,
  PublishedReader,
  VersionSummary,
} from './funnel-repository';
import { parseStoredDefinition } from './stored-definition';

const FUNNEL_COLUMNS =
  'id, project_id, group_id, slug, name, status, published_version_id, draft_revision, ai_draft_expires_at';
const GROUP_COLUMNS = 'id, project_id, name, created_at';
const ASSETS_BUCKET = 'funnel-assets';
const ASSET_COLUMNS =
  'id, project_id, funnel_id, path, width, height, bytes, source, prompt, created_at';

const assetRowSchema = z.object({
  id: z.string(),
  project_id: z.string(),
  funnel_id: z.string().nullable(),
  path: z.string(),
  width: z.number().int(),
  height: z.number().int(),
  bytes: z.number().int(),
  source: z.enum(['ai', 'upload']),
  prompt: z.string().nullable(),
  created_at: z.string(),
});
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
  'id, project_id, funnel_id, hostname, status, verification_token, verified_at, last_checked_at, last_error, recheck_failures, created_at';

const uuidSchema = z.string().uuid();

const funnelRowSchema = z.object({
  id: z.string(),
  project_id: z.string(),
  group_id: z.string().nullable(),
  slug: z.string(),
  name: z.string(),
  status: z.enum(['draft', 'published']),
  published_version_id: z.string().nullable(),
  draft_revision: z.number().int(),
  ai_draft_expires_at: z.string().nullable().optional(),
});

const groupRowSchema = z.object({
  id: z.string(),
  project_id: z.string(),
  name: z.string(),
  created_at: z.string(),
});

function toGroup(row: z.infer<typeof groupRowSchema>): FunnelGroup {
  return { id: row.id, projectId: row.project_id, name: row.name, createdAt: row.created_at };
}

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
  recheck_failures: z.number().int().default(0),
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
    recheckFailures: row.recheck_failures,
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
    groupId: row.group_id,
    slug: row.slug,
    name: row.name,
    status: row.status,
    draftVersionId: `draft-${row.id}`,
    publishedVersionId: row.published_version_id,
    draftRevision: row.draft_revision,
    aiDraftExpiresAt: row.ai_draft_expires_at ?? null,
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
  private groups = new Map<string, Promise<FunnelGroup>>();

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

  private async targetProject(
    groupId: string | null,
  ): Promise<{ projectId: string; group: FunnelGroup | null }> {
    if (groupId !== null) {
      const group = await this.requireGroup(groupId);
      return { projectId: group.projectId, group };
    }
    const projectId = (await this.memberProjectIds())[0];
    if (!projectId) throw new ForbiddenError('The current user has no project.');
    return { projectId, group: null };
  }

  async aiProjectId(groupId: string | null = null): Promise<string> {
    return (await this.targetProject(groupId)).projectId;
  }

  async recordAiUsage(record: AiUsageRecord): Promise<void> {
    const { error } = await this.client.from('ai_usage').insert({
      project_id: record.projectId,
      user_id: this.userId,
      feature: record.feature,
      provider: record.provider,
      model: record.model,
      input_tokens: record.inputTokens,
      output_tokens: record.outputTokens,
      cached_input_tokens: record.cachedInputTokens,
      images: record.images,
      cost_micro_usd: record.costMicroUsd,
    });
    if (error) throw fail('recordAiUsage', error);
  }

  async aiSpendSince(projectId: string, since: Date): Promise<number> {
    const { data, error } = await this.client.rpc('ai_spend_since', {
      p_project_id: projectId,
      p_since: since.toISOString(),
    });
    if (error) throw fail('aiSpendSince', error);
    return z.coerce.number().parse(data ?? 0);
  }

  private toAsset(row: z.infer<typeof assetRowSchema>): Asset {
    return {
      id: row.id,
      projectId: row.project_id,
      funnelId: row.funnel_id,
      url: this.client.storage.from(ASSETS_BUCKET).getPublicUrl(row.path).data.publicUrl,
      width: row.width,
      height: row.height,
      bytes: row.bytes,
      source: row.source,
      prompt: row.prompt,
      createdAt: row.created_at,
    };
  }

  async storeAsset(asset: NewAsset): Promise<Asset> {
    const id = randomUUID();
    const objectPath = `${asset.projectId}/${id}.webp`;
    const bucket = this.client.storage.from(ASSETS_BUCKET);
    const { error: uploadError } = await bucket.upload(objectPath, asset.data, {
      contentType: 'image/webp',
      cacheControl: '31536000',
      upsert: false,
    });
    if (uploadError) throw new Error(`storeAsset: ${uploadError.message}`);
    const { data, error } = await this.client
      .from('assets')
      .insert({
        id,
        project_id: asset.projectId,
        funnel_id: asset.funnelId,
        path: objectPath,
        width: asset.width,
        height: asset.height,
        bytes: asset.data.byteLength,
        source: asset.source,
        prompt: asset.prompt,
        model: asset.model,
        user_id: this.userId,
      })
      .select(ASSET_COLUMNS)
      .single();
    if (error) {
      const removed = await bucket.remove([objectPath]);
      if (removed.error)
        console.error('[assets] orphan not removed', objectPath, removed.error.message);
      throw fail('storeAsset', error);
    }
    return this.toAsset(assetRowSchema.parse(data));
  }

  async listAssets(projectId: string): Promise<Asset[]> {
    const { data, error } = await this.client
      .from('assets')
      .select(ASSET_COLUMNS)
      .eq('project_id', projectId)
      .order('created_at', { ascending: false })
      .limit(MAX_LISTED_ASSETS);
    if (error) throw fail('listAssets', error);
    return z
      .array(assetRowSchema)
      .parse(data ?? [])
      .map((row) => this.toAsset(row));
  }

  async createFunnel(
    name: string,
    slug: string,
    groupId: string | null = null,
    initial?: FunnelDefinition,
    aiDraftExpiresAt?: Date,
  ): Promise<Funnel> {
    const { projectId, group } = await this.targetProject(groupId);
    const definition = initial ?? createStarterFunnel();
    const { data, error } = await this.client
      .from('funnels')
      .insert({
        project_id: projectId,
        group_id: group ? group.id : null,
        slug,
        name,
        status: 'draft',
        draft_definition: definition,
        draft_schema_version: definition.schemaVersion,
        ai_draft_expires_at: aiDraftExpiresAt ? aiDraftExpiresAt.toISOString() : null,
      })
      .select(FUNNEL_COLUMNS)
      .single();
    if (error) {
      if (error.code === UNIQUE_VIOLATION) throw new SlugTakenError(slug);
      throw fail('createFunnel', error);
    }
    return toFunnel(funnelRowSchema.parse(data));
  }

  async moveFunnel(funnelId: string, groupId: string | null): Promise<Funnel> {
    const funnel = await this.requireFunnel(funnelId);
    if (groupId !== null) {
      const group = await this.requireGroup(groupId);
      if (group.projectId !== funnel.projectId) {
        throw new GroupNotFoundError(`Project "${groupId}" not found.`);
      }
    }
    const { data, error } = await this.client
      .from('funnels')
      .update({ group_id: groupId })
      .eq('id', funnelId)
      .eq('project_id', funnel.projectId)
      .select(FUNNEL_COLUMNS)
      .maybeSingle();
    if (error) {
      if (error.code === FOREIGN_KEY_VIOLATION) {
        throw new GroupNotFoundError(`Project "${groupId}" not found.`);
      }
      throw fail('moveFunnel', error);
    }
    if (!data) throw new FunnelNotFoundError(`Funnel "${funnelId}" not found.`);
    return toFunnel(funnelRowSchema.parse(data));
  }

  async listGroups(): Promise<FunnelGroup[]> {
    const ids = await this.memberProjectIds();
    if (ids.length === 0) return [];
    const { data, error } = await this.client
      .from('funnel_groups')
      .select(GROUP_COLUMNS)
      .in('project_id', ids)
      .order('name');
    if (error) throw fail('listGroups', error);
    return z.array(groupRowSchema).parse(data).map(toGroup);
  }

  private requireGroup(id: string): Promise<FunnelGroup> {
    let group = this.groups.get(id);
    if (!group) {
      group = this.loadGroup(id);
      this.groups.set(id, group);
      group.catch(() => this.groups.delete(id));
    }
    return group;
  }

  private async loadGroup(id: string): Promise<FunnelGroup> {
    const notFound = new GroupNotFoundError(`Project "${id}" not found.`);
    if (!uuidSchema.safeParse(id).success) throw notFound;
    const ids = await this.memberProjectIds();
    if (ids.length === 0) throw notFound;
    const { data, error } = await this.client
      .from('funnel_groups')
      .select(GROUP_COLUMNS)
      .eq('id', id)
      .in('project_id', ids)
      .maybeSingle();
    if (error) throw fail('getGroup', error);
    if (!data) throw notFound;
    return toGroup(groupRowSchema.parse(data));
  }

  async createGroup(name: string): Promise<FunnelGroup> {
    const projectId = (await this.memberProjectIds())[0];
    if (!projectId) throw new Error('createGroup: the current user has no project.');
    const { data, error } = await this.client
      .from('funnel_groups')
      .insert({ project_id: projectId, name })
      .select(GROUP_COLUMNS)
      .single();
    if (error) throw fail('createGroup', error);
    return toGroup(groupRowSchema.parse(data));
  }

  async renameGroup(groupId: string, name: string): Promise<FunnelGroup> {
    const group = await this.requireGroup(groupId);
    this.groups.delete(groupId);
    const { data, error } = await this.client
      .from('funnel_groups')
      .update({ name })
      .eq('id', group.id)
      .eq('project_id', group.projectId)
      .select(GROUP_COLUMNS)
      .maybeSingle();
    if (error) throw fail('renameGroup', error);
    if (!data) throw new GroupNotFoundError(`Project "${groupId}" not found.`);
    return toGroup(groupRowSchema.parse(data));
  }

  async deleteGroup(groupId: string): Promise<void> {
    const group = await this.requireGroup(groupId);
    this.groups.delete(groupId);
    const { data, error } = await this.client
      .from('funnel_groups')
      .delete()
      .eq('id', group.id)
      .eq('project_id', group.projectId)
      .select('id');
    if (error) throw fail('deleteGroup', error);
    if (z.array(z.object({ id: z.string() })).parse(data).length === 0) {
      throw new GroupNotFoundError(`Project "${groupId}" not found.`);
    }
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

  async markFunnelOpened(funnelId: string): Promise<void> {
    const { error } = await this.client
      .from('funnels')
      .update({ ai_draft_expires_at: null })
      .eq('id', funnelId)
      .not('ai_draft_expires_at', 'is', null);
    if (error) throw fail('markFunnelOpened', error);
  }

  async deleteExpiredAiDrafts(funnelIds: string[], now: Date): Promise<string[]> {
    if (funnelIds.length === 0) return [];
    const { data, error } = await this.client
      .from('funnels')
      .delete()
      .in('id', funnelIds)
      .eq('status', 'draft')
      .lte('ai_draft_expires_at', now.toISOString())
      .select('id');
    if (error) throw fail('deleteExpiredAiDrafts', error);
    return z
      .array(z.object({ id: z.string() }))
      .parse(data ?? [])
      .map((row) => row.id);
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
