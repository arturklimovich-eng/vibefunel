import { MigrationError, migrate } from '@funnel/schema';
import type { FunnelDefinition } from '@funnel/schema';

export function parseStoredDefinition(raw: unknown): FunnelDefinition | null {
  try {
    return migrate(raw);
  } catch (error) {
    if (error instanceof MigrationError) return null;
    throw error;
  }
}
