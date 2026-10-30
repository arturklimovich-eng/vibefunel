import 'server-only';

interface Bucket {
  count: number;
  resetAt: number;
}

const buckets = new Map<string, Bucket>();
const MAX_BUCKETS = 5000;

export const DIRECT_KEY = 'direct';

export function trustedHops(): number {
  const parsed = Number.parseInt(process.env.TRUST_PROXY_HOPS ?? '0', 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 0;
}

function clientIpHeader(): string | null {
  const name = (process.env.CLIENT_IP_HEADER ?? '').trim().toLowerCase();
  return /^[a-z0-9-]{1,64}$/.test(name) ? name : null;
}

export function clientKey(request: Request): string {
  const hops = trustedHops();
  if (hops === 0) return DIRECT_KEY;
  const header = clientIpHeader();
  if (header !== null) {
    const value = request.headers.get(header)?.trim();
    if (value) return value;
  }
  const forwarded = request.headers.get('x-forwarded-for');
  if (!forwarded) return DIRECT_KEY;
  const entries = forwarded
    .split(',')
    .map((entry) => entry.trim())
    .filter((entry) => entry.length > 0);
  if (entries.length === 0) return DIRECT_KEY;
  return entries[Math.max(0, entries.length - hops)] ?? DIRECT_KEY;
}

export function checkRateLimit(
  name: string,
  key: string,
  limit: number,
  windowMs: number,
  now: number = Date.now(),
): { ok: true } | { ok: false; retryAfterSeconds: number } {
  const id = `${name}:${key}`;
  const current = buckets.get(id);
  if (!current || current.resetAt <= now) {
    buckets.delete(id);
    while (buckets.size >= MAX_BUCKETS) {
      const oldest = buckets.keys().next();
      if (oldest.done) break;
      buckets.delete(oldest.value);
    }
    buckets.set(id, { count: 1, resetAt: now + windowMs });
    return { ok: true };
  }
  if (current.count >= limit) {
    return { ok: false, retryAfterSeconds: Math.max(1, Math.ceil((current.resetAt - now) / 1000)) };
  }
  current.count += 1;
  return { ok: true };
}

export function ipLimit(request: Request, direct: number, trusted: number): number {
  return clientKey(request) === DIRECT_KEY ? direct : trusted;
}
