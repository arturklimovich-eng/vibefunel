import 'server-only';
import { createClient } from '@supabase/supabase-js';
import { requireSupabaseEnv } from '@/lib/storage-mode';

export class MissingServiceKeyError extends Error {
  constructor() {
    super('SUPABASE_SERVICE_ROLE_KEY must be set to record payment events.');
    this.name = 'MissingServiceKeyError';
  }
}

export function isMissingServiceKey(error: unknown): boolean {
  return error instanceof Error && error.name === 'MissingServiceKeyError';
}

export function createSupabaseServiceClient() {
  const { url } = requireSupabaseEnv();
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key) throw new MissingServiceKeyError();
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });
}
