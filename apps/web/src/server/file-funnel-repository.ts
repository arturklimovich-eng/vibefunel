import 'server-only';
import { randomBytes, randomUUID } from 'node:crypto';
import { appendFile, mkdir, readFile, readdir, rename, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import {
  MigrationError,
  createSeedFunnel,
  createStarterFunnel,
  funnelSchema,
  funnelVersionSchema,
  migrate,
  validateFunnel,
} from '@funnel/schema';
import type { Funnel, FunnelDefinition, FunnelVersion } from '@funnel/schema';
import { z } from 'zod';
import { MAX_DOMAINS_PER_FUNNEL, domainStatusSchema } from '@/lib/domains';
import {
  DomainLimitError,
  DomainNotFoundError,
  DomainTakenError,
  FunnelNotFoundError,
  FunnelValidationError,
  GroupNotFoundError,
  RevisionConflictError,
  SlugTakenError,
  VersionUnreadableError,
} from './funnel-repository';
import { parseStoredDefinition } from './stored-definition';
import { MAX_AUTO_RECHECKS, MAX_LISTED_ASSETS } from './funnel-repository';
import type {
  AiUsageRecord,
  Asset,
  NewAsset,
  CustomDomain,
  DomainCheck,
  DomainMaintenance,
  RecheckOutcome,
  RecheckResult,
  FunnelDraft,
  FunnelGroup,
  FunnelRepository,
  PublishedFunnel,
  PublishedReader,
  VersionSummary,
} from './funnel-repository';

const SAFE_ID = /^[A-Za-z0-9_-]+$/;
const STALE_CLAIM_MESSAGE =
  'The TXT record no longer matches this claim; the hostname was verified by another funnel.';

const domainFileSchema = z.object({
  id: z.string(),
  projectId: z.string(),
  funnelId: z.string(),
  hostname: z.string(),
  status: domainStatusSchema,
  verificationToken: z.string(),
  verifiedAt: z.string().nullable(),
  lastCheckedAt: z.string().nullable(),
  lastError: z.string().nullable(),
  recheckFailures: z.number().int().min(0).default(0),
  createdAt: z.string(),
});

const groupFileSchema = z.object({
  id: z.string(),
  projectId: z.string(),
  name: z.string().min(1),
  createdAt: z.string(),
});

const versionSummarySchema = funnelVersionSchema.pick({
  id: true,
  funnelId: true,
  version: true,
  createdAt: true,
});

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function withRevision(raw: unknown): unknown {
  return isRecord(raw) ? { draftRevision: 1, ...raw } : raw;
}

function isNotFound(error: unknown): boolean {
  return error instanceof Error && 'code' in error && error.code === 'ENOENT';
}

export class FileFunnelRepository implements FunnelRepository, PublishedReader, DomainMaintenance {
  private readonly funnelsDir: string;
  private readonly draftsDir: string;
  private readonly versionsDir: string;
  private readonly domainsDir: string;
  private readonly groupsDir: string;
  private readonly aiUsageFile: string;
  private readonly assetsDir: string;
  private readonly reported = new Set<string>();
  private chain: Promise<unknown> = Promise.resolve();

  constructor(dataDir: string) {
    this.funnelsDir = path.join(dataDir, 'funnels');
    this.draftsDir = path.join(dataDir, 'drafts');
    this.versionsDir = path.join(dataDir, 'versions');
    this.domainsDir = path.join(dataDir, 'domains');
    this.groupsDir = path.join(dataDir, 'groups');
    this.aiUsageFile = path.join(dataDir, 'ai', 'usage.jsonl');
    this.assetsDir = path.join(dataDir, 'assets');
  }

  private withLock<T>(task: () => Promise<T>): Promise<T> {
    const run = this.chain.then(task, task);
    this.chain = run.catch(() => null);
    return run;
  }

  private init(): Promise<void> {
    return this.bootstrap();
  }

  private async bootstrap(): Promise<void> {
    await Promise.all(
      [this.funnelsDir, this.draftsDir, this.versionsDir, this.domainsDir, this.groupsDir].map(
        (d) => mkdir(d, { recursive: true }),
      ),
    );
    const existing = (await readdir(this.funnelsDir)).filter((f) => f.endsWith('.json'));
    if (existing.length > 0) return;
    const id = 'demo';
    const definition = createSeedFunnel();
    const draftVersionId = `${id}-draft`;
    const funnel: Funnel = {
      id,
      projectId: 'local',
      groupId: null,
      slug: 'demo',
      name: 'Demo funnel',
      status: 'draft',
      draftVersionId,
      publishedVersionId: null,
      draftRevision: 1,
    };
    const draft: FunnelVersion = {
      id: draftVersionId,
      funnelId: id,
      version: 0,
      schemaVersion: definition.schemaVersion,
      createdAt: new Date().toISOString(),
      definition,
    };
    await this.writeJson(path.join(this.draftsDir, `${id}.json`), draft);
    await this.writeJson(path.join(this.funnelsDir, `${id}.json`), funnel);
  }

  private async writeJson(file: string, value: unknown): Promise<void> {
    const tmp = `${file}.${randomUUID()}.tmp`;
    await writeFile(tmp, JSON.stringify(value, null, 2), 'utf8');
    await rename(tmp, file);
  }

  private async readJson(file: string): Promise<unknown> {
    try {
      return JSON.parse(await readFile(file, 'utf8'));
    } catch (error) {
      if (isNotFound(error)) return null;
      if (error instanceof SyntaxError) {
        this.report(file, 'invalid JSON');
        return null;
      }
      throw error;
    }
  }

  private report(file: string, reason: string): void {
    if (this.reported.has(file)) return;
    this.reported.add(file);
    console.error(`[FileFunnelRepository] skipping corrupt file ${file}: ${reason}`);
  }

  private async readVersionFile(file: string): Promise<FunnelVersion | null> {
    const raw = await this.readJson(file);
    if (raw === null) return null;
    if (!isRecord(raw)) {
      this.report(file, 'not an object');
      return null;
    }
    try {
      const definition = migrate(raw.definition);
      const parsed = funnelVersionSchema.safeParse({
        ...raw,
        definition,
        schemaVersion: definition.schemaVersion,
      });
      if (!parsed.success) {
        this.report(file, parsed.error.message);
        return null;
      }
      return parsed.data;
    } catch (error) {
      if (error instanceof MigrationError) {
        this.report(file, error.message);
        return null;
      }
      throw error;
    }
  }

  async listFunnels(): Promise<Funnel[]> {
    await this.init();
    const files = (await readdir(this.funnelsDir)).filter((f) => f.endsWith('.json'));
    const funnels: Funnel[] = [];
    for (const file of files) {
      const raw = await this.readJson(path.join(this.funnelsDir, file));
      if (raw === null) continue;
      const parsed = funnelSchema.safeParse(withRevision(raw));
      if (parsed.success) funnels.push(parsed.data);
      else this.report(path.join(this.funnelsDir, file), parsed.error.message);
    }
    return funnels.sort((a, b) => a.name.localeCompare(b.name));
  }

  async getFunnel(id: string): Promise<Funnel | null> {
    await this.init();
    if (!SAFE_ID.test(id)) return null;
    const file = path.join(this.funnelsDir, `${id}.json`);
    const raw = await this.readJson(file);
    if (raw === null) return null;
    const parsed = funnelSchema.safeParse(withRevision(raw));
    if (parsed.success) return parsed.data;
    this.report(file, parsed.error.message);
    return null;
  }

  async getDraft(funnelId: string): Promise<FunnelDraft | null> {
    const funnel = await this.getFunnel(funnelId);
    if (!funnel) return null;
    const draft = await this.readVersionFile(path.join(this.draftsDir, `${funnelId}.json`));
    return draft ? { ...draft, revision: funnel.draftRevision } : null;
  }

  async saveDraft(
    funnelId: string,
    definition: FunnelDefinition,
    expectedRevision: number,
  ): Promise<FunnelDraft> {
    return this.withLock(async () => {
      const funnel = await this.requireFunnel(funnelId);
      if (funnel.draftRevision !== expectedRevision) {
        throw new RevisionConflictError(funnel.draftRevision);
      }
      const revision = funnel.draftRevision + 1;
      const draft: FunnelVersion = {
        id: funnel.draftVersionId,
        funnelId,
        version: 0,
        schemaVersion: definition.schemaVersion,
        createdAt: new Date().toISOString(),
        definition,
      };
      await this.writeJson(path.join(this.draftsDir, `${funnelId}.json`), draft);
      await this.writeJson(path.join(this.funnelsDir, `${funnelId}.json`), {
        ...funnel,
        draftRevision: revision,
      });
      return { ...draft, revision };
    });
  }

  async publish(
    funnelId: string,
    expectedRevision: number,
    planKeys?: string[],
  ): Promise<FunnelVersion> {
    return this.withLock(async () => {
      const funnel = await this.requireFunnel(funnelId);
      if (funnel.draftRevision !== expectedRevision) {
        throw new RevisionConflictError(funnel.draftRevision);
      }
      const draft = await this.getDraft(funnelId);
      if (!draft) throw new FunnelNotFoundError(`Draft for "${funnelId}" not found.`);
      const result = validateFunnel(draft.definition, { planKeys });
      if (!result.ok) throw new FunnelValidationError(result.issues);
      const existing = await this.listVersionSummaries(funnelId);
      const nextNumber = existing.reduce((max, v) => Math.max(max, v.version), 0) + 1;
      const version: FunnelVersion = {
        id: `${funnelId}-v${nextNumber}-${randomUUID().slice(0, 8)}`,
        funnelId,
        version: nextNumber,
        schemaVersion: draft.definition.schemaVersion,
        createdAt: new Date().toISOString(),
        definition: draft.definition,
      };
      await writeFile(
        path.join(this.versionsDir, `${version.id}.json`),
        JSON.stringify(version, null, 2),
        { encoding: 'utf8', flag: 'wx' },
      );
      const updated: Funnel = { ...funnel, status: 'published', publishedVersionId: version.id };
      await this.writeJson(path.join(this.funnelsDir, `${funnelId}.json`), updated);
      return version;
    });
  }

  async getPublishedBySlug(slug: string): Promise<PublishedFunnel | null> {
    const funnels = await this.listFunnels();
    const funnel = funnels.find((f) => f.slug === slug);
    if (!funnel || funnel.publishedVersionId === null) return null;
    const version = await this.getVersion(funnel.publishedVersionId);
    if (!version || version.funnelId !== funnel.id) return null;
    return {
      funnelId: funnel.id,
      projectId: funnel.projectId,
      slug: funnel.slug,
      version: version.version,
      definition: version.definition,
    };
  }

  async getPublishedByHost(hostname: string): Promise<PublishedFunnel | null> {
    const domain = (await this.readAllDomains()).find(
      (d) => d.hostname === hostname && d.status === 'verified',
    );
    if (!domain) return null;
    const funnel = await this.getFunnel(domain.funnelId);
    if (!funnel) return null;
    return this.getPublishedBySlug(funnel.slug);
  }

  async isHostServable(hostname: string): Promise<boolean> {
    return (await this.getPublishedByHost(hostname)) !== null;
  }

  private async readAllDomains(): Promise<CustomDomain[]> {
    await this.init();
    const files = (await readdir(this.domainsDir)).filter((f) => f.endsWith('.json'));
    const domains: CustomDomain[] = [];
    for (const file of files) {
      const fullPath = path.join(this.domainsDir, file);
      const raw = await this.readJson(fullPath);
      if (raw === null) continue;
      const parsed = domainFileSchema.safeParse(raw);
      if (parsed.success) domains.push(parsed.data);
      else this.report(fullPath, parsed.error.message);
    }
    return domains.sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  }

  async listDomains(funnelId: string): Promise<CustomDomain[]> {
    await this.requireFunnel(funnelId);
    return (await this.readAllDomains()).filter((d) => d.funnelId === funnelId);
  }

  async getDomain(funnelId: string, domainId: string): Promise<CustomDomain | null> {
    const funnel = await this.getFunnel(funnelId);
    if (!funnel || !SAFE_ID.test(domainId)) return null;
    const raw = await this.readJson(path.join(this.domainsDir, `${domainId}.json`));
    if (raw === null) return null;
    const parsed = domainFileSchema.safeParse(raw);
    if (!parsed.success || parsed.data.funnelId !== funnelId) return null;
    return parsed.data;
  }

  async addDomain(funnelId: string, hostname: string): Promise<CustomDomain> {
    return this.withLock(async () => {
      const funnel = await this.requireFunnel(funnelId);
      const all = await this.readAllDomains();
      if (all.some((d) => d.hostname === hostname && d.funnelId === funnelId)) {
        throw new DomainTakenError(hostname);
      }
      if (all.filter((d) => d.funnelId === funnelId).length >= MAX_DOMAINS_PER_FUNNEL) {
        throw new DomainLimitError(MAX_DOMAINS_PER_FUNNEL);
      }
      const domain: CustomDomain = {
        id: randomUUID(),
        projectId: funnel.projectId,
        funnelId,
        hostname,
        status: 'pending',
        verificationToken: randomBytes(16).toString('hex'),
        verifiedAt: null,
        lastCheckedAt: null,
        lastError: null,
        recheckFailures: 0,
        createdAt: new Date().toISOString(),
      };
      await this.writeJson(path.join(this.domainsDir, `${domain.id}.json`), domain);
      return domain;
    });
  }

  async recordDomainCheck(
    funnelId: string,
    domainId: string,
    check: DomainCheck,
  ): Promise<CustomDomain> {
    return this.withLock(async () => {
      const domain = await this.getDomain(funnelId, domainId);
      if (!domain) throw new DomainNotFoundError(`Domain "${domainId}" not found.`);
      if (check.verified) {
        const elsewhere = (await this.readAllDomains()).some(
          (d) => d.id !== domain.id && d.hostname === domain.hostname && d.status === 'verified',
        );
        if (elsewhere) throw new DomainTakenError(domain.hostname);
      }
      const now = new Date().toISOString();
      const updated: CustomDomain = {
        ...domain,
        status: check.verified ? 'verified' : 'pending',
        verifiedAt: check.verified ? (domain.verifiedAt ?? now) : null,
        lastCheckedAt: now,
        lastError: check.error === null ? null : check.error.slice(0, 500),
        recheckFailures: 0,
      };
      await this.writeJson(path.join(this.domainsDir, `${domain.id}.json`), updated);
      return updated;
    });
  }

  claimDueDomains(checkedBefore: Date, limit: number): Promise<CustomDomain[]> {
    return this.withLock(async () => {
      const cutoff = checkedBefore.toISOString();
      const now = new Date().toISOString();
      const due = (await this.readAllDomains())
        .filter(
          (d) =>
            (d.status === 'verified' ||
              (d.status === 'pending' &&
                d.recheckFailures > 0 &&
                d.recheckFailures < MAX_AUTO_RECHECKS)) &&
            (d.lastCheckedAt === null || d.lastCheckedAt < cutoff),
        )
        .sort((a, b) => (a.lastCheckedAt ?? '').localeCompare(b.lastCheckedAt ?? ''))
        .slice(0, Math.max(0, Math.min(limit, 200)));
      const claimed: CustomDomain[] = [];
      for (const domain of due) {
        const next = { ...domain, lastCheckedAt: now };
        await this.writeJson(path.join(this.domainsDir, `${domain.id}.json`), next);
        claimed.push(next);
      }
      return claimed;
    });
  }

  releaseClaim(domain: CustomDomain, checkedAt: Date): Promise<void> {
    return this.withLock(async () => {
      const target = (await this.readAllDomains()).find((d) => d.id === domain.id);
      if (!target || target.lastCheckedAt !== domain.lastCheckedAt) return;
      await this.writeJson(path.join(this.domainsDir, `${target.id}.json`), {
        ...target,
        lastCheckedAt: checkedAt.toISOString(),
      });
    });
  }

  recordRecheck(
    domainId: string,
    outcome: RecheckOutcome,
    error: string | null,
    revokeAfter: number,
  ): Promise<RecheckResult> {
    return this.withLock(async () => {
      const all = await this.readAllDomains();
      const target = all.find((d) => d.id === domainId);
      if (
        !target ||
        !(
          target.status === 'verified' ||
          (target.status === 'pending' && target.recheckFailures > 0)
        )
      ) {
        return 'skipped';
      }
      const file = path.join(this.domainsDir, `${target.id}.json`);
      const message = error === null ? null : error.slice(0, 500);
      if (outcome === 'unknown') {
        await this.writeJson(file, { ...target, lastError: message });
        return 'unknown';
      }
      if (outcome === 'ok') {
        if (target.status === 'verified') {
          await this.writeJson(file, { ...target, recheckFailures: 0, lastError: null });
          return 'kept';
        }
        const taken = all.some(
          (d) => d.id !== target.id && d.hostname === target.hostname && d.status === 'verified',
        );
        if (taken) {
          await this.writeJson(file, {
            ...target,
            recheckFailures: 0,
            lastError: 'The TXT record is back, but another funnel has verified this hostname.',
          });
          return 'taken';
        }
        await this.writeJson(file, {
          ...target,
          status: 'verified',
          verifiedAt: new Date().toISOString(),
          recheckFailures: 0,
          lastError: null,
        });
        return 'restored';
      }
      const failures = Math.min(target.recheckFailures + 1, 1000);
      if (target.status === 'pending') {
        await this.writeJson(file, { ...target, recheckFailures: failures, lastError: message });
        return 'still_missing';
      }
      if (failures >= Math.max(revokeAfter, 1)) {
        await this.writeJson(file, {
          ...target,
          status: 'pending',
          verifiedAt: null,
          recheckFailures: failures,
          lastError: message,
        });
        return 'revoked';
      }
      await this.writeJson(file, { ...target, recheckFailures: failures, lastError: message });
      return 'warned';
    });
  }

  async releaseStaleClaim(
    hostname: string,
    stillOwned: (token: string) => Promise<boolean>,
  ): Promise<boolean> {
    const claim = (await this.readAllDomains()).find(
      (d) => d.hostname === hostname && d.status === 'verified',
    );
    if (!claim || (await stillOwned(claim.verificationToken))) return false;
    return this.withLock(async () => {
      const current = (await this.readAllDomains()).find((d) => d.id === claim.id);
      if (!current || current.status !== 'verified') return false;
      await this.writeJson(path.join(this.domainsDir, `${current.id}.json`), {
        ...current,
        status: 'pending',
        verifiedAt: null,
        lastCheckedAt: new Date().toISOString(),
        lastError: STALE_CLAIM_MESSAGE,
        recheckFailures: 0,
      });
      return true;
    });
  }

  async removeDomain(funnelId: string, domainId: string): Promise<void> {
    return this.withLock(async () => {
      const domain = await this.getDomain(funnelId, domainId);
      if (!domain) throw new DomainNotFoundError(`Domain "${domainId}" not found.`);
      await rm(path.join(this.domainsDir, `${domain.id}.json`), { force: true });
    });
  }

  async rollback(funnelId: string, versionId: string): Promise<Funnel> {
    return this.withLock(async () => {
      const funnel = await this.requireFunnel(funnelId);
      const raw = SAFE_ID.test(versionId)
        ? await this.readJson(path.join(this.versionsDir, `${versionId}.json`))
        : null;
      if (!isRecord(raw) || raw.funnelId !== funnelId) {
        throw new FunnelNotFoundError(`Version "${versionId}" not found for funnel "${funnelId}".`);
      }
      if (!parseStoredDefinition(raw.definition)) {
        throw new VersionUnreadableError(
          `Version "${versionId}" does not parse with the current schema and cannot be made live.`,
        );
      }
      const updated: Funnel = { ...funnel, status: 'published', publishedVersionId: versionId };
      await this.writeJson(path.join(this.funnelsDir, `${funnelId}.json`), updated);
      return updated;
    });
  }

  async aiProjectId(groupId: string | null = null): Promise<string> {
    if (groupId !== null) await this.requireGroup(groupId);
    return 'local';
  }

  async recordAiUsage(record: AiUsageRecord): Promise<void> {
    await mkdir(path.dirname(this.aiUsageFile), { recursive: true });
    const line = JSON.stringify({ ...record, createdAt: new Date().toISOString() });
    await appendFile(this.aiUsageFile, `${line}\n`, 'utf8');
  }

  async aiSpendSince(projectId: string, since: Date): Promise<number> {
    let text: string;
    try {
      text = await readFile(this.aiUsageFile, 'utf8');
    } catch (error) {
      if (isNotFound(error)) return 0;
      throw error;
    }
    let total = 0;
    for (const line of text.split('\n')) {
      if (line.trim() === '') continue;
      try {
        const row = JSON.parse(line) as {
          projectId?: string;
          createdAt?: string;
          costMicroUsd?: number;
        };
        if (row.projectId !== projectId || !row.createdAt) continue;
        if (new Date(row.createdAt) < since) continue;
        total += typeof row.costMicroUsd === 'number' ? row.costMicroUsd : 0;
      } catch {
        continue;
      }
    }
    return total;
  }

  async storeAsset(asset: NewAsset): Promise<Asset> {
    const id = randomUUID();
    const dir = path.join(this.assetsDir, asset.projectId);
    await mkdir(dir, { recursive: true });
    await writeFile(path.join(dir, `${id}.webp`), asset.data);
    const stored: Asset = {
      id,
      projectId: asset.projectId,
      funnelId: asset.funnelId,
      url: `/api/assets/file/${encodeURIComponent(asset.projectId)}/${id}.webp`,
      width: asset.width,
      height: asset.height,
      bytes: asset.data.byteLength,
      source: asset.source,
      prompt: asset.prompt,
      createdAt: new Date().toISOString(),
    };
    await appendFile(
      path.join(this.assetsDir, 'index.jsonl'),
      `${JSON.stringify(stored)}\n`,
      'utf8',
    );
    return stored;
  }

  async listAssets(projectId: string): Promise<Asset[]> {
    let text: string;
    try {
      text = await readFile(path.join(this.assetsDir, 'index.jsonl'), 'utf8');
    } catch (error) {
      if (isNotFound(error)) return [];
      throw error;
    }
    const out: Asset[] = [];
    for (const line of text.split('\n')) {
      if (line.trim() === '') continue;
      try {
        const row = JSON.parse(line) as Asset;
        if (row.projectId === projectId) out.push(row);
      } catch {
        continue;
      }
    }
    return out.reverse().slice(0, MAX_LISTED_ASSETS);
  }

  async readAssetFile(projectId: string, file: string): Promise<Buffer | null> {
    if (!/^[A-Za-z0-9_-]{1,100}$/.test(projectId) || !/^[0-9a-f-]{36}\.webp$/.test(file)) {
      return null;
    }
    try {
      return await readFile(path.join(this.assetsDir, projectId, file));
    } catch (error) {
      if (isNotFound(error)) return null;
      throw error;
    }
  }

  async createFunnel(
    name: string,
    slug: string,
    groupId: string | null = null,
    initial?: FunnelDefinition,
    aiDraftExpiresAt?: Date,
  ): Promise<Funnel> {
    return this.withLock(async () => {
      if (groupId !== null) await this.requireGroup(groupId);
      const existing = await this.listFunnels();
      if (existing.some((f) => f.slug === slug)) throw new SlugTakenError(slug);
      const id = randomUUID();
      const definition = initial ?? createStarterFunnel();
      const funnel: Funnel = {
        id,
        projectId: 'local',
        groupId,
        slug,
        name,
        status: 'draft',
        draftVersionId: `${id}-draft`,
        publishedVersionId: null,
        draftRevision: 1,
        aiDraftExpiresAt: aiDraftExpiresAt ? aiDraftExpiresAt.toISOString() : null,
      };
      const draft: FunnelVersion = {
        id: funnel.draftVersionId,
        funnelId: id,
        version: 0,
        schemaVersion: definition.schemaVersion,
        createdAt: new Date().toISOString(),
        definition,
      };
      await this.writeJson(path.join(this.draftsDir, `${id}.json`), draft);
      await this.writeJson(path.join(this.funnelsDir, `${id}.json`), funnel);
      return funnel;
    });
  }

  async markFunnelOpened(funnelId: string): Promise<void> {
    return this.withLock(async () => {
      const funnel = await this.requireFunnel(funnelId);
      if (!funnel.aiDraftExpiresAt) return;
      const updated: Funnel = { ...funnel, aiDraftExpiresAt: null };
      await this.writeJson(path.join(this.funnelsDir, `${funnelId}.json`), updated);
    });
  }

  async deleteExpiredAiDrafts(funnelIds: string[], now: Date): Promise<string[]> {
    const wanted = new Set(funnelIds);
    return this.withLock(async () => {
      const expired = (await this.listFunnels()).filter(
        (f) =>
          wanted.has(f.id) &&
          f.status === 'draft' &&
          f.aiDraftExpiresAt &&
          new Date(f.aiDraftExpiresAt) <= now,
      );
      for (const funnel of expired) await this.removeFunnelFiles(funnel.id);
      return expired.map((f) => f.id);
    });
  }

  async deleteFunnel(funnelId: string): Promise<void> {
    return this.withLock(async () => {
      await this.requireFunnel(funnelId);
      await this.removeFunnelFiles(funnelId);
    });
  }

  private async removeFunnelFiles(funnelId: string): Promise<void> {
    const versions = await this.listVersionSummaries(funnelId);
    for (const version of versions) {
      await rm(path.join(this.versionsDir, `${version.id}.json`), { force: true });
    }
    for (const domain of (await this.readAllDomains()).filter((d) => d.funnelId === funnelId)) {
      await rm(path.join(this.domainsDir, `${domain.id}.json`), { force: true });
    }
    await rm(path.join(this.draftsDir, `${funnelId}.json`), { force: true });
    await rm(path.join(this.funnelsDir, `${funnelId}.json`), { force: true });
  }

  async moveFunnel(funnelId: string, groupId: string | null): Promise<Funnel> {
    return this.withLock(async () => {
      const funnel = await this.requireFunnel(funnelId);
      if (groupId !== null) await this.requireGroup(groupId);
      const updated: Funnel = { ...funnel, groupId };
      await this.writeJson(path.join(this.funnelsDir, `${funnelId}.json`), updated);
      return updated;
    });
  }

  async listGroups(): Promise<FunnelGroup[]> {
    await this.init();
    const files = (await readdir(this.groupsDir)).filter((f) => f.endsWith('.json'));
    const groups: FunnelGroup[] = [];
    for (const file of files) {
      const fullPath = path.join(this.groupsDir, file);
      const raw = await this.readJson(fullPath);
      if (raw === null) continue;
      const parsed = groupFileSchema.safeParse(raw);
      if (parsed.success) groups.push(parsed.data);
      else this.report(fullPath, parsed.error.message);
    }
    return groups.sort((a, b) => a.name.localeCompare(b.name));
  }

  async createGroup(name: string): Promise<FunnelGroup> {
    return this.withLock(async () => {
      await this.init();
      const group: FunnelGroup = {
        id: randomUUID(),
        projectId: 'local',
        name,
        createdAt: new Date().toISOString(),
      };
      await this.writeJson(path.join(this.groupsDir, `${group.id}.json`), group);
      return group;
    });
  }

  async renameGroup(groupId: string, name: string): Promise<FunnelGroup> {
    return this.withLock(async () => {
      const group = await this.requireGroup(groupId);
      const updated: FunnelGroup = { ...group, name };
      await this.writeJson(path.join(this.groupsDir, `${groupId}.json`), updated);
      return updated;
    });
  }

  async deleteGroup(groupId: string): Promise<void> {
    return this.withLock(async () => {
      await this.requireGroup(groupId);
      for (const funnel of await this.listFunnels()) {
        if (funnel.groupId !== groupId) continue;
        await this.writeJson(path.join(this.funnelsDir, `${funnel.id}.json`), {
          ...funnel,
          groupId: null,
        });
      }
      await rm(path.join(this.groupsDir, `${groupId}.json`), { force: true });
    });
  }

  private async requireGroup(id: string): Promise<FunnelGroup> {
    await this.init();
    if (!SAFE_ID.test(id)) throw new GroupNotFoundError(`Project "${id}" not found.`);
    const file = path.join(this.groupsDir, `${id}.json`);
    const raw = await this.readJson(file);
    const parsed = raw === null ? null : groupFileSchema.safeParse(raw);
    if (!parsed?.success) throw new GroupNotFoundError(`Project "${id}" not found.`);
    return parsed.data;
  }

  private async getVersion(versionId: string): Promise<FunnelVersion | null> {
    if (!SAFE_ID.test(versionId)) return null;
    return this.readVersionFile(path.join(this.versionsDir, `${versionId}.json`));
  }

  async listVersionSummaries(funnelId: string): Promise<VersionSummary[]> {
    await this.init();
    const files = (await readdir(this.versionsDir)).filter((f) => f.endsWith('.json'));
    const versions: VersionSummary[] = [];
    for (const file of files) {
      const fullPath = path.join(this.versionsDir, file);
      const raw = await this.readJson(fullPath);
      if (raw === null) continue;
      const parsed = versionSummarySchema.safeParse(raw);
      if (!parsed.success) {
        this.report(fullPath, parsed.error.message);
        continue;
      }
      if (parsed.data.funnelId === funnelId) versions.push(parsed.data);
    }
    return versions.sort((a, b) => b.version - a.version);
  }

  private async requireFunnel(id: string): Promise<Funnel> {
    const funnel = await this.getFunnel(id);
    if (!funnel) throw new FunnelNotFoundError(`Funnel "${id}" not found.`);
    return funnel;
  }
}
