import 'server-only';
import { createHash, randomBytes } from 'node:crypto';
import { z } from 'zod';

export const API_TOKEN_SCOPES = ['read', 'write', 'publish', 'leads'] as const;
export type ApiTokenScope = (typeof API_TOKEN_SCOPES)[number];
export const MAX_ACTIVE_TOKENS = 20;
const TOKEN_PREFIX = 'fpk_';

export const apiTokenScopeSchema = z.enum(API_TOKEN_SCOPES);

export const newApiTokenSchema = z.object({
  name: z.string().trim().min(1).max(100),
  scopes: z
    .array(apiTokenScopeSchema)
    .min(1)
    .max(API_TOKEN_SCOPES.length)
    .transform((scopes) => API_TOKEN_SCOPES.filter((s) => scopes.includes(s))),
});
export type NewApiToken = z.infer<typeof newApiTokenSchema>;

export interface ApiToken {
  id: string;
  name: string;
  scopes: ApiTokenScope[];
  createdAt: string;
  lastUsedAt: string | null;
}

export interface ResolvedToken {
  tokenId: string;
  userId: string | null;
  scopes: ApiTokenScope[];
}

export class TokenLimitError extends Error {
  constructor() {
    super(`At most ${MAX_ACTIVE_TOKENS} active tokens per user.`);
    this.name = 'TokenLimitError';
  }
}

export interface ApiTokenStore {
  list(): Promise<ApiToken[]>;
  create(input: NewApiToken, tokenHash: string): Promise<ApiToken>;
  revoke(id: string): Promise<boolean>;
}

export function generateToken(): { token: string; hash: string } {
  const token = `${TOKEN_PREFIX}${randomBytes(32).toString('base64url')}`;
  return { token, hash: hashToken(token) };
}

export function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

export function looksLikeToken(value: string): boolean {
  return /^fpk_[A-Za-z0-9_-]{43}$/.test(value);
}

export function toScopes(values: readonly string[]): ApiTokenScope[] {
  return API_TOKEN_SCOPES.filter((s) => values.includes(s));
}
