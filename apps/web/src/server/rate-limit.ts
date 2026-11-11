import 'server-only';

interface Bucket {
  count: number;
  resetAt: number;
}

export type LimitResult = { ok: true } | { ok: false; retryAfterSeconds: number };

export class RateLimiter {
  private readonly buckets = new Map<string, Bucket>();

  constructor(private readonly maxBuckets: number) {}

  private live(id: string, now: number): Bucket | null {
    const current = this.buckets.get(id);
    if (!current) return null;
    if (current.resetAt <= now) {
      this.buckets.delete(id);
      return null;
    }
    return current;
  }

  peek(name: string, key: string, limit: number, now: number = Date.now()): LimitResult {
    const current = this.live(`${name}:${key}`, now);
    if (current && current.count >= limit) {
      return {
        ok: false,
        retryAfterSeconds: Math.max(1, Math.ceil((current.resetAt - now) / 1000)),
      };
    }
    return { ok: true };
  }

  private nextSweepAt = 0;

  private makeRoom(now: number): void {
    if (this.buckets.size < this.maxBuckets) return;
    if (now >= this.nextSweepAt) {
      this.nextSweepAt = now + 1000;
      for (const [id, bucket] of this.buckets) {
        if (bucket.resetAt <= now) this.buckets.delete(id);
      }
      if (this.buckets.size < this.maxBuckets) return;
    }
    const batch = Math.max(1, Math.ceil(this.maxBuckets * 0.05));
    let removed = 0;
    let floor = -1;
    for (let round = 0; round < 3 && removed < batch && this.buckets.size > 0; round += 1) {
      let lowest = Number.POSITIVE_INFINITY;
      for (const bucket of this.buckets.values()) {
        if (bucket.count > floor && bucket.count < lowest) lowest = bucket.count;
        if (lowest <= Math.max(floor + 1, 1)) break;
      }
      if (lowest === Number.POSITIVE_INFINITY) break;
      for (const [id, bucket] of this.buckets) {
        if (removed >= batch) break;
        if (bucket.count <= lowest) {
          this.buckets.delete(id);
          removed += 1;
        }
      }
      floor = lowest;
    }
  }

  hit(name: string, key: string, windowMs: number, now: number = Date.now()): void {
    const id = `${name}:${key}`;
    const current = this.live(id, now);
    if (current) {
      current.count += 1;
      return;
    }
    this.makeRoom(now);
    this.buckets.set(id, { count: 1, resetAt: now + windowMs });
  }

  release(name: string, key: string, now: number = Date.now()): void {
    const current = this.live(`${name}:${key}`, now);
    if (current && current.count > 0) current.count -= 1;
  }

  check(
    name: string,
    key: string,
    limit: number,
    windowMs: number,
    now: number = Date.now(),
  ): LimitResult {
    const blocked = this.peek(name, key, limit, now);
    if (!blocked.ok) return blocked;
    this.hit(name, key, windowMs, now);
    return { ok: true };
  }
}

const defaultLimiter = new RateLimiter(5000);

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
  return clientKeyFromHeaders(request.headers);
}

export function clientKeyFromHeaders(headers: Headers): string {
  const hops = trustedHops();
  if (hops === 0) return DIRECT_KEY;
  const header = clientIpHeader();
  if (header !== null) {
    const value = headers.get(header)?.trim();
    if (value) return value;
  }
  const forwarded = headers.get('x-forwarded-for');
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
): LimitResult {
  return defaultLimiter.check(name, key, limit, windowMs, now);
}

export function ipLimit(request: Request, direct: number, trusted: number): number {
  return clientKey(request) === DIRECT_KEY ? direct : trusted;
}

export function peekRateLimit(name: string, key: string, limit: number): LimitResult {
  return defaultLimiter.peek(name, key, limit);
}

export function recordRateLimitHit(name: string, key: string, windowMs: number): void {
  defaultLimiter.hit(name, key, windowMs);
}
