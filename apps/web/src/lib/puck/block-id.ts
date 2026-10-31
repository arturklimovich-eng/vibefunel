import type { PuckData } from '@funnel/schema';

type PuckItem = PuckData['content'][number];

export function blockId(item: PuckItem, index: number): string {
  return typeof item.props.id === 'string' ? item.props.id : `${item.type}-${index}`;
}
