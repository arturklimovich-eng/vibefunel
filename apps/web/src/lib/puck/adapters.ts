import type { Data } from '@puckeditor/core';
import { puckDataSchema } from '@funnel/schema';
import type { PuckData, Screen, ScreenType } from '@funnel/schema';
import { blockId } from './block-id';
import { optionListProps, optionModeForScreenType } from './config';

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

export function applyOptionMode(content: PuckData, type: ScreenType): PuckData {
  const mode = optionModeForScreenType(type);
  if (!mode) return content;
  let changed = false;
  const items = content.content.map((item) => {
    if (item.type !== 'OptionList' || item.props.mode === mode) return item;
    changed = true;
    return { ...item, props: { ...item.props, mode } };
  });
  return changed ? { ...content, content: items } : content;
}
