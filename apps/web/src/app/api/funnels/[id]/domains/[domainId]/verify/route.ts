import { NextResponse } from 'next/server';
import { withStudio } from '@/server/api-helpers';
import { domainTarget } from '@/server/domains/target';
import { checkDomainDns } from '@/server/domains/verify';
import { toDomainView } from '@/server/domains/view';
import { checkRateLimit } from '@/server/payments/rate-limit';

export const dynamic = 'force-dynamic';

interface Context {
  params: Promise<{ id: string; domainId: string }>;
}

function isDomainTaken(error: unknown): boolean {
  return error instanceof Error && error.name === 'DomainTakenError';
}

export function POST(_request: Request, { params }: Context) {
  return withStudio(async ({ repo }) => {
    const { id, domainId } = await params;
    const domain = await repo.getDomain(id, domainId);
    if (!domain) return NextResponse.json({ error: 'not_found' }, { status: 404 });
    const limit = checkRateLimit('domain-verify', domain.id, 10, 60_000);
    if (!limit.ok) {
      return NextResponse.json(
        { error: 'rate_limited' },
        { status: 429, headers: { 'retry-after': String(limit.retryAfterSeconds) } },
      );
    }
    const target = domainTarget();
    const result = await checkDomainDns(domain.hostname, domain.verificationToken, target);
    const check = {
      verified: result.ownership === null ? domain.status === 'verified' : result.ownership,
      error: result.message,
    };
    let updated;
    try {
      updated = await repo.recordDomainCheck(id, domainId, check);
    } catch (error) {
      if (!isDomainTaken(error) || !check.verified) throw error;
      const released = await repo.releaseStaleClaim(domain.hostname, async (token) => {
        const previous = await checkDomainDns(domain.hostname, token, target);
        return previous.ownership !== false;
      });
      if (!released) throw error;
      updated = await repo.recordDomainCheck(id, domainId, check);
    }
    return NextResponse.json({
      domain: toDomainView(updated),
      ownership: result.ownership,
      routing: result.routing,
      message: result.message,
    });
  });
}
