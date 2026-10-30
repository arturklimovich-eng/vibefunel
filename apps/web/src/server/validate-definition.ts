import {
  CURRENT_SCHEMA_VERSION,
  MigrationError,
  funnelDefinitionSchema,
  migrate,
  validateFunnel,
} from '@funnel/schema';
import type { FunnelDefinition, ValidationIssue } from '@funnel/schema';

export type DefinitionCheck =
  | { ok: true; definition: FunnelDefinition; warnings: ValidationIssue[] }
  | { ok: false; issues: ValidationIssue[] };

function isOlderDefinition(input: unknown): boolean {
  if (typeof input !== 'object' || input === null || !('schemaVersion' in input)) return false;
  const version = input.schemaVersion;
  return (
    typeof version === 'number' && Number.isInteger(version) && version < CURRENT_SCHEMA_VERSION
  );
}

function parseInput(
  rawInput: unknown,
): { definition: FunnelDefinition } | { issues: ValidationIssue[] } {
  if (isOlderDefinition(rawInput)) {
    try {
      return { definition: migrate(rawInput) };
    } catch (error) {
      const message = error instanceof MigrationError ? error.message : 'Migration failed.';
      return { issues: [{ code: 'schema_invalid', severity: 'error', message }] };
    }
  }
  const parsed = funnelDefinitionSchema.safeParse(rawInput);
  if (parsed.success) return { definition: parsed.data };
  return {
    issues: parsed.error.issues.map((i) => ({
      code: 'schema_invalid',
      severity: 'error',
      message: `${i.path.join('.') || 'definition'}: ${i.message}`,
    })),
  };
}

export function checkDefinition(rawInput: unknown): DefinitionCheck {
  const input = parseInput(rawInput);
  if ('issues' in input) return { ok: false, issues: input.issues };
  const result = validateFunnel(input.definition, { mode: 'save' });
  if (!result.ok) return { ok: false, issues: result.issues };
  return { ok: true, definition: input.definition, warnings: result.warnings };
}
