import { createServerClient } from '@supabase/ssr';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { requireSupabaseEnv } from '@/lib/storage-mode';
import { SESSION_COOKIE_OPTIONS } from './cookie-options';

export interface SessionResult {
  response: NextResponse;
  authenticated: boolean;
}

export async function updateSession(request: NextRequest): Promise<SessionResult> {
  const { url, anonKey } = requireSupabaseEnv();
  let response = NextResponse.next({ request });
  const supabase = createServerClient(url, anonKey, {
    cookieOptions: SESSION_COOKIE_OPTIONS,
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet, headers) {
        for (const { name, value } of cookiesToSet) request.cookies.set(name, value);
        response = NextResponse.next({ request });
        for (const { name, value, options } of cookiesToSet) {
          response.cookies.set(name, value, options);
        }
        for (const [name, value] of Object.entries(headers)) response.headers.set(name, value);
      },
    },
  });
  const { data, error } = await supabase.auth.getUser();
  return { response, authenticated: !error && data.user !== null };
}

export function withSessionCookies(from: NextResponse, to: NextResponse): NextResponse {
  for (const cookie of from.cookies.getAll()) to.cookies.set(cookie);
  for (const name of ['cache-control', 'expires', 'pragma']) {
    const value = from.headers.get(name);
    if (value !== null) to.headers.set(name, value);
  }
  return to;
}
