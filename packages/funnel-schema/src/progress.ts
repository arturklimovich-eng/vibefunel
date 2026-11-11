import type { FunnelDefinition, ProgressType, Screen } from './schema';

export function longestPathFrom(definition: FunnelDefinition): Map<string, number> {
  const ids = definition.screens.map((s) => s.id);
  const known = new Set(ids);
  const adjacency = new Map<string, string[]>();
  for (const e of definition.edges) {
    if (!known.has(e.sourceScreenId) || !known.has(e.targetScreenId)) continue;
    const list = adjacency.get(e.sourceScreenId) ?? [];
    list.push(e.targetScreenId);
    adjacency.set(e.sourceScreenId, list);
  }

  const backEdges = new Set<string>();
  const state = new Map<string, 'open' | 'done'>();
  const classify = (id: string): void => {
    state.set(id, 'open');
    for (const target of adjacency.get(id) ?? []) {
      const seen = state.get(target);
      if (seen === 'open') backEdges.add(`${id}>${target}`);
      else if (seen === undefined) classify(target);
    }
    state.set(id, 'done');
  };
  const roots = [definition.startScreenId, ...ids];
  for (const id of roots) {
    if (known.has(id) && !state.has(id)) classify(id);
  }

  const memo = new Map<string, number>();
  const measure = (id: string): number => {
    const cached = memo.get(id);
    if (cached !== undefined) return cached;
    let best = 0;
    for (const target of adjacency.get(id) ?? []) {
      if (backEdges.has(`${id}>${target}`)) continue;
      best = Math.max(best, measure(target));
    }
    memo.set(id, best + 1);
    return best + 1;
  };
  for (const id of ids) measure(id);
  return memo;
}

export function depthFromStart(definition: FunnelDefinition): Map<string, number> {
  const depth = new Map<string, number>([[definition.startScreenId, 0]]);
  const queue = [definition.startScreenId];
  while (queue.length > 0) {
    const id = queue.shift();
    if (id === undefined) break;
    const d = depth.get(id) ?? 0;
    for (const e of definition.edges) {
      if (e.sourceScreenId !== id || depth.has(e.targetScreenId)) continue;
      depth.set(e.targetScreenId, d + 1);
      queue.push(e.targetScreenId);
    }
  }
  return depth;
}

export interface StepPosition {
  step: number;
  total: number;
}

export function previewStep(
  definition: FunnelDefinition,
  screenId: string,
  depths: Map<string, number>,
  lengths: Map<string, number>,
): StepPosition {
  const step = (depths.get(screenId) ?? 0) + 1;
  return { step, total: Math.max(step, step - 1 + (lengths.get(screenId) ?? 1)) };
}

export const DEFAULT_SEGMENTS = 4;

export function screenGroups(definition: FunnelDefinition): string[] {
  const groups: string[] = [];
  for (const s of definition.screens) {
    const name = s.group?.trim();
    if (name && !groups.includes(name)) groups.push(name);
  }
  return groups;
}

export function progressFills(
  definition: FunnelDefinition,
  screen: Screen,
  position: StepPosition,
  type: ProgressType,
  segments: number,
): number[] {
  const ratio = position.total > 0 ? Math.min(1, position.step / position.total) : 1;
  if (type === 'line') return [ratio];
  if (type === 'groups') {
    const groups = screenGroups(definition);
    const current = screen.group?.trim();
    const index = current ? groups.indexOf(current) : -1;
    if (groups.length > 0 && index >= 0) {
      const members = definition.screens.filter((s) => s.group?.trim() === current);
      const within = (members.findIndex((s) => s.id === screen.id) + 1) / members.length;
      return groups.map((_, i) => (i < index ? 1 : i === index ? within : 0));
    }
  }
  return Array.from({ length: segments }, (_, i) => Math.max(0, Math.min(1, ratio * segments - i)));
}
