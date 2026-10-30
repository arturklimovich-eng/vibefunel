import { CURRENT_SCHEMA_VERSION, MAX_ANIMATION_MS, funnelDefinitionSchema } from './schema';
import type { FunnelDefinition } from './schema';

type RawDefinition = Record<string, unknown>;

function clampScreenAnimation(screen: unknown): unknown {
  if (!isRecord(screen) || !isRecord(screen.animation)) return screen;
  const duration = screen.animation.durationMs;
  if (typeof duration !== 'number' || duration <= MAX_ANIMATION_MS) return screen;
  return { ...screen, animation: { ...screen.animation, durationMs: MAX_ANIMATION_MS } };
}

export const MIGRATIONS: Readonly<Record<number, (json: RawDefinition) => RawDefinition>> = {
  1: (json) => ({
    ...json,
    screens: Array.isArray(json.screens) ? json.screens.map(clampScreenAnimation) : json.screens,
  }),
};

function isRecord(v: unknown): v is RawDefinition {
  return typeof v === 'object' && v !== null && !Array.isArray(v);
}

export class MigrationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'MigrationError';
  }
}

export function migrate(
  json: unknown,
  migrations: Readonly<Record<number, (json: RawDefinition) => RawDefinition>> = MIGRATIONS,
  targetVersion: number = CURRENT_SCHEMA_VERSION,
): FunnelDefinition {
  if (!isRecord(json)) throw new MigrationError('Definition must be an object.');
  let current: RawDefinition = json;
  let version = current.schemaVersion;
  if (typeof version !== 'number' || !Number.isInteger(version) || version < 1) {
    throw new MigrationError('Definition has no valid schemaVersion.');
  }
  if (version > targetVersion) {
    throw new MigrationError(
      `schemaVersion ${version} is newer than supported (${targetVersion}).`,
    );
  }
  while (version < targetVersion) {
    const step = migrations[version];
    if (!step) throw new MigrationError(`No migration from schemaVersion ${version}.`);
    current = { ...step(current), schemaVersion: version + 1 };
    version += 1;
  }
  const parsed = funnelDefinitionSchema.safeParse(current);
  if (!parsed.success) {
    throw new MigrationError(`Invalid definition: ${parsed.error.message}`);
  }
  return parsed.data;
}
