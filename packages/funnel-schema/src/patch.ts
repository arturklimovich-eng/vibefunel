import { z } from 'zod';
import { ID_PATTERN, colorSchema, edgeSchema, puckDataSchema, screenSchema } from './schema';
import type { Edge, FunnelDefinition } from './schema';
import type { ValidationIssue } from './validate';
import { applyTextEdits, textEditSchema } from './text-edits';

export const MAX_PATCH_OPS = 200;

const screenId = z.string().regex(ID_PATTERN);

export const THEME_PATCH_FONTS = ['sans', 'serif', 'rounded'] as const;

export const themePatchSchema = z.object({
  primaryColor: colorSchema.optional().describe('Accent color for buttons and highlights.'),
  backgroundColor: colorSchema.optional().describe('Page background color.'),
  textColor: colorSchema.optional().describe('Main text color.'),
  font: z.enum(THEME_PATCH_FONTS).optional().describe('Font family applied to every screen.'),
});
export type ThemePatch = z.infer<typeof themePatchSchema>;

export const patchOpSchema = z.discriminatedUnion('op', [
  z
    .object({
      op: z.literal('add_screen'),
      screen: screenSchema.describe('The full new screen. Its id must not exist yet.'),
      insertAfter: screenId
        .nullable()
        .describe(
          'Id of the screen after which the new one is linked into the main path, or null to add it unlinked.',
        ),
    })
    .describe('Add a screen and, with insertAfter, splice it into the main path.'),
  z
    .object({
      op: z.literal('replace_screen'),
      screen: screenSchema.describe(
        'The new version of an existing screen, matched by id. Its canvas position is kept.',
      ),
    })
    .describe('Replace an existing screen with a new version.'),
  z
    .object({
      op: z.literal('insert_elements'),
      screenId: screenId.describe('Id of the screen that receives the elements.'),
      items: puckDataSchema.shape.content.describe(
        'Elements to append to the screen content, before any element attached to the bottom.',
      ),
    })
    .describe('Append elements to a screen.'),
  z
    .object({
      op: z.literal('remove_screen'),
      screenId: screenId.describe('Id of the screen to remove.'),
    })
    .describe(
      'Remove a screen. Incoming edges are redirected to its main next screen, other edges that reference it are dropped.',
    ),
  z
    .object({
      op: z.literal('add_edge'),
      edge: edgeSchema.describe('The new edge. Its id must not exist yet.'),
    })
    .describe('Add a transition between two screens.'),
  z
    .object({
      op: z.literal('remove_edge'),
      edgeId: z.string().regex(ID_PATTERN).describe('Id of the edge to remove.'),
    })
    .describe('Remove a transition.'),
  z
    .object({
      op: z.literal('set_start_screen'),
      screenId: screenId.describe('Id of the screen visitors see first.'),
    })
    .describe('Change the first screen of the funnel.'),
  z
    .object({
      op: z.literal('set_theme'),
      theme: themePatchSchema.describe('Theme fields to change; omitted fields stay as they are.'),
    })
    .describe('Change theme colors or font.'),
  z
    .object({
      op: z.literal('set_texts'),
      edits: z.array(textEditSchema).max(500).describe('Text changes to apply.'),
    })
    .describe('Change texts of elements and screen headers.'),
]);
export type PatchOp = z.infer<typeof patchOpSchema>;

export const funnelPatchSchema = z
  .array(patchOpSchema)
  .max(MAX_PATCH_OPS)
  .describe('Operations applied in order to the funnel draft.');
export type FunnelPatch = PatchOp[];

const UNCONDITIONAL = new Set(['always', 'default']);

function touches(edge: Edge, screenId: string): boolean {
  if (edge.sourceScreenId === screenId || edge.targetScreenId === screenId) return true;
  const c = edge.condition;
  return 'screenId' in c && c.screenId === screenId;
}

function mainTarget(edges: Edge[], sourceId: string): string | null {
  const out = edges.filter((e) => e.sourceScreenId === sourceId && e.targetScreenId !== sourceId);
  const targets = new Set(out.map((e) => e.targetScreenId));
  if (targets.size === 1) return out[0]!.targetScreenId;
  return (
    out.find((e) => e.condition.kind === 'always')?.targetScreenId ??
    out.find((e) => e.condition.kind === 'default')?.targetScreenId ??
    null
  );
}

