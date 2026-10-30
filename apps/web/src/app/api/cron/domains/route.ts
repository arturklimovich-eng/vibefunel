import { NextResponse } from 'next/server';
import { isMissingServiceKey } from '@/lib/supabase/service';
import { cronAuthorized } from '@/server/cron-auth';
import { checkDomainOwnership, configuredDnsServers } from '@/server/domains/verify';
import type { CustomDomain, RecheckOutcome, RecheckResult } from '@/server/funnel-repository';
import { getDomainMaintenance } from '@/server/repository';

export const dynamic = 'force-dynamic';

const RECHECK_AFTER_MS = 24 * 60 * 60 * 1000;
const BATCH_LIMIT = 50;
const CONCURRENCY = 5;
const TIME_BUDGET_MS = 45_000;
const REVOKE_AFTER_FAILURES = 2;
const RETRY_AFTER_FAILURE_MS = 60 * 60 * 1000;
const NO_STORE = { 'cache-control': 'no-store' };

type Summary = Record<RecheckResult | 'failed', number> & { checked: number };

export async function POST(request: Request) {
  const allowed = cronAuthorized(request);
  if (allowed === false) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401, headers: NO_STORE });
  }
  if (allowed === null) {
    return NextResponse.json({ status: 'not_configured' }, { status: 503, headers: NO_STORE });
  }
  try {
    configuredDnsServers();
  } catch (error) {
    console.error('[domains] re-check skipped:', error instanceof Error ? error.message : error);
    return NextResponse.json({ status: 'dns_misconfigured' }, { status: 503, headers: NO_STORE });
  }
  const maintenance = getDomainMaintenance();
  const summary: Summary = {
    checked: 0,
    kept: 0,
    restored: 0,
    taken: 0,
    warned: 0,
    revoked: 0,
    still_missing: 0,
    unknown: 0,
    skipped: 0,
    failed: 0,
  };
  const deadline = Date.now() + TIME_BUDGET_MS;

  const fail = (domain: CustomDomain, error: unknown) => {
    summary.failed += 1;
    console.error(
      `[domains] re-check of ${domain.hostname} failed:`,
      error instanceof Error ? error.message : error,
    );
  };

  const recheck = async (domain: CustomDomain): Promise<boolean> => {
    let result: Awaited<ReturnType<typeof checkDomainOwnership>>;
    try {
      result = await checkDomainOwnership(domain.hostname, domain.verificationToken);
    } catch (error) {
      fail(domain, error);
      try {
        await maintenance.releaseClaim(
          domain,
          new Date(Date.now() - RECHECK_AFTER_MS + RETRY_AFTER_FAILURE_MS),
        );
      } catch (releaseError) {
        console.error(
          `[domains] could not release ${domain.hostname}:`,
          releaseError instanceof Error ? releaseError.message : releaseError,
        );
      }
      return false;
    }
    const outcome: RecheckOutcome =
      result.ownership === null ? 'unknown' : result.ownership ? 'ok' : 'missing';
    const error =
      outcome === 'missing'
        ? `Re-check: ${result.message ?? 'TXT record missing.'}`
        : result.message;
    try {
      const recorded = await maintenance.recordRecheck(
        domain.id,
        outcome,
        error,
        REVOKE_AFTER_FAILURES,
      );
      summary[recorded] += 1;
      if (recorded === 'revoked' || recorded === 'restored' || recorded === 'taken') {
        console.warn(`[domains] re-check ${recorded} ${domain.hostname}`);
      }
      return true;
    } catch (recordError) {
      fail(domain, recordError);
      return false;
    }
  };

  try {
    while (Date.now() < deadline) {
      const due = await maintenance.claimDueDomains(
        new Date(Date.now() - RECHECK_AFTER_MS),
        CONCURRENCY,
      );
      if (due.length === 0) break;
      summary.checked += due.length;
      const outcomes = await Promise.all(due.map(recheck));
      if (outcomes.every((ok) => !ok)) break;
      if (summary.checked >= BATCH_LIMIT) break;
    }
  } catch (error) {
    if (isMissingServiceKey(error)) {
      return NextResponse.json({ status: 'not_configured' }, { status: 503, headers: NO_STORE });
    }
    throw error;
  }
  return NextResponse.json(summary, { status: summary.failed > 0 ? 500 : 200, headers: NO_STORE });
}
