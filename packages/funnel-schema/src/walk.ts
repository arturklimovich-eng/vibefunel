import type { PuckData } from './schema';

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

export function flattenContent(items: readonly Item[]): Item[] {
  const out: Item[] = [];
  const visit = (list: readonly Item[]) => {
    for (const item of list) {
      out.push(item);
      for (const value of Object.values(item.props)) {
        if (Array.isArray(value) && value.length > 0 && value.every(isItem)) visit(value);
      }
    }
  };
  visit(items);
  return out;
}