function isAttached(props: Record<string, unknown>): boolean {
  const style = props.style;
  return typeof style === 'object' && style !== null && 'position' in style
    ? style.position === 'attached'
    : false;
}

function applyOne(def: FunnelDefinition, op: PatchOp): FunnelDefinition {
  switch (op.op) {
    case 'add_screen': {
      if (def.screens.some((s) => s.id === op.screen.id)) return def;
      const screens = [...def.screens, op.screen];
      const after = op.insertAfter;
      if (!after || !def.screens.some((s) => s.id === after)) return { ...def, screens };
      const target = mainTarget(
        def.edges.filter((e) => UNCONDITIONAL.has(e.condition.kind)),
        after,
      );
      const edges = def.edges.map((e) =>
        e.sourceScreenId === after &&
        e.targetScreenId === target &&
        UNCONDITIONAL.has(e.condition.kind)
          ? { ...e, targetScreenId: op.screen.id }
          : e,
      );
      if (target !== null && target !== op.screen.id) {
        edges.push({
          id: `e_${op.screen.id}_next`,
          sourceScreenId: op.screen.id,
          targetScreenId: target,
          condition: { kind: 'always' },
        });
      } else if (target === null) {
        edges.push({
          id: `e_${after}_${op.screen.id}`,
          sourceScreenId: after,
          targetScreenId: op.screen.id,
          condition: { kind: 'always' },
        });
      }
      return { ...def, screens, edges };
    }
    case 'replace_screen':
      return {
        ...def,
        screens: def.screens.map((s) =>
          s.id === op.screen.id ? { ...op.screen, position: s.position } : s,
        ),
      };
    case 'insert_elements': {
      if (op.items.length === 0) return def;
      return {
        ...def,
        screens: def.screens.map((s) => {
          if (s.id !== op.screenId) return s;
          const content = [...s.content.content];
          const at = content.findIndex((item) => isAttached(item.props));
          content.splice(at === -1 ? content.length : at, 0, ...op.items);
          return { ...s, content: { ...s.content, content } };
        }),
      };
    }
    case 'remove_screen': {
      if (!def.screens.some((s) => s.id === op.screenId)) return def;
      const remaining = def.screens.filter((s) => s.id !== op.screenId);
      if (remaining.length === 0) return def;
      const next = mainTarget(def.edges, op.screenId);
      const edges = def.edges.flatMap((e) => {
        if (e.targetScreenId === op.screenId && e.sourceScreenId !== op.screenId && next) {
          return [{ ...e, targetScreenId: next }];
        }
        return touches(e, op.screenId) ? [] : [e];
      });
      const startScreenId =
        def.startScreenId === op.screenId ? (next ?? remaining[0]!.id) : def.startScreenId;
      return { ...def, startScreenId, screens: remaining, edges };
    }
    case 'add_edge':
      if (def.edges.some((e) => e.id === op.edge.id)) return def;
      return { ...def, edges: [...def.edges, op.edge] };
    case 'remove_edge':
      return { ...def, edges: def.edges.filter((e) => e.id !== op.edgeId) };
    case 'set_start_screen':
      return def.screens.some((s) => s.id === op.screenId)
        ? { ...def, startScreenId: op.screenId }
        : def;
    case 'set_theme': {
      const { font, ...colors } = op.theme;
      return {
        ...def,
        theme: {
          ...def.theme,
          ...colors,
          ...(font ? { screen: { ...def.theme.screen, fontFamily: font } } : {}),
        },
      };
    }
    case 'set_texts':
      return applyTextEdits(def, op.edits);
  }
}

export function applyPatch(def: FunnelDefinition, patch: FunnelPatch): FunnelDefinition {
  return patch.reduce(applyOne, def);
}

