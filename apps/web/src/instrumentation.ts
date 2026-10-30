import { requireAppUrlInProduction } from '@/lib/app-url';
import { resolveStorageMode } from '@/lib/storage-mode';
import { trustedHops } from '@/server/payments/rate-limit';

export function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    resolveStorageMode();
    requireAppUrlInProduction();
    if (process.env.NODE_ENV === 'production' && trustedHops() === 0) {
      console.warn(
        'TRUST_PROXY_HOPS is 0: every visitor shares one rate-limit bucket. Set it to the number of proxies in front of the app (see docs/DEPLOYMENT.md).',
      );
    }
  }
}
