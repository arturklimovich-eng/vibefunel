import type { PuckData, Screen } from '@funnel/schema';

type Item = PuckData['content'][number];

function isItem(value: unknown): value is Item {
  return (
    typeof value === 'object' &&
    value !== null &&
    'type' in value &&
    typeof value.type === 'string' &&
    'props' in value &&
    typeof value.props === 'object' &&
    value.props !== null
  );
}

function cleanItems(items: Item[], screenId: string, destinations: boolean): Item[] | null {
  let changed = false;
  const next = items.map((item) => {
    const cleaned = cleanItem(item, screenId, destinations);
    if (cleaned !== item) changed = true;
    return cleaned;
  });
  return changed ? next : null;
}

function cleanItem(item: Item, screenId: string, destinations: boolean): Item {
  let props: Record<string, unknown> | null = null;
  const edit = () => (props ??= { ...item.props });
  if (destinations && item.type === 'Button' && item.props.destination === screenId) {
    edit().destination = '';
  }
  const when = item.props.visibleWhen;
  if (
    typeof when === 'object' &&
    when !== null &&
    'screenId' in when &&
    when.screenId === screenId
  ) {
    const p = edit();
    delete p.visibleWhen;
    if (p.visibility === 'conditional') p.visibility = 'yes';
  }
  for (const [key, value] of Object.entries(item.props)) {
    if (!Array.isArray(value) || !value.every(isItem) || value.length === 0) continue;
    const nested = cleanItems(value, screenId, destinations);
    if (nested) edit()[key] = nested;
  }
  return props ? { ...item, props } : item;
}

export function stripScreenRefs(
  screen: Screen,
  targetId: string,
  options: { destinations: boolean },
): Screen {
  const items = cleanItems(screen.content.content, targetId, options.destinations);
  return items ? { ...screen, content: { ...screen.content, content: items } } : screen;
}