function opIssue(def: FunnelDefinition, op: PatchOp, path: string): ValidationIssue | null {
  const hasScreen = (id: string) => def.screens.some((s) => s.id === id);
  const missingScreen = (id: string): ValidationIssue => ({
    code: 'patch_target_missing',
    severity: 'error',
    message: `Screen "${id}" does not exist.`,
    screenId: id,
    path,
  });
  switch (op.op) {
    case 'add_screen':
      if (hasScreen(op.screen.id)) {
        return {
          code: 'patch_id_taken',
          severity: 'error',
          message: `Screen id "${op.screen.id}" is already used.`,
          screenId: op.screen.id,
          path: `${path}.screen.id`,
        };
      }
      if (op.insertAfter && !hasScreen(op.insertAfter)) return missingScreen(op.insertAfter);
      return null;
    case 'replace_screen':
      return hasScreen(op.screen.id) ? null : missingScreen(op.screen.id);
    case 'insert_elements':
    case 'set_start_screen':
      return hasScreen(op.screenId) ? null : missingScreen(op.screenId);
    case 'remove_screen':
      if (!hasScreen(op.screenId)) return missingScreen(op.screenId);
      if (def.screens.length === 1) {
        return {
          code: 'patch_last_screen',
          severity: 'error',
          message: 'A funnel needs at least one screen.',
          screenId: op.screenId,
          path,
        };
      }
      return null;
    case 'add_edge':
      if (def.edges.some((e) => e.id === op.edge.id)) {
        return {
          code: 'patch_id_taken',
          severity: 'error',
          message: `Edge id "${op.edge.id}" is already used.`,
          edgeId: op.edge.id,
          path: `${path}.edge.id`,
        };
      }
      return null;
    case 'remove_edge':
      return def.edges.some((e) => e.id === op.edgeId)
        ? null
        : {
            code: 'patch_target_missing',
            severity: 'error',
            message: `Edge "${op.edgeId}" does not exist.`,
            edgeId: op.edgeId,
            path,
          };
    case 'set_texts': {
      const index = op.edits.findIndex((e) => !hasScreen(e.screenId));
      return index === -1
        ? null
        : { ...missingScreen(op.edits[index]!.screenId), path: `${path}.edits.${index}` };
    }
    case 'set_theme':
      return null;
  }
}

export type PatchResult =
  { ok: true; definition: FunnelDefinition } | { ok: false; issues: ValidationIssue[] };

export function tryApplyPatch(def: FunnelDefinition, patch: FunnelPatch): PatchResult {
  let current = def;
  for (const [index, op] of patch.entries()) {
    const issue = opIssue(current, op, `ops.${index}`);
    if (issue) return { ok: false, issues: [issue] };
    current = applyOne(current, op);
  }
  return { ok: true, definition: current };
}

export function summarizePatch(def: FunnelDefinition, patch: FunnelPatch): string[] {
  const title = (id: string) => def.screens.find((s) => s.id === id)?.title ?? id;
  const added = patch.filter((o) => o.op === 'add_screen').length;
  const lines: string[] = [];
  if (added > 0) lines.push(`+${added} screen${added === 1 ? '' : 's'}`);
  for (const op of patch) {
    if (op.op === 'replace_screen') lines.push(`Rewrite "${op.screen.title}"`);
    if (op.op === 'insert_elements') {
      lines.push(
        `Add ${op.items.length} element${op.items.length === 1 ? '' : 's'} to "${title(op.screenId)}"`,
      );
    }
    if (op.op === 'remove_screen') lines.push(`Remove "${title(op.screenId)}"`);
    if (op.op === 'set_start_screen') lines.push(`Start at "${title(op.screenId)}"`);
    if (op.op === 'set_theme') lines.push('Theme colors');
    if (op.op === 'set_texts') {
      lines.push(`${op.edits.length} text${op.edits.length === 1 ? '' : 's'} changed`);
    }
  }
  const edgesAdded = patch.filter((o) => o.op === 'add_edge').length;
  const edgesRemoved = patch.filter((o) => o.op === 'remove_edge').length;
  if (edgesAdded > 0) lines.push(`+${edgesAdded} connection${edgesAdded === 1 ? '' : 's'}`);
  if (edgesRemoved > 0) lines.push(`-${edgesRemoved} connection${edgesRemoved === 1 ? '' : 's'}`);
  return lines;
}
