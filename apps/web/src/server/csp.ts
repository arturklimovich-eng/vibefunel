const DEFAULT_POSTHOG_HOST = 'https://us.i.posthog.com';
const STUDIO_FONTS = 'https://rsms.me';

function originOf(value: string | undefined): string | null {
  if (!value) return null;
  try {
    const url = new URL(value);
    return url.protocol === 'https:' || url.protocol === 'http:' ? url.origin : null;
  } catch (error) {
    if (error instanceof TypeError) return null;
    throw error;
  }
}

export function createNonce(): string {
  return Buffer.from(crypto.randomUUID()).toString('base64');
}

export function contentSecurityPolicy(nonce: string, studio: boolean): string {
  const dev = process.env.NODE_ENV === 'development';
  const analytics = originOf(process.env.NEXT_PUBLIC_POSTHOG_HOST || DEFAULT_POSTHOG_HOST);
  const connect = [
    "'self'",
    'https:',
    'https://*.stripe.com',
    'https://*.solidgate.com',
    'https://*.posthog.com',
    ...(analytics ? [analytics] : []),
    ...(dev ? ['ws:'] : []),
  ];
  const directives = [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'${dev ? " 'unsafe-eval'" : ''}`,
    `style-src 'self' 'unsafe-inline'${studio ? ` ${STUDIO_FONTS}` : ''}`,
    "img-src 'self' data: blob: https:",
    `font-src 'self' data:${studio ? ` ${STUDIO_FONTS}` : ''}`,
    "media-src 'self' blob: https:",
    `connect-src ${connect.join(' ')}`,
    "frame-src 'self' https://*.stripe.com https://*.solidgate.com",
    "worker-src 'self' blob:",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    `frame-ancestors ${studio ? "'none'" : "'self'"}`,
  ];
  return directives.join('; ');
}
