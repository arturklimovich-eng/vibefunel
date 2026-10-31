import { createHash, timingSafeEqual } from 'node:crypto';
import { NextResponse } from 'next/server';
import { normalizeHostname, stripPort } from '@/lib/hostname';
import { checkRateLimit, clientKey, ipLimit } from '@/server/rate-limit';
import { isPlatformHost } from '@/server/platform-host';
import { getPublishedReader } from '@/server/repository';

export const dynamic = 'force-dynamic';

const NO_STORE = { 'cache-control': 'no-store' };

function rateLimited(retryAfterSeconds: number): NextResponse {
  return NextResponse.json(
    { error: 'rate_limited' },
    { status: 429, headers: { ...NO_STORE, 'retry-after': String(retryAfterSeconds) } },
  );
}

function askSecretMatches(provided: string | null): boolean {
  const configured = process.env.CUSTOM_DOMAIN_ASK_SECRET ?? '';
  if (configured === '' || provided === null) return false;
  const a = createHash('sha256').update(configured).digest();
  const b = createHash('sha256').update(provided).digest();
  return timingSafeEqual(a, b);
}

export async function GET(request: Request) {
  const params = new URL(request.url).searchParams;
  const trustedAsk = askSecretMatches(params.get('secret'));
  if (!trustedAsk) {
    const limit = checkRateLimit(
      'serve-check',
      clientKey(request),
      ipLimit(request, 600, 300),
      60_000,
    );
    if (!limit.ok) return rateLimited(limit.retryAfterSeconds);
  }
  const raw = (params.get('domain') ?? '').trim().toLowerCase();
  if (raw !== '' && isPlatformHost(stripPort(raw))) {
    return NextResponse.json({ ok: true }, { headers: NO_STORE });
  }
  const hostname = normalizeHostname(raw);
  if (hostname === null) {
    return NextResponse.json(
      { ok: false, error: 'invalid_hostname' },
      { status: 400, headers: NO_STORE },
    );
  }
  const perDomain = checkRateLimit('serve-check-domain', hostname, 120, 60_000);
  if (!perDomain.ok) return rateLimited(perDomain.retryAfterSeconds);
  const servable = await getPublishedReader().isHostServable(hostname);
  if (!servable) {
    return NextResponse.json(
      { ok: false, error: 'unknown_domain' },
      { status: 404, headers: NO_STORE },
    );
  }
  return NextResponse.json({ ok: true }, { headers: NO_STORE });
}
