import { requireAppUrlInProduction } from '@/lib/app-url';
import { resolveStorageMode } from '@/lib/storage-mode';

export function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    resolveStorageMode();
    requireAppUrlInProduction();
  }
}
