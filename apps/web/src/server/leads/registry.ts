import 'server-only';
import { resolveStorageMode } from '@/lib/storage-mode';
import { getDataDir } from '../repository';
import { FileLeadStore } from './file-lead-store';
import { SupabaseLeadStore } from './supabase-lead-store';
import type { LeadStore } from './store';

const globalForLeads = globalThis as typeof globalThis & {
  fileLeadStore?: FileLeadStore;
};

export function getLeadStore(): LeadStore {
  if (resolveStorageMode() === 'supabase') return new SupabaseLeadStore();
  if (!globalForLeads.fileLeadStore) {
    globalForLeads.fileLeadStore = new FileLeadStore(getDataDir());
  }
  return globalForLeads.fileLeadStore;
}
