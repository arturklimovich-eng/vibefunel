import { z } from 'zod';
import { ID_PATTERN, MAX_TITLE_LENGTH } from './schema';
import type { FunnelDefinition, PuckData, Screen } from './schema';

type Item = PuckData['content'][number];
type PathPart = string | number;

export const TEXT_PROP_KEYS: ReadonlySet<string> = new Set([
  'acceptLabel',
  'alt',
  'answer',
  'badge',
  'buttonLabel',
  'caption',
  'closeLabel',
  'consentLabel',
  'declineLabel',
  'expiredText',
  'label',
  'linkLabel',
  'maxLabel',
  'minLabel',
  'noLabel',
  'note',
  'placeholder',
  'policyLabel',
  'question',
  'subtitle',
  'text',
  'title',
  'totalLabel',
  'yesLabel',
]);

export const HEADER_ELEMENT_ID = '@header';
export const MAX_TEXT_EDIT_LENGTH = 2000;

export interface TextField {
  key: string;
  screenId: string;
  elementId: string;
  elementType: string;
  path: PathPart[];
  value: string;
}

export const textEditSchema = z.object({
  screenId: z.string().regex(ID_PATTERN).describe('Id of the screen that holds the text.'),
  elementId: z
    .string()
    .max(100)
    .describe(`Id of the element on that screen, or "${HEADER_ELEMENT_ID}" for the screen header.`),
  path: z
    .array(z.union([z.string().max(100), z.number().int().min(0)]))
    .max(24)
    .describe(
      'Path to the text prop inside the element props, for example ["title"] or ["options", 2, "label"].',
    ),
  value: z.string().max(MAX_TEXT_EDIT_LENGTH).describe('New text value.'),
});
export type TextEdit = z.infer<typeof textEditSchema>;

function isItem(value: unknown): value is Item {
  return (
    typeof value === 'object' &&
    value !== null &&
    'type' in value &&
    typeof (value as { type: unknown }).type === 'string' &&
    'props' in value &&
    typeof (value as { props: unknown }).props === 'object' &&
    (value as { props: unknown }).props !== null
  );
}

function isItemList(value: unknown): value is Item[] {
  return Array.isArray(value) && value.length > 0 && value.every(isItem);
}

export function textFieldKey(screenId: string, elementId: string, path: PathPart[]): string {
  return `${screenId}|${elementId}|${path.join('.')}`;
}

function collect(
  value: unknown,
  path: PathPart[],
  key: string | null,
  visit: (path: PathPart[], value: string) => void,
): void {
  if (typeof value === 'string') {
    if (key !== null && TEXT_PROP_KEYS.has(key) && value.trim() !== '') visit(path, value);
    return;
  }
  if (isItemList(value)) return;
  if (Array.isArray(value)) {
    value.forEach((entry, index) => collect(entry, [...path, index], key, visit));
    return;
  }
  if (typeof value === 'object' && value !== null) {
    for (const [childKey, child] of Object.entries(value)) {
      if (childKey === 'style' || childKey === 'id') continue;
      collect(child, [...path, childKey], childKey, visit);
    }
  }
}

export function elementTextFields(
  screenId: string,
  elementId: string,
  elementType: string,
  props: Record<string, unknown>,
): TextField[] {
  const out: TextField[] = [];
  collect(props, [], null, (path, value) => {
    out.push({
      key: textFieldKey(screenId, elementId, path),
      screenId,
      elementId,
      elementType,
      path,
      value,
    });
  });
  return out;
}

function flatten(items: readonly Item[], out: Item[]): Item[] {
  for (const item of items) {
    out.push(item);
    for (const value of Object.values(item.props)) if (isItemList(value)) flatten(value, out);
  }
  return out;
}

export function screenTextFields(screen: Screen): TextField[] {
  const out: TextField[] = [];
  const title = screen.header?.title;
  if (title && title.trim() !== '') {
    out.push({
      key: textFieldKey(screen.id, HEADER_ELEMENT_ID, ['title']),
      screenId: screen.id,
      elementId: HEADER_ELEMENT_ID,
      elementType: 'Header',
      path: ['title'],
      value: title,
    });
  }
  for (const item of flatten(screen.content.content, [])) {
    const id = item.props.id;
    if (typeof id !== 'string') continue;
    out.push(...elementTextFields(screen.id, id, item.type, item.props));
  }
  return out;
}

function setAt(value: unknown, path: PathPart[], next: string): unknown {
  if (path.length === 0) return typeof value === 'string' ? next : value;
  const [head, ...rest] = path;
  if (Array.isArray(value) && typeof head === 'number' && head >= 0 && head < value.length) {
    const copy = value.slice();
    copy[head] = setAt(value[head], rest, next);
    return copy;
  }
  if (
    typeof value === 'object' &&
    value !== null &&
    !Array.isArray(value) &&
    typeof head === 'string' &&
    Object.prototype.hasOwnProperty.call(value, head)
  ) {
    return {
      ...(value as Record<string, unknown>),
      [head]: setAt((value as Record<string, unknown>)[head], rest, next),
    };
  }
  return value;
}

function editable(path: PathPart[]): boolean {
  for (let i = path.length - 1; i >= 0; i--) {
    const part = path[i];
    if (typeof part === 'string') return TEXT_PROP_KEYS.has(part);
  }
  return false;
}

export function applyPropsTextEdits(
  props: Record<string, unknown>,
  edits: { path: PathPart[]; value: string }[],
): Record<string, unknown> {
  let next = props;
  for (const edit of edits) {
    if (!editable(edit.path) || edit.path[0] === 'id' || edit.path[0] === 'style') continue;
    next = setAt(next, edit.path, edit.value.slice(0, MAX_TEXT_EDIT_LENGTH)) as Record<
      string,
      unknown
    >;
  }
  return next;
}

function mapItems(items: Item[], byElement: Map<string, TextEdit[]>): Item[] {
  return items.map((item) => {
    const id = item.props.id;
    const own = typeof id === 'string' ? byElement.get(id) : undefined;
    let props = own ? applyPropsTextEdits(item.props, own) : item.props;
    for (const [key, value] of Object.entries(props)) {
      if (!isItemList(value)) continue;
      const mapped = mapItems(value, byElement);
      if (mapped !== value) props = { ...props, [key]: mapped };
    }
    return props === item.props ? item : { ...item, props };
  });
}

export function applyTextEdits(definition: FunnelDefinition, edits: TextEdit[]): FunnelDefinition {
  const byScreen = new Map<string, TextEdit[]>();
  for (const edit of edits) {
    const list = byScreen.get(edit.screenId) ?? [];
    list.push(edit);
    byScreen.set(edit.screenId, list);
  }
  return {
    ...definition,
    screens: definition.screens.map((screen) => {
      const list = byScreen.get(screen.id);
      if (!list) return screen;
      const byElement = new Map<string, TextEdit[]>();
      let header = screen.header;
      for (const edit of list) {
        if (edit.elementId === HEADER_ELEMENT_ID) {
          if (header && edit.path.length === 1 && edit.path[0] === 'title') {
            header = { ...header, title: edit.value.slice(0, MAX_TITLE_LENGTH) };
          }
          continue;
        }
        const own = byElement.get(edit.elementId) ?? [];
        own.push(edit);
        byElement.set(edit.elementId, own);
      }
      return {
        ...screen,
        ...(header ? { header } : {}),
        content: { ...screen.content, content: mapItems(screen.content.content, byElement) },
      };
    }),
  };
}
