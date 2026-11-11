import 'server-only';
import path from 'node:path';
import { cache } from 'react';
import type { SupabaseClient } from '@supabase/supabase-js';
import { resolveStorageMode } from '@/lib/storage-mode';
import type { StorageMode } from '@/lib/storage-mode';
import { createSupabaseAnonClient, createSupabaseServerClient } from '@/lib/supabase/server';
import { FileApiTokenStore } from './api-tokens/file-store';
import { SupabaseApiTokenStore } from './api-tokens/supabase-store';
import type { ApiTokenStore } from './api-tokens/tokens';
import { FileFunnelRepository } from './file-funnel-repository';
import { SupabaseDomainMaintenance } from './domains/maintenance';
import type { DomainMaintenance, FunnelRepository, PublishedReader } from './funnel-repository';
import { getLeadStore } from './leads/registry';
import type { LeadStore } from './leads/store';
import { SupabaseLeadStore } from './leads/supabase-lead-store';
import { SupabaseFunnelRepository, SupabasePublishedReader } from './supabase-funnel-repository';

export function getDataDir(): string {
  return (
    process.env.FUNNEL_DATA_DIR ??
    path.resolve(/* turbopackIgnore: true */ process.cwd(), '..', '..', '.data')
  );
}

const globalForRepo = globalThis as typeof globalThis & {
  fileFunnelRepository?: FileFunnelRepository;
  fileApiTokenStore?: FileApiTokenStore;
};

export function getFileRepository(): FileFunnelRepository {
  if (!globalForRepo.fileFunnelRepository) {
    globalForRepo.fileFunnelRepository = new FileFunnelRepository(getDataDir());
  }
  return globalForRepo.fileFunnelRepository;
}

export function getFileApiTokenStore(): FileApiTokenStore {
  if (!globalForRepo.fileApiTokenStore) {
    globalForRepo.fileApiTokenStore = new FileApiTokenStore(getDataDir());
  }
  return globalForRepo.fileApiTokenStore;
}

export interface StudioContext {
  repo: FunnelRepository;
  storage: StorageMode;
  userEmail: string | null;
  leads: Pick<LeadStore, 'listFunnelLeads'>;
  tokens: ApiTokenStore;
}

export function fileStudioContext(): StudioContext {
  return {
    repo: getFileRepository(),
    storage: 'file',
    userEmail: null,
    leads: getLeadStore(),
    tokens: getFileApiTokenStore(),
  };
}

export function supabaseStudioContext(
  client: SupabaseClient,
  userId: string,
  userEmail: string | null,
): StudioContext {
  return {
    repo: new SupabaseFunnelRepository(client, userId),
    storage: 'supabase',
    userEmail,
    leads: new SupabaseLeadStore(client),
    tokens: new SupabaseApiTokenStore(client),
  };
}

export const getStudioContext = cache(async (): Promise<StudioContext | null> => {
  if (resolveStorageMode() === 'file') return fileStudioContext();
  const client = await createSupabaseServerClient();
  const { data, error } = await client.auth.getUser();
  if (error || !data.user) return null;
  return supabaseStudioContext(client, data.user.id, data.user.email ?? null);
});

export function getDomainMaintenance(): DomainMaintenance {
  if (resolveStorageMode() === 'file') return getFileRepository();
  return new SupabaseDomainMaintenance();
}

export function getPublishedReader(): PublishedReader {
  if (resolveStorageMode() === 'file') return getFileRepository();
  return new SupabasePublishedReader(createSupabaseAnonClient());
}
