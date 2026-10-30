import 'server-only';
import { createHash, timingSafeEqual } from 'node:crypto';

export function cronAuthorized(request: Request): boolean | null {
  const secret = process.env.CRON_SECRET ?? '';
  if (secret.length < 16) return null;
  const header = request.headers.get('authorization') ?? '';
  const provided = header.startsWith('Bearer ') ? header.slice(7) : '';
  const a = createHash('sha256').update(secret).digest();
  const b = createHash('sha256').update(provided).digest();
  return timingSafeEqual(a, b);
}
