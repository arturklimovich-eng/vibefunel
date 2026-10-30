import 'server-only';
import { createHmac, randomBytes } from 'node:crypto';

const MAX_NONCES = 8;
const NONCE_PATTERN = /^[a-f0-9]{32}$/;

export const PAYER_HASH_PATTERN = /^[a-f0-9]{64}$/;

export function runTokenSecret(): string | null {
  const secret = process.env.RUN_TOKEN_SECRET;
  return secret && secret.length >= 16 ? secret : null;
}

export function runCookieName(runId: string): string {
  return `fp_run_${runId}`;
}

export function newPayerNonce(): string {
  return randomBytes(16).toString('hex');
}

export function payerHash(runId: string, screenId: string, nonce: string): string | null {
  const secret = runTokenSecret();
  if (!secret) return null;
  return createHmac('sha256', secret).update(`${runId}:${screenId}:${nonce}`).digest('hex');
}

export function readCookie(request: Request, name: string): string | undefined {
  const header = request.headers.get('cookie');
  if (!header) return undefined;
  for (const part of header.split(';')) {
    const index = part.indexOf('=');
    if (index < 0) continue;
    if (part.slice(0, index).trim() === name) return part.slice(index + 1).trim();
  }
  return undefined;
}

function cookieNonces(value: string | undefined): string[] {
  return (value ?? '').split('.').filter((nonce) => NONCE_PATTERN.test(nonce));
}

export function mergeRunCookie(existing: string | undefined, nonce: string): string {
  const nonces = cookieNonces(existing);
  if (!nonces.includes(nonce)) nonces.push(nonce);
  return nonces.slice(-MAX_NONCES).join('.');
}

export function payerHashesFromRequest(
  request: Request,
  runId: string,
  screenId: string,
): string[] {
  const hashes: string[] = [];
  for (const nonce of cookieNonces(readCookie(request, runCookieName(runId)))) {
    const hash = payerHash(runId, screenId, nonce);
    if (hash !== null) hashes.push(hash);
  }
  return hashes;
}
