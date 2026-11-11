import 'server-only';
import type { SupabaseClient } from '@supabase/supabase-js';
import { z } from 'zod';
import { TokenLimitError, toScopes } from './tokens';
import type { ApiToken, ApiTokenStore, NewApiToken, ResolvedToken } from './tokens';

const COLUMNS = 'id, name, scopes, created_at, last_used_at';
const PROGRAM_LIMIT_EXCEEDED = '54000';

const rowSchema = z.object({
  id: z.string(),
  name: z.string(),
  scopes: z.array(z.string()),
  created_at: z.string(),
  last_used_at: z.string().nullable(),
});

const resolvedSchema = z.object({
  token_id: z.string(),
  user_id: z.string(),
  scopes: z.array(z.string()),
});

function toToken(row: z.infer<typeof rowSchema>): ApiToken {
  return {
    id: row.id,
    name: row.name,
    scopes: toScopes(row.scopes),
    createdAt: row.created_at,
    lastUsedAt: row.last_used_at,
  };
}

export class SupabaseApiTokenStore implements ApiTokenStore {
  constructor(private readonly client: SupabaseClient) {}

  async list(): Promise<ApiToken[]> {
    const { data, error } = await this.client
      .from('api_tokens')
      .select(COLUMNS)
      .is('revoked_at', null)
      .order('created_at', { ascending: false });
    if (error) throw new Error(`api token list failed: ${error.message}`);
    return z.array(rowSchema).parse(data).map(toToken);
  }

  async create(input: NewApiToken, tokenHash: string): Promise<ApiToken> {
    const { data, error } = await this.client.rpc('create_api_token', {
      p_name: input.name,
      p_hash: tokenHash,
      p_scopes: input.scopes,
    });
    if (error?.code === PROGRAM_LIMIT_EXCEEDED) throw new TokenLimitError();
    if (error) throw new Error(`api token create failed: ${error.message}`);
    const row = z.array(rowSchema).parse(data)[0];
    if (!row) throw new Error('api token create returned no row');
    return toToken(row);
  }

  async revoke(id: string): Promise<boolean> {
    if (!z.uuid().safeParse(id).success) return false;
    const { data, error } = await this.client
      .from('api_tokens')
      .update({ revoked_at: new Date().toISOString() })
      .eq('id', id)
      .is('revoked_at', null)
      .select('id');
    if (error) throw new Error(`api token revoke failed: ${error.message}`);
    return (data ?? []).length > 0;
  }
}

export async function resolveSupabaseToken(
  anon: SupabaseClient,
  tokenHash: string,
): Promise<ResolvedToken | null> {
  const { data, error } = await anon.rpc('resolve_api_token', { p_hash: tokenHash });
  if (error) throw new Error(`api token resolve failed: ${error.message}`);
  const row = z.array(resolvedSchema).parse(data)[0];
  if (!row) return null;
  return { tokenId: row.token_id, userId: row.user_id, scopes: toScopes(row.scopes) };
}
