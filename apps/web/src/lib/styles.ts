import type { CSSProperties } from 'react';
import { z } from 'zod';
import {
  ID_PATTERN,
  colorSchema,
  fontFamilySchema,
  fontWeightSchema,
  isHttpsUrl,
} from '@funnel/schema';
import type { FontFamily, FontWeight, Screen, ScreenStyle, Theme } from '@funnel/schema';

export const FONT_STACKS: Record<Exclude<FontFamily, 'inherit'>, string> = {
  sans: 'ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, Arial, sans-serif',
  serif: 'ui-serif, Georgia, "Times New Roman", serif',
  mono: 'ui-monospace, "SFMono-Regular", Menlo, Consolas, monospace',
  rounded: 'ui-rounded, "SF Pro Rounded", "Nunito", "Varela Round", system-ui, sans-serif',
};

export const FONT_LABELS: Record<FontFamily, string> = {
  inherit: 'inherit',
  sans: 'Sans',
  serif: 'Serif',
  mono: 'Mono',
  rounded: 'Rounded',
};

export const WEIGHT_VALUES: Record<FontWeight, number> = {
  thin: 100,
  extralight: 200,
  light: 300,
  regular: 400,
  medium: 500,
  semibold: 600,
  bold: 700,
  extrabold: 800,
  black: 900,
};

export const WEIGHT_LABELS: Record<FontWeight, string> = {
  thin: 'Thin',
  extralight: 'Extra Light',
  light: 'Light',
  regular: 'Regular',
  medium: 'Medium',
  semibold: 'Semibold',
  bold: 'Bold',
  extrabold: 'Extra Bold',
  black: 'Black',
};

export function fontStack(family: FontFamily | undefined): string | undefined {
  return family && family !== 'inherit' ? FONT_STACKS[family] : undefined;
}

const px = z.number().int().min(0).max(400);
const color = colorSchema;

export const ALIGNS = ['left', 'center', 'right'] as const;
export const ELEMENT_ANIMATIONS = ['off', 'slow', 'medium', 'fast', 'rapid'] as const;
export type ElementAnimation = (typeof ELEMENT_ANIMATIONS)[number];
const animationSchema = z
  .enum([...ELEMENT_ANIMATIONS, 'fade', 'slide_up', 'zoom'])
  .transform((v): ElementAnimation =>
    v === 'fade' || v === 'slide_up' || v === 'zoom' ? 'medium' : v,
  );
export const VISIBILITY = ['yes', 'conditional', 'no'] as const;
export const POSITIONS = ['content', 'attached', 'attached_scroll'] as const;
export type Position = (typeof POSITIONS)[number];
export const SHADOWS = ['none', 'soft', 'medium', 'strong'] as const;
export const EFFECTS = ['none', 'pulse', 'shine', 'bounce'] as const;
export const DECORATIONS = ['inherit', 'none', 'underline', 'overline', 'line-through'] as const;

const positionSchema = z
  .enum([...POSITIONS, 'inline'])
  .transform((v): Position => (v === 'inline' ? 'content' : v));

export const elementStyleSchema = z.object({
  offsetTop: px.optional(),
  offsetBottom: px.optional(),
  offsetX: px.optional(),
  position: positionSchema.optional(),
  containerPaddingY: px.optional(),
  containerPaddingX: px.optional(),
  containerBackground: color.optional(),
  containerRadius: px.optional(),
  containerBorderWidth: z.number().int().min(0).max(12).optional(),
  containerBorderColor: color.optional(),
  containerShadow: z.enum(SHADOWS).optional(),
  color: color.optional(),
  fontFamily: fontFamilySchema.optional(),
  fontSize: z.number().int().min(8).max(96).optional(),
  fontWeight: fontWeightSchema.optional(),
  align: z.enum(ALIGNS).optional(),
  lineHeight: z.number().min(0).max(300).optional(),
  lineHeightUnit: z.enum(['%', 'px']).optional(),
  linkColor: color.optional(),
  linkWeight: fontWeightSchema.optional(),
  linkDecoration: z.enum(DECORATIONS).optional(),
  width: z.number().int().min(10).max(100).optional(),
  paddingY: px.optional(),
  paddingX: px.optional(),
  background: color.optional(),
  radius: px.optional(),
  borderWidth: z.number().int().min(0).max(12).optional(),
  borderColor: color.optional(),
  accentColor: color.optional(),
  shadow: z.enum(SHADOWS).optional(),
  effect: z.enum(EFFECTS).optional(),
});
export type ElementStyle = z.output<typeof elementStyleSchema>;
export type StyleKey = keyof ElementStyle;

export const visibleWhenSchema = z.object({
  screenId: z.string().regex(ID_PATTERN),
  optionId: z.string().regex(ID_PATTERN),
});
export type VisibleWhen = z.infer<typeof visibleWhenSchema>;

