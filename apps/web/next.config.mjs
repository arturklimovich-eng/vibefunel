import path from 'node:path';

const devOrigins = (process.env.DEV_ALLOWED_ORIGINS ?? '')
  .split(',')
  .map((entry) => entry.trim())
  .filter((entry) => entry.length > 0);

const apiCsp = "default-src 'none'; frame-ancestors 'none'; base-uri 'none'; form-action 'none'";

const securityHeaders = [
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
  ...(process.env.NODE_ENV === 'production'
    ? [{ key: 'Strict-Transport-Security', value: 'max-age=31536000' }]
    : []),
];

const privateHeaders = [{ key: 'X-Frame-Options', value: 'DENY' }];

const nextConfig = {
  ...(devOrigins.length > 0 ? { allowedDevOrigins: devOrigins } : {}),
  async headers() {
    return [
      { source: '/:path*', headers: securityHeaders },
      ...['/studio', '/studio/:path*', '/login', '/preview/:path*', '/api/:path*'].map(
        (source) => ({ source, headers: privateHeaders }),
      ),
      {
        source: '/api/:path((?!payments/mock/confirm).*)',
        headers: [{ key: 'Content-Security-Policy', value: apiCsp }],
      },
    ];
  },
  transpilePackages: ['@funnel/schema'],
  reactStrictMode: true,
  output: 'standalone',
  outputFileTracingRoot: path.join(import.meta.dirname, '../../'),
  // /studio/docs reads these at request time
  outputFileTracingIncludes: {
    '/studio/docs/[slug]': ['../../README.md', '../../docs/*.md', '../../docs/features/*.md'],
  },
};

export default nextConfig;
