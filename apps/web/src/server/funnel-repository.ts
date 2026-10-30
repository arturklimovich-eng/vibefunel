import type { Funnel, FunnelDefinition, FunnelVersion, ValidationIssue } from '@funnel/schema';
import type { DomainStatus } from '@/lib/domains';

export class FunnelNotFoundError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'FunnelNotFoundError';
  }
}

export class FunnelValidationError extends Error {
  readonly issues: ValidationIssue[];
  constructor(issues: ValidationIssue[]) {
    super('Funnel definition failed validation.');
    this.name = 'FunnelValidationError';
    this.issues = issues;
  }
}

export class RevisionConflictError extends Error {
  readonly currentRevision: number;
  constructor(currentRevision: number) {
    super('The draft was changed elsewhere.');
    this.name = 'RevisionConflictError';
    this.currentRevision = currentRevision;
  }
}

export class SlugTakenError extends Error {
  constructor(slug: string) {
    super(`Slug "${slug}" is already taken.`);
    this.name = 'SlugTakenError';
  }
}

export class VersionUnreadableError extends Error {
  readonly reason: string;
  constructor(reason: string) {
    super(reason);
    this.name = 'VersionUnreadableError';
    this.reason = reason;
  }
}

export class ForbiddenError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ForbiddenError';
  }
}

export class DefinitionInvalidError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'DefinitionInvalidError';
  }
}

export class DomainTakenError extends Error {
  constructor(hostname: string) {
    super(`Domain "${hostname}" is already claimed.`);
    this.name = 'DomainTakenError';
  }
}

export class DomainLimitError extends Error {
  constructor(limit: number) {
    super(`A funnel can have at most ${limit} domains.`);
    this.name = 'DomainLimitError';
  }
}

export class DomainNotFoundError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'DomainNotFoundError';
  }
}

export interface CustomDomain {
  id: string;
  projectId: string;
  funnelId: string;
  hostname: string;
  status: DomainStatus;
  verificationToken: string;
  verifiedAt: string | null;
  lastCheckedAt: string | null;
  lastError: string | null;
  recheckFailures: number;
  createdAt: string;
}

export interface DomainCheck {
  verified: boolean;
  error: string | null;
}

export interface FunnelDraft extends FunnelVersion {
  revision: number;
}

export interface VersionSummary {
  id: string;
  funnelId: string;
  version: number;
  createdAt: string;
}

export interface PublishedFunnel {
  funnelId: string;
  projectId: string;
  slug: string;
  version: number;
  definition: FunnelDefinition;
}

export interface FunnelRepository {
  listFunnels(): Promise<Funnel[]>;
  getFunnel(id: string): Promise<Funnel | null>;
  getDraft(funnelId: string): Promise<FunnelDraft | null>;
  saveDraft(
    funnelId: string,
    definition: FunnelDefinition,
    expectedRevision: number,
  ): Promise<FunnelDraft>;
  publish(funnelId: string, expectedRevision: number): Promise<FunnelVersion>;
  rollback(funnelId: string, versionId: string): Promise<Funnel>;
  listVersionSummaries(funnelId: string): Promise<VersionSummary[]>;
  createFunnel(name: string, slug: string): Promise<Funnel>;
  deleteFunnel(funnelId: string): Promise<void>;
  listDomains(funnelId: string): Promise<CustomDomain[]>;
  getDomain(funnelId: string, domainId: string): Promise<CustomDomain | null>;
  addDomain(funnelId: string, hostname: string): Promise<CustomDomain>;
  recordDomainCheck(funnelId: string, domainId: string, check: DomainCheck): Promise<CustomDomain>;
  releaseStaleClaim(
    hostname: string,
    stillOwned: (token: string) => Promise<boolean>,
  ): Promise<boolean>;
  removeDomain(funnelId: string, domainId: string): Promise<void>;
}

export type RecheckOutcome = 'ok' | 'missing' | 'unknown';

export type RecheckResult =
  'kept' | 'restored' | 'taken' | 'warned' | 'revoked' | 'still_missing' | 'unknown' | 'skipped';

export const MAX_AUTO_RECHECKS = 30;

export interface DomainMaintenance {
  claimDueDomains(checkedBefore: Date, limit: number): Promise<CustomDomain[]>;
  recordRecheck(
    domainId: string,
    outcome: RecheckOutcome,
    error: string | null,
    revokeAfter: number,
  ): Promise<RecheckResult>;
  releaseClaim(domain: CustomDomain, checkedAt: Date): Promise<void>;
}

export interface PublishedReader {
  getPublishedBySlug(slug: string): Promise<PublishedFunnel | null>;
  getPublishedByHost(hostname: string): Promise<PublishedFunnel | null>;
  isHostServable(hostname: string): Promise<boolean>;
}