export const elementMetaSchema = z.object({
  name: z.string().max(100).optional(),
  visibility: z.enum(VISIBILITY).optional(),
  visibleWhen: visibleWhenSchema.optional(),
  animation: animationSchema.optional(),
  delay: z.number().min(0).max(30).optional(),
});
export type ElementMeta = z.output<typeof elementMetaSchema>;

function safe<T extends z.ZodType>(schema: T, value: unknown): z.output<T> | undefined {
  const parsed = schema.safeParse(value);
  return parsed.success ? parsed.data : undefined;
}

export function readStyleRecord(value: unknown): ElementStyle {
  if (typeof value !== 'object' || value === null) return {};
  const out: Record<string, unknown> = {};
  const shape = elementStyleSchema.shape;
  for (const [key, raw] of Object.entries(value)) {
    if (!(key in shape)) continue;
    const ok = safe(shape[key as keyof typeof shape], raw);
    if (ok !== undefined) out[key] = ok;
  }
  return out as ElementStyle;
}

export function readElementStyle(props: Record<string, unknown>): ElementStyle {
  return readStyleRecord(props.style);
}

export function readElementMeta(props: Record<string, unknown>): ElementMeta {
  return {
    name: safe(elementMetaSchema.shape.name, props.name),
    visibility: safe(elementMetaSchema.shape.visibility, props.visibility),
    visibleWhen: safe(elementMetaSchema.shape.visibleWhen, props.visibleWhen),
    animation: safe(elementMetaSchema.shape.animation, props.animation),
    delay: safe(elementMetaSchema.shape.delay, props.delay),
  };
}

function luminance(hex: string): number | null {
  const m = /^#([0-9a-f]{6}|[0-9a-f]{3})(?:[0-9a-f]{2})?$/i.exec(hex.trim());
  if (!m?.[1]) return null;
  const body = m[1].length === 3 ? [...m[1]].map((c) => c + c).join('') : m[1];
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(body.slice(i, i + 2), 16) / 255);
  const lin = (c: number) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
  return 0.2126 * lin(r ?? 0) + 0.7152 * lin(g ?? 0) + 0.0722 * lin(b ?? 0);
}

export function onColor(background: string): string {
  const l = luminance(background);
  return l !== null && l > 0.45 ? '#111111' : '#FFFFFF';
}

export const TOKEN_KEYS = [
  'title',
  'subtitle',
  'paragraph',
  'button',
  'options',
  'input',
  'other',
] as const;
export type TokenKey = (typeof TOKEN_KEYS)[number];

export const TOKEN_LABELS: Record<TokenKey, string> = {
  title: 'Title',
  subtitle: 'Subtitle',
  paragraph: 'Paragraph',
  button: 'Button',
  options: 'Options & pickers',
  input: 'Inputs',
  other: 'Other elements',
};

const TEXT_TYPES = new Set(['Paragraph', 'List', 'ResultSummary', 'Spinner']);
const BUTTON_TYPES = new Set(['Button']);
const OPTION_TYPES = new Set([
  'OptionList',
  'Rating',
  'PlanPicker',
  'PlanPickerComposite',
  'TrialPicker',
]);
const INPUT_TYPES = new Set(['TextInput', 'DatePicker', 'EmailInput', 'EmailOAuth']);

export function tokenKeyFor(type: string, props: Record<string, unknown>): TokenKey {
  if (type === 'Heading')
    return props.level === '1' || props.level === undefined ? 'title' : 'subtitle';
  if (type === 'Text') {
    if (props.variant === 'title') return 'title';
    if (props.variant === 'subtitle') return 'subtitle';
    return 'paragraph';
  }
  if (TEXT_TYPES.has(type)) return 'paragraph';
  if (BUTTON_TYPES.has(type)) return 'button';
  if (OPTION_TYPES.has(type)) return 'options';
  if (INPUT_TYPES.has(type)) return 'input';
  return 'other';
}

const SIDE = 24;

