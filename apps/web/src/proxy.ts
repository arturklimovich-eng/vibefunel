import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { resolveStorageMode } from '@/lib/storage-mode';
import { updateSession, withSessionCookies } from '@/lib/supabase/proxy';
import { customHost } from '@/server/platform-host';

const CUSTOM_HOST_PATHS = [
  '/api/payments/',
  '/api/health',
  '/api/domains/serve-check',
  '/__nextjs',
];

function isProtected(pathname: string): boolean {
  return (
    pathname === '/login' ||
    pathname === '/studio' ||
    pathname.startsWith('/studio/') ||
    pathname.startsWith('/preview/') ||
    pathname === '/api/funnels' ||
    pathname.startsWith('/api/funnels/')
  );
}

export async function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const custom = customHost(request.headers);
  if (custom) {
    if (pathname === '/') {
      const url = request.nextUrl.clone();
      url.pathname = `/d/${custom.host}`;
      return NextResponse.rewrite(url);
    }
    if (CUSTOM_HOST_PATHS.some((prefix) => pathname === prefix || pathname.startsWith(prefix))) {
      return NextResponse.next();
    }
    return new NextResponse(null, { status: 404 });
  }
  if (pathname === '/d' || pathname.startsWith('/d/'))
    return new NextResponse(null, { status: 404 });
  if (!isProtected(pathname) || resolveStorageMode() !== 'supabase') return NextResponse.next();
  const { response, authenticated } = await updateSession(request);
  if (pathname === '/login') {
    if (!authenticated) return response;
    const studio = request.nextUrl.clone();
    studio.pathname = '/studio';
    studio.search = '';
    return withSessionCookies(response, NextResponse.redirect(studio));
  }
  if (authenticated) return response;
  if (pathname.startsWith('/api/')) {
    return withSessionCookies(
      response,
      NextResponse.json({ error: 'unauthenticated' }, { status: 401 }),
    );
  }
  const login = request.nextUrl.clone();
  login.pathname = '/login';
  login.search = `?next=${encodeURIComponent(`${pathname}${search}`)}`;
  return withSessionCookies(response, NextResponse.redirect(login));
}

export const config = {
  matcher: ['/((?!_next/|favicon.ico).*)'],
};
