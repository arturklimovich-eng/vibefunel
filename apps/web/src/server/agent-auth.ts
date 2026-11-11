import 'server-only';
import { createHmac } from 'node:crypto';
import { resolveStorageMode } from '@/lib/storage-mode';
import { createSupabaseAnonClient, createSupabaseBearerClient } from '@/lib/supabase/server';
import { resolveSupabaseToken } from './api-tokens/supabase-store';
import { hashToken, looksLikeToken } from './api-tokens/tokens';
import type { ApiTokenScope, ResolvedToken } from './api-tokens/tokens';
import { fileStudioContext, getFileApiTokenStore, supabaseStudioContext } from './repository';
import type { StudioContext } from './repository';

const RESOLVE_CACHE_MS = 30_000;
const RESOLVE_CACHE_MAX = 1000;
const ACCESS_TOKEN_TTL_SECONDS = 600;

export interface AgentContext {
  studio: StudioContext;
  tokenId: string;
  scopes: ApiTokenScope[];
}

export type AgentAuth =
  { ok: true; agent: AgentContext } | { ok: false; error: 'unauthenticated' | 'not_configured' };

const globalForAgents = globalThis as typeof globalThis & {
  agentTokenCache?: Map<string, { value: ResolvedToken | null; expiresAt: number }>;
};

function tokenCache() {
  if (!globalForAgents.agentTokenCache) globalForAgents.agentTokenCache = new Map();
  return globalForAgents.agentTokenCache;
}

export function agentAccessEnabled(): boolean {
  return process.env.AGENT_ACCESS === 'on';
}

export function agentAccessConfigured(): boolean {
  if (!agentAccessEnabled()) return false;
  return resolveStorageMode() === 'file' || Boolean(process.env.SUPABASE_JWT_SECRET);
}

export function forgetResolvedTokens(): void {
  tokenCache().clear();
}

function bearer(headers: Headers): string | null {
  const value = headers.get('authorization');
  const match = value?.match(/^Bearer\s+(\S+)$/i);
  return match?.[1] ?? null;
}

async function resolve(hash: string): Promise<ResolvedToken | null> {
  const cache = tokenCache();
  const now = Date.now();
  const hit = cache.get(hash);
  if (hit && hit.expiresAt > now) return hit.value;
  const value =
    resolveStorageMode() === 'file'
      ? await getFileApiTokenStore().resolve(hash)
      : await resolveSupabaseToken(createSupabaseAnonClient(), hash);
  if (cache.size >= RESOLVE_CACHE_MAX) {
    for (const [key, entry] of cache) if (entry.expiresAt <= now) cache.delete(key);
    if (cache.size >= RESOLVE_CACHE_MAX) cache.clear();
  }
  cache.set(hash, { value, expiresAt: now + RESOLVE_CACHE_MS });
  return value;
}

function mintAccessToken(userId: string, secret: string): string {
  const now = Math.floor(Date.now() / 1000);
  const encode = (value: object) => Buffer.from(JSON.stringify(value)).toString('base64url');
  const body = `${encode({ alg: 'HS256', typ: 'JWT' })}.${encode({
    aud: 'authenticated',
    role: 'authenticated',
    sub: userId,
    iat: now,
    exp: now + ACCESS_TOKEN_TTL_SECONDS,
    amr: [{ method: 'api_token', timestamp: now }],
  })}`;
  return `${body}.${createHmac('sha256', secret).update(body).digest('base64url')}`;
}

export async function authenticateAgent(headers: Headers): Promise<AgentAuth> {
  const secret = process.env.SUPABASE_JWT_SECRET;
  const storage = resolveStorageMode();
  if (storage === 'supabase' && !secret) return { ok: false, error: 'not_configured' };
  const token = bearer(headers);
  if (!token || !looksLikeToken(token)) return { ok: false, error: 'unauthenticated' };
  const resolved = await resolve(hashToken(token));
  if (!resolved) return { ok: false, error: 'unauthenticated' };
  if (storage === 'file' || !resolved.userId || !secret) {
    if (storage !== 'file') return { ok: false, error: 'unauthenticated' };
    return {
      ok: true,
      agent: { studio: fileStudioContext(), tokenId: resolved.tokenId, scopes: resolved.scopes },
    };
  }
  const client = createSupabaseBearerClient(mintAccessToken(resolved.userId, secret));
  return {
    ok: true,
    agent: {
      studio: supabaseStudioContext(client, resolved.userId, null),
      tokenId: resolved.tokenId,
      scopes: resolved.scopes,
    },
  };
}
