import type { Data } from '@puckeditor/core';
import { puckDataSchema } from '@funnel/schema';
import type { PuckData, Screen } from '@funnel/schema';
import { blockId } from './block-id';
import { optionListProps } from './config';

export { blockId };

export function toPuckData(data: PuckData): Data {
  return {
    root: { props: data.root.props ?? {} },
    content: data.content.map((item, index) => ({
      type: item.type,
      props: { ...item.props, id: blockId(item, index) },
    })),
  };
}

export function fromPuckData(data: unknown): PuckData | null {
  const parsed = puckDataSchema.safeParse(data);
  return parsed.success ? parsed.data : null;
}

export interface OptionRef {
  id: string;
  label: string;
}

export function getScreenOptions(screen: Screen): OptionRef[] {
  const result: OptionRef[] = [];
  for (const item of screen.content.content) {
    if (item.type !== 'OptionList') continue;
    const parsed = optionListProps.safeParse(item.props);
    if (parsed.success) result.push(...parsed.data.options.filter((o) => o.id.length > 0));
  }
  return result;
}
