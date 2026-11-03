import {
  CURRENT_SCHEMA_VERSION,
  LEGACY_SCREEN_TYPES,
  MAX_ANIMATION_MS,
  funnelDefinitionSchema,
} from './schema';
import type { FunnelDefinition } from './schema';

type RawDefinition = Record<string, unknown>;

function clampScreenAnimation(screen: unknown): unknown {
  if (!isRecord(screen) || !isRecord(screen.animation)) return screen;
  const duration = screen.animation.durationMs;
  if (typeof duration !== 'number' || duration <= MAX_ANIMATION_MS) return screen;
  return { ...screen, animation: { ...screen.animation, durationMs: MAX_ANIMATION_MS } };
}

function retypeScreen(screen: unknown): unknown {
  if (!isRecord(screen) || typeof screen.type !== 'string') return screen;
  const legacy = screen.type;
  const type = LEGACY_SCREEN_TYPES[legacy] ?? legacy;
  const mode = legacy === 'quiz_multi' ? 'multi' : legacy === 'quiz_single' ? 'single' : null;
  let content = screen.content;
  if (mode && isRecord(content) && Array.isArray(content.content)) {
    content = {
      ...content,
      content: content.content.map((item: unknown) =>
        isRecord(item) && item.type === 'OptionList' && isRecord(item.props)
          ? { ...item, props: { ...item.props, mode } }
          : item,
      ),
    };
  }
  return { ...screen, type, content };
}

function toTextItem(item: unknown): unknown {
  if (!isRecord(item) || !isRecord(item.props)) return item;
  if (item.type === 'Heading') {
    const { level, ...props } = item.props;
    return {
      ...item,
      type: 'Text',
      props: { ...props, variant: level === '1' || level === undefined ? 'title' : 'subtitle' },
    };
  }
  if (item.type === 'Paragraph') {
    return { ...item, type: 'Text', props: { ...item.props, variant: 'paragraph' } };
  }
  return item;
}

function textScreen(screen: unknown): unknown {
  if (!isRecord(screen) || !isRecord(screen.content) || !Array.isArray(screen.content.content)) {
    return screen;
  }
  return {
    ...screen,
    content: { ...screen.content, content: screen.content.content.map(toTextItem) },
  };
}

export const MIGRATIONS: Readonly<Record<number, (json: RawDefinition) => RawDefinition>> = {
  1: (json) => ({
    ...json,
    screens: Array.isArray(json.screens) ? json.screens.map(clampScreenAnimation) : json.screens,
  }),
  2: (json) => ({
    ...json,
    screens: Array.isArray(json.screens) ? json.screens.map(retypeScreen) : json.screens,
  }),
  3: (json) => ({
    ...json,
    screens: Array.isArray(json.screens) ? json.screens.map(textScreen) : json.screens,
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