export function builtinTokens(theme: Theme): Record<TokenKey, ElementStyle> {
  const text = theme.textColor;
  const primary = theme.primaryColor;
  const textBase = {
    linkColor: '#5856FF',
    linkDecoration: 'underline' as const,
    lineHeightUnit: '%' as const,
  };
  return {
    title: {
      offsetTop: 16,
      offsetBottom: 0,
      offsetX: SIDE,
      color: text,
      fontSize: 28,
      fontWeight: 'bold',
      align: 'center',
      lineHeight: 130,
      ...textBase,
    },
    subtitle: {
      offsetTop: 8,
      offsetBottom: 0,
      offsetX: SIDE,
      color: text,
      fontSize: 20,
      fontWeight: 'semibold',
      align: 'center',
      lineHeight: 130,
      ...textBase,
    },
    paragraph: {
      offsetTop: 8,
      offsetBottom: 0,
      offsetX: SIDE,
      color: text,
      fontSize: 16,
      fontWeight: 'regular',
      align: 'center',
      lineHeight: 150,
      ...textBase,
    },
    button: {
      offsetTop: 16,
      offsetBottom: 32,
      offsetX: SIDE,
      width: 100,
      paddingY: 16,
      paddingX: 0,
      background: primary,
      radius: 16,
      borderWidth: 0,
      color: onColor(primary),
      fontSize: 18,
      fontWeight: 'medium',
      align: 'center',
      lineHeight: 150,
      lineHeightUnit: '%',
    },
    options: {
      offsetTop: 16,
      offsetBottom: 0,
      offsetX: SIDE,
      paddingY: 16,
      paddingX: 16,
      background: '#FFFFFF',
      radius: 16,
      borderWidth: 2,
      borderColor: '#E5E7EB',
      accentColor: primary,
      color: '#111111',
      fontSize: 16,
      fontWeight: 'medium',
      align: 'left',
    },
    input: {
      offsetTop: 16,
      offsetBottom: 0,
      offsetX: SIDE,
      paddingY: 14,
      paddingX: 16,
      background: '#FFFFFF',
      radius: 12,
      borderWidth: 2,
      borderColor: '#E5E7EB',
      color: text,
    },
    other: { offsetTop: 16, offsetBottom: 0, offsetX: SIDE },
  };
}

export function themeToken(theme: Theme, key: TokenKey): ElementStyle {
  return readStyleRecord(theme.elements?.[key]);
}

export function inheritedStyle(
  type: string,
  props: Record<string, unknown>,
  theme: Theme,
): ElementStyle {
  const key = tokenKeyFor(type, props);
  return { ...builtinTokens(theme)[key], ...themeToken(theme, key) };
}

export function resolveStyle(
  type: string,
  props: Record<string, unknown>,
  theme: Theme | null,
): ElementStyle {
  const own = readElementStyle(props);
  return theme ? { ...inheritedStyle(type, props, theme), ...own } : own;
}

const SHADOW_CSS: Record<(typeof SHADOWS)[number], string | undefined> = {
  none: undefined,
  soft: '0 2px 8px rgb(0 0 0 / 0.08)',
  medium: '0 8px 24px -6px rgb(0 0 0 / 0.18)',
  strong: '0 18px 40px -10px rgb(0 0 0 / 0.35)',
};

export function containerStyle(style: ElementStyle, explicit: ElementStyle): CSSProperties {
  const out: Record<string, string | number> = {};
  if (style.offsetTop !== undefined) out.marginTop = style.offsetTop;
  if (style.offsetBottom !== undefined) out.marginBottom = style.offsetBottom;
  if (style.offsetX !== undefined) out['--ox-default'] = `${style.offsetX}px`;
  if (explicit.offsetX !== undefined) out['--ox'] = `${explicit.offsetX}px`;
  if (style.containerPaddingY !== undefined) {
    out.paddingTop = style.containerPaddingY;
    out.paddingBottom = style.containerPaddingY;
  }
  if (style.containerPaddingX !== undefined) {
    out.paddingLeft = style.containerPaddingX;
    out.paddingRight = style.containerPaddingX;
  }
  if (style.containerBackground) out.background = style.containerBackground;
  if (style.containerRadius !== undefined) out.borderRadius = style.containerRadius;
  if (style.containerBorderWidth !== undefined && style.containerBorderWidth > 0) {
    out.border = `${style.containerBorderWidth}px solid ${style.containerBorderColor ?? 'currentColor'}`;
  }
  const shadow = style.containerShadow ? SHADOW_CSS[style.containerShadow] : undefined;
  if (shadow) out.boxShadow = shadow;
  return out as CSSProperties;
}

export function textStyle(style: ElementStyle): CSSProperties {
  const out: Record<string, string | number> = {};
  if (style.color) out.color = style.color;
  const family = fontStack(style.fontFamily);
  if (family) out.fontFamily = family;
  if (style.fontSize !== undefined) out.fontSize = style.fontSize;
  if (style.fontWeight) out.fontWeight = WEIGHT_VALUES[style.fontWeight];
  if (style.align) out.textAlign = style.align;
  if (style.lineHeight !== undefined) {
    out.lineHeight =
      style.lineHeightUnit === 'px' ? `${style.lineHeight}px` : `${style.lineHeight}%`;
  }
  if (style.linkColor) out['--link-color'] = style.linkColor;
  if (style.linkWeight) out['--link-weight'] = WEIGHT_VALUES[style.linkWeight];
  if (style.linkDecoration) out['--link-decoration'] = style.linkDecoration;
  return out as CSSProperties;
}

