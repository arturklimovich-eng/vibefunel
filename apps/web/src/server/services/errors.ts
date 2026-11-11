import type { ValidationIssue } from '@funnel/schema';
import type {
  DefinitionInvalidError,
  FunnelValidationError,
  RevisionConflictError,
  VersionUnreadableError,
} from '../funnel-repository';

export type ServiceErrorCode =
  | 'not_found'
  | 'validation_failed'
  | 'revision_conflict'
  | 'forbidden'
  | 'schema_invalid'
  | 'version_unreadable'
  | 'slug_taken'
  | 'domain_taken'
  | 'domain_limit'
  | 'not_configured'
  | 'unknown_plan'
  | 'patch_invalid'
  | 'token_limit'
  | 'feature_disabled';

export class ServiceError extends Error {
  constructor(
    readonly code: ServiceErrorCode,
    message: string,
    readonly details: Record<string, unknown> = {},
  ) {
    super(message);
    this.name = 'ServiceError';
  }
}

export interface DescribedError {
  status: number;
  code: ServiceErrorCode;
  message: string;
  details: Record<string, unknown>;
}

const STATUS: Record<ServiceErrorCode, number> = {
  not_found: 404,
  validation_failed: 400,
  revision_conflict: 409,
  forbidden: 403,
  schema_invalid: 400,
  version_unreadable: 409,
  slug_taken: 409,
  domain_taken: 409,
  domain_limit: 409,
  not_configured: 503,
  unknown_plan: 400,
  patch_invalid: 400,
  token_limit: 409,
  feature_disabled: 404,
};

function isNamed<T extends Error>(error: unknown, name: string): error is T {
  return error instanceof Error && error.name === name;
}

function described(
  code: ServiceErrorCode,
  message: string,
  details: Record<string, unknown> = {},
): DescribedError {
  return { status: STATUS[code], code, message, details };
}

export function describeError(error: unknown): DescribedError | null {
  if (error instanceof ServiceError) return described(error.code, error.message, error.details);
  if (isNamed(error, 'FunnelNotFoundError')) return described('not_found', 'Funnel not found.');
  if (isNamed<FunnelValidationError>(error, 'FunnelValidationError')) {
    return described('validation_failed', error.message, { issues: error.issues });
  }
  if (isNamed<RevisionConflictError>(error, 'RevisionConflictError')) {
    return described('revision_conflict', 'The draft was changed elsewhere. Read it again.', {
      currentRevision: error.currentRevision,
    });
  }
  if (isNamed(error, 'ForbiddenError')) return described('forbidden', 'Not allowed.');
  if (isNamed<DefinitionInvalidError>(error, 'DefinitionInvalidError')) {
    const issues: ValidationIssue[] = [
      { code: 'schema_invalid', severity: 'error', message: error.message },
    ];
    return described('schema_invalid', error.message, { issues });
  }
  if (isNamed<VersionUnreadableError>(error, 'VersionUnreadableError')) {
    return described('version_unreadable', error.reason, { reason: error.reason });
  }
  if (isNamed(error, 'SlugTakenError')) return described('slug_taken', error.message);
  if (isNamed(error, 'DomainTakenError')) return described('domain_taken', error.message);
  if (isNamed(error, 'DomainLimitError')) return described('domain_limit', error.message);
  if (isNamed(error, 'DomainNotFoundError') || isNamed(error, 'GroupNotFoundError')) {
    return described('not_found', error.message);
  }
  if (isNamed(error, 'TokenLimitError')) return described('token_limit', error.message);
  if (isNamed(error, 'MissingServiceKeyError') || isNamed(error, 'DnsConfigError')) {
    return described('not_configured', 'This deployment is missing configuration for it.');
  }
  return null;
}
