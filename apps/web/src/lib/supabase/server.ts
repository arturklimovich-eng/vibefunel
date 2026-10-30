import 'server-only';
import { createServerClient } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import { requireSupabaseEnv } from '@/lib/storage-mode';
import { SESSION_COOKIE_OPTIONS } from './cookie-options';

export async function createSupabaseServerClient() {
  const { url, anonKey } = requireSupabaseEnv();
  const cookieStore = await cookies();
  return createServerClient(url, anonKey, {
    cookieOptions: SESSION_COOKIE_OPTIONS,
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          for (const { name, value, options } of cookiesToSet) {
            cookieStore.set(name, value, options);
          }
        } catch (error) {
          const readonlyContext =
            error instanceof Error &&
            error.message.startsWith(
              'Cookies can only be modified in a Server Action or Route Handler',
            );
          if (!readonlyContext) throw error;
        }
      },
    },
  });
}

export function createSupabaseAnonClient() {
  const { url, anonKey } = requireSupabaseEnv();
  return createClient(url, anonKey, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });
}
