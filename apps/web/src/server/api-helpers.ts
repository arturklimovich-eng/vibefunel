import 'server-only';
import { NextResponse } from 'next/server';
import type {
  DefinitionInvalidError,
  FunnelValidationError,
  RevisionConflictError,
  VersionUnreadableError,
} from './funnel-repository';
import { getStudioContext } from './repository';
import type { StudioContext } from './repository';

function isNamed<T extends Error>(error: unknown, name: string): error is T {
  return error instanceof Error && error.name === name;
}

function mapRepositoryError(error: unknown): NextResponse | null {
  if (isNamed(error, 'FunnelNotFoundError')) {
    return NextResponse.json({ error: 'not_found' }, { status: 404 });
  }
  if (isNamed<FunnelValidationError>(error, 'FunnelValidationError')) {
    return NextResponse.json({ error: 'validation_failed', issues: error.issues }, { status: 400 });
  }
  if (isNamed<RevisionConflictError>(error, 'RevisionConflictError')) {
    return NextResponse.json(
      { error: 'revision_conflict', currentRevision: error.currentRevision },
      { status: 409 },
    );
  }
  if (isNamed(error, 'ForbiddenError')) {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  }
  if (isNamed<DefinitionInvalidError>(error, 'DefinitionInvalidError')) {
    return NextResponse.json(
      {
        error: 'schema_invalid',
        issues: [{ code: 'schema_invalid', severity: 'error', message: error.message }],
      },
      { status: 400 },
    );
  }
  if (isNamed<VersionUnreadableError>(error, 'VersionUnreadableError')) {
    return NextResponse.json(
      { error: 'version_unreadable', reason: error.reason },
      { status: 409 },
    );
  }
  if (isNamed(error, 'SlugTakenError')) {
    return NextResponse.json({ error: 'slug_taken' }, { status: 409 });
  }
  if (isNamed(error, 'DomainTakenError')) {
    return NextResponse.json({ error: 'domain_taken' }, { status: 409 });
  }
  if (isNamed(error, 'DomainLimitError')) {
    return NextResponse.json({ error: 'domain_limit' }, { status: 409 });
  }
  if (isNamed(error, 'DomainNotFoundError')) {
    return NextResponse.json({ error: 'not_found' }, { status: 404 });
  }
  if (isNamed(error, 'MissingServiceKeyError') || isNamed(error, 'DnsConfigError')) {
    return NextResponse.json({ error: 'not_configured' }, { status: 503 });
  }
  return null;
}

export async function withStudio(
  run: (context: StudioContext) => Promise<Response>,
): Promise<Response> {
  const context = await getStudioContext();
  if (!context) return NextResponse.json({ error: 'unauthenticated' }, { status: 401 });
  try {
    return await run(context);
  } catch (error) {
    const mapped = mapRepositoryError(error);
    if (mapped) return mapped;
    throw error;
  }
}
