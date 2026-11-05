import type { Edge, FunnelDefinition, PuckData, Screen, Theme } from './schema';
import { applyTextEdits } from './text-edits';
import type { TextEdit } from './text-edits';

export type ThemePatch = Partial<Pick<Theme, 'primaryColor' | 'backgroundColor' | 'textColor'>> & {
  font?: 'sans' | 'serif' | 'rounded';
};

export type PatchOp =
  | { op: 'add_screen'; screen: Screen; insertAfter: string | null }
  | { op: 'replace_screen'; screen: Screen }
  | { op: 'insert_elements'; screenId: string; items: PuckData['content'] }
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