export function boxStyle(style: ElementStyle): CSSProperties {
  const out: CSSProperties = {};
  if (style.width !== undefined) {
    out.width = `${style.width}%`;
    out.marginLeft = 'auto';
    out.marginRight = 'auto';
  }
  if (style.paddingY !== undefined) {
    out.paddingTop = style.paddingY;
    out.paddingBottom = style.paddingY;
  }
  if (style.paddingX !== undefined) {
    out.paddingLeft = style.paddingX;
    out.paddingRight = style.paddingX;
  }
  if (style.background) out.background = style.background;
  if (style.radius !== undefined) out.borderRadius = style.radius;
  if (style.borderWidth !== undefined) {
    out.borderWidth = style.borderWidth;
    out.borderStyle = style.borderWidth > 0 ? 'solid' : 'none';
  }
  if (style.borderColor) out.borderColor = style.borderColor;
  const shadow = style.shadow ? SHADOW_CSS[style.shadow] : undefined;
  if (shadow) out.boxShadow = shadow;
  return out;
}

function cssUrl(url: string): string {
  return `url("${encodeURI(url).replace(/["\\]/g, (c) => `\\${c}`)}")`;
}

export const BUILTIN_SCREEN: ScreenStyle = {
  paddingTop: 0,
  paddingBottom: 0,
  paddingX: SIDE,
  headerFontSize: 16,
  headerFontWeight: 'medium',
  lineHeight: 4,
  lineBackground: '#F5F6F8',
  logoSize: 24,
};

export function resolveScreenStyle(screen: Screen | undefined, theme: Theme): ScreenStyle {
  return { ...BUILTIN_SCREEN, ...theme.screen, ...screen?.style };
}

export function inheritedScreenStyle(theme: Theme): ScreenStyle {
  return { ...BUILTIN_SCREEN, ...theme.screen };
}

export interface ScreenSurface {
  surface: CSSProperties;
  body: CSSProperties;
  header: CSSProperties;
  videoUrl: string | null;
}

export function screenSurface(screen: Screen | undefined, theme: Theme): ScreenSurface {
  const style = resolveScreenStyle(screen, theme);
  const surface: CSSProperties = { background: style.backgroundColor ?? theme.backgroundColor };
  const imageUrl = style.backgroundMedia !== 'video' ? style.backgroundImageUrl : undefined;
  if (isHttpsUrl(imageUrl)) {
    surface.backgroundImage = cssUrl(imageUrl);
    surface.backgroundSize = 'cover';
    surface.backgroundPosition = 'center';
  }
  const family = fontStack(style.fontFamily);
  if (family) surface.fontFamily = family;
  const body: CSSProperties = {};
  if (style.paddingTop !== undefined) body.paddingTop = style.paddingTop;
  if (style.paddingBottom !== undefined) body.paddingBottom = style.paddingBottom;
  const header: Record<string, string | number> = {};
  if (style.paddingX !== undefined) {
    header.paddingLeft = style.paddingX;
    header.paddingRight = style.paddingX;
  }
  if (style.backButtonColor) header['--header-back'] = style.backButtonColor;
  if (style.titleColor) header['--header-title'] = style.titleColor;
  const headerFamily = fontStack(style.headerFontFamily);
  if (headerFamily) header['--header-font'] = headerFamily;
  if (style.headerFontSize !== undefined) header['--header-size'] = `${style.headerFontSize}px`;
  if (style.headerFontWeight) header['--header-weight'] = WEIGHT_VALUES[style.headerFontWeight];
  if (style.lineColor) header['--header-line'] = style.lineColor;
  if (style.lineBackground) header['--header-track'] = style.lineBackground;
  if (style.lineHeight !== undefined) header['--header-line-height'] = `${style.lineHeight}px`;
  if (style.logoSize !== undefined) header['--header-logo'] = `${style.logoSize}px`;
  const videoUrl =
    style.backgroundMedia === 'video' && isHttpsUrl(style.backgroundVideoUrl)
      ? style.backgroundVideoUrl
      : null;
  return { surface, body, header: header as CSSProperties, videoUrl };
}

export function isElementVisible(
  meta: ElementMeta,
  answers: Record<string, string | string[]>,
): boolean {
  if (meta.visibility === 'no') return false;
  if (meta.visibility !== 'conditional' || !meta.visibleWhen) return true;
  const answer = answers[meta.visibleWhen.screenId];
  if (answer === undefined) return false;
  return typeof answer === 'string'
    ? answer === meta.visibleWhen.optionId
    : answer.includes(meta.visibleWhen.optionId);
}
