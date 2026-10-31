import 'server-only';
import path from 'node:path';
import { cache } from 'react';
import { resolveStorageMode } from '@/lib/storage-mode';
import type { StorageMode } from '@/lib/storage-mode';
import { createSupabaseAnonClient, createSupabaseServerClient } from '@/lib/supabase/server';
import { FileFunnelRepository } from './file-funnel-repository';
import { SupabaseDomainMaintenance } from './domains/maintenance';
import type { DomainMaintenance, FunnelRepository, PublishedReader } from './funnel-repository';
import { SupabaseFunnelRepository, SupabasePublishedReader } from './supabase-funnel-repository';

export function getDataDir(): string {
  return (
    process.env.FUNNEL_DATA_DIR ??
    path.resolve(/* turbopackIgnore: true */ process.cwd(), '..', '..', '.data')
  );
}

const globalForRepo = globalThis as typeof globalThis & {
  fileFunnelRepository?: FileFunnelRepository;
};

export function getFileRepository(): FileFunnelRepository {
  if (!globalForRepo.fileFunnelRepository) {
    globalForRepo.fileFunnelRepository = new FileFunnelRepository(getDataDir());
  }
  return globalForRepo.fileFunnelRepository;
}

export interface StudioContext {
  repo: FunnelRepository;
  storage: StorageMode;
  userEmail: string | null;
}

export const getStudioContext = cache(async (): Promise<StudioContext | null> => {
  const storage = resolveStorageMode();
  if (storage === 'file') return { repo: getFileRepository(), storage, userEmail: null };
  const client = await createSupabaseServerClient();
  const { data, error } = await client.auth.getUser();
  if (error || !data.user) return null;
  return {
    repo: new SupabaseFunnelRepository(client, data.user.id),
    storage,
    userEmail: data.user.email ?? null,
  };
});

export function getDomainMaintenance(): DomainMaintenance {
  if (resolveStorageMode() === 'file') return getFileRepository();
  return new SupabaseDomainMaintenance();
}

export function getPublishedReader(): PublishedReader {
  if (resolveStorageMode() === 'file') return getFileRepository();
  return new SupabasePublishedReader(createSupabaseAnonClient());
}
