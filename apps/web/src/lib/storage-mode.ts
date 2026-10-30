export type StorageMode = 'file' | 'supabase';

export interface SupabaseEnv {
  url: string;
  anonKey: string;
}

export function readSupabaseEnv(): SupabaseEnv | null {
  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) return null;
  return { url, anonKey };
}

export function requireSupabaseEnv(): SupabaseEnv {
  const env = readSupabaseEnv();
  if (!env) {
    throw new Error('SUPABASE_URL and SUPABASE_ANON_KEY must be set to use Supabase storage.');
  }
  return env;
}

export function resolveStorageMode(): StorageMode {
  const configured = process.env.FUNNEL_STORAGE;
  const unset = configured === undefined || configured === '';
  if (process.env.NODE_ENV === 'production' && configured !== 'supabase') {
    throw new Error(
      'FUNNEL_STORAGE must be set to "supabase" in production; file storage is development only.',
    );
  }
  if (unset) {
    return readSupabaseEnv() ? 'supabase' : 'file';
  }
  if (configured === 'file') return 'file';
  if (configured === 'supabase') {
    requireSupabaseEnv();
    return 'supabase';
  }
  throw new Error(`FUNNEL_STORAGE must be "file" or "supabase", received "${configured}".`);
}
