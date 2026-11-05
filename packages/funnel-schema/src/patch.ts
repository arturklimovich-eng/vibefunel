import type { Edge, FunnelDefinition, Screen, Theme } from './schema';
import { applyTextEdits } from './text-edits';
import type { TextEdit } from './text-edits';

export type ThemePatch = Partial<Pick<Theme, 'primaryColor' | 'backgroundColor' | 'textColor'>> & {
  font?: 'sans' | 'serif' | 'rounded';
};

export type PatchOp =
  | { op: 'add_screen'; screen: Screen; insertAfter: string | null }
  | { op: 'replace_screen'; screen: Screen }
  | { op: 'remove_screen'; screenId: string }
  | { op: 'add_edge'; edge: Edge }
  | { op: 'remove_edge'; edgeId: string }
  | { op: 'set_start_screen'; screenId: string }
  | { op: 'set_theme'; theme: ThemePatch }
  | { op: 'set_texts'; edits: TextEdit[] };

export type FunnelPatch = PatchOp[];

const UNCONDITIONAL = new Set(['always', 'default']);

function touches(edge: Edge, screenId: string): boolean {
  if (edge.sourceScreenId === screenId || edge.targetScreenId === screenId) return true;
  const c = edge.condition;
  return 'screenId' in c && c.screenId === screenId;
}

function applyOne(def: FunnelDefinition, op: PatchOp): FunnelDefinition {
  switch (op.op) {
    case 'add_screen': {
      if (def.screens.some((s) => s.id === op.screen.id)) return def;
      const screens = [...def.screens, op.screen];
      const after = op.insertAfter;
      if (!after || !def.screens.some((s) => s.id === after)) return { ...def, screens };
      let target: string | null = null;
      const edges = def.edges.map((e) => {
        if (e.sourceScreenId !== after || !UNCONDITIONAL.has(e.condition.kind)) return e;
        if (target === null) target = e.targetScreenId;
        return { ...e, targetScreenId: op.screen.id };
      });
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
    case 'remove_screen': {
      if (!def.screens.some((s) => s.id === op.screenId)) return def;
      const outgoing = def.edges.filter(
        (e) => e.sourceScreenId === op.screenId && e.targetScreenId !== op.screenId,
      );
      const next = outgoing.length === 1 ? outgoing[0]!.targetScreenId : null;
      const edges = def.edges.flatMap((e) => {
        if (e.targetScreenId === op.screenId && e.sourceScreenId !== op.screenId && next) {
          return [{ ...e, targetScreenId: next }];
        }
        return touches(e, op.screenId) ? [] : [e];
      });
      return { ...def, screens: def.screens.filter((s) => s.id !== op.screenId), edges };
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

export function summarizePatch(def: FunnelDefinition, patch: FunnelPatch): string[] {
  const title = (id: string) => def.screens.find((s) => s.id === id)?.title ?? id;
  const added = patch.filter((o) => o.op === 'add_screen').length;
  const lines: string[] = [];
  if (added > 0) lines.push(`+${added} screen${added === 1 ? '' : 's'}`);
  for (const op of patch) {
    if (op.op === 'replace_screen') lines.push(`Rewrite "${op.screen.title}"`);
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
