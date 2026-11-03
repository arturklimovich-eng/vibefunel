import { z } from 'zod';

z.config({ jitless: true });

export const CURRENT_SCHEMA_VERSION = 4;

export const SCREEN_TYPES = ['default', 'auth', 'paywall', 'checkout', 'upsell', 'finish'] as const;
export const screenTypeSchema = z.enum(SCREEN_TYPES);
export type ScreenType = z.infer<typeof screenTypeSchema>;

export const LEGACY_SCREEN_TYPES: Readonly<Record<string, ScreenType>> = {
  welcome: 'default',
  quiz_single: 'default',
  quiz_multi: 'default',
  content: 'default',
  email_capture: 'auth',
  paywall: 'paywall',
  checkout: 'checkout',
  upsell: 'upsell',
  success: 'finish',
};

export const PAYMENT_SCREEN_TYPES: ReadonlySet<ScreenType> = new Set(['checkout', 'upsell']);
export const SKIP_SCREEN_TYPES: ReadonlySet<ScreenType> = new Set([
  'paywall',
  'checkout',
  'upsell',
]);

export function isPaymentType(type: ScreenType): boolean {
  return PAYMENT_SCREEN_TYPES.has(type);
}

export function isSkipType(type: ScreenType): boolean {
  return SKIP_SCREEN_TYPES.has(type);
}

export const ID_PATTERN = /^[A-Za-z0-9_-]{1,100}$/;
const idSchema = z.string().regex(ID_PATTERN);

export const ANIMATION_PRESETS = ['none', 'fade', 'slide_up', 'slide_left'] as const;
export const animationPresetSchema = z.enum(ANIMATION_PRESETS);
export type AnimationPreset = z.infer<typeof animationPresetSchema>;

export const MAX_ANIMATION_MS = 2000;

export const animationSchema = z.object({
  preset: animationPresetSchema,
  durationMs: z.number().int().min(0).max(MAX_ANIMATION_MS).optional(),
});
export type ScreenAnimation = z.infer<typeof animationSchema>;

export const MAX_SCREENS = 200;
export const MAX_EDGES = 1000;
export const MAX_OPTIONS_PER_LIST = 50;
export const MAX_TITLE_LENGTH = 200;
export const MAX_PRICE_FEATURES = 20;
export const MAX_CONTENT_STRING_LENGTH = 10_000;
export const MAX_CONTENT_ITEMS = 200;
const MAX_JSON_DEPTH = 24;

function hasOversizedString(value: unknown, depth: number): boolean {
  if (typeof value === 'string') return value.length > MAX_CONTENT_STRING_LENGTH;
  if (depth > MAX_JSON_DEPTH) return true;
  if (Array.isArray(value)) return value.some((v) => hasOversizedString(v, depth + 1));
  if (typeof value === 'object' && value !== null) {
    return Object.values(value).some((v) => hasOversizedString(v, depth + 1));
  }
  return false;
}

export const puckDataSchema = z
  .object({
    root: z.looseObject({ props: z.record(z.string(), z.unknown()).optional() }),
    content: z
      .array(
        z.looseObject({
          type: z.string().max(100),
          props: z.record(z.string(), z.unknown()),
        }),
      )
      .max(MAX_CONTENT_ITEMS),
    zones: z.record(z.string(), z.array(z.unknown()).max(MAX_CONTENT_ITEMS)).optional(),
  })
  .superRefine((data, ctx) => {
    if (hasOversizedString(data, 0)) {
      ctx.addIssue({
        code: 'custom',
        message: `Content strings are limited to ${MAX_CONTENT_STRING_LENGTH} characters and bounded nesting.`,
      });
    }
    data.content.forEach((item, index) => {
      const level = item.props.level;
      if (
        item.type === 'Heading' &&
        level !== undefined &&
        level !== '1' &&
        level !== '2' &&
        level !== '3'
      ) {
        ctx.addIssue({
          code: 'custom',
          path: ['content', index, 'props', 'level'],
          message: "Heading level must be the string '1', '2' or '3'.",
        });
      }
      const options = item.props.options;
      if (
        item.type === 'OptionList' &&
        Array.isArray(options) &&
        options.length > MAX_OPTIONS_PER_LIST
      ) {
        ctx.addIssue({
          code: 'custom',
          path: ['content', index, 'props', 'options'],
          message: `An option list is limited to ${MAX_OPTIONS_PER_LIST} options.`,
        });
      }
      const features = item.props.features;
      if (
        item.type === 'PriceCard' &&
        Array.isArray(features) &&
        features.length > MAX_PRICE_FEATURES
      ) {
        ctx.addIssue({
          code: 'custom',
          path: ['content', index, 'props', 'features'],
          message: `A price card is limited to ${MAX_PRICE_FEATURES} features.`,
        });
      }
    });
  });
export type PuckData = z.infer<typeof puckDataSchema>;

const HEX_COLOR = /^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/;
const FUNCTIONAL_COLOR = /^(?:rgba?|hsla?)\(\s*[-+0-9.,%/\s]{1,60}(?:deg)?[-+0-9.,%/\s]{0,60}\)$/i;

export const colorSchema = z
  .string()
  .max(80)
  .refine((v) => HEX_COLOR.test(v) || FUNCTIONAL_COLOR.test(v), {
    message: 'Must be a hex, rgb(), rgba(), hsl() or hsla() color.',
  });

export const positionSchema = z.object({ x: z.number(), y: z.number() });

export const MAX_URL_LENGTH = 2000;
const urlStringSchema = z.string().max(MAX_URL_LENGTH);

export function isHttpsUrl(value: string | undefined): value is string {
  if (!value) return false;
  try {
    return new URL(value).protocol === 'https:';
  } catch {
    return false;
  }
}

export const PROGRESS_TYPES = ['line', 'segments', 'groups'] as const;
export const progressTypeSchema = z.enum(PROGRESS_TYPES);
export type ProgressType = z.infer<typeof progressTypeSchema>;

export const MAX_PROGRESS_SEGMENTS = 12;
export const MAX_GROUP_NAME_LENGTH = 60;

export const screenHeaderSchema = z.object({
  title: z.string().max(MAX_TITLE_LENGTH).optional(),
  showLogo: z.boolean().optional(),
  imageUrl: urlStringSchema.optional(),
  imageAlt: z.string().max(MAX_TITLE_LENGTH).optional(),
  imagePosition: z.enum(['left', 'right']).optional(),
  backButton: z.boolean().optional(),
  counter: z.boolean().optional(),
  progress: z.boolean().optional(),
  progressType: progressTypeSchema.optional(),
  segments: z.number().int().min(1).max(MAX_PROGRESS_SEGMENTS).optional(),
});
export type ScreenHeader = z.infer<typeof screenHeaderSchema>;

export const FONT_FAMILIES = ['inherit', 'sans', 'serif', 'mono', 'rounded'] as const;
export const fontFamilySchema = z.enum(FONT_FAMILIES);
export type FontFamily = z.infer<typeof fontFamilySchema>;

export const FONT_WEIGHTS = [
  'thin',
  'extralight',
  'light',
  'regular',
  'medium',
  'semibold',
  'bold',
  'extrabold',
  'black',
] as const;
export const fontWeightSchema = z.enum(FONT_WEIGHTS);
export type FontWeight = z.infer<typeof fontWeightSchema>;

const spacingSchema = z.number().int().min(0).max(200);

export const screenStyleSchema = z.object({
  paddingTop: spacingSchema.optional(),
  paddingBottom: spacingSchema.optional(),
  paddingX: spacingSchema.optional(),
  fontFamily: fontFamilySchema.optional(),
  backgroundColor: colorSchema.optional(),
  backgroundMedia: z.enum(['image', 'video']).optional(),
  backgroundImageUrl: urlStringSchema.optional(),
  backgroundVideoUrl: urlStringSchema.optional(),
  backButtonColor: colorSchema.optional(),
  titleColor: colorSchema.optional(),
  headerFontFamily: fontFamilySchema.optional(),
  headerFontSize: z.number().int().min(8).max(48).optional(),
  headerFontWeight: fontWeightSchema.optional(),
  lineColor: colorSchema.optional(),
  lineBackground: colorSchema.optional(),
  lineHeight: z.number().int().min(1).max(16).optional(),
  logoSize: z.number().int().min(12).max(96).optional(),
});
export type ScreenStyle = z.infer<typeof screenStyleSchema>;

export const screenSchema = z.object({
  id: idSchema,
  type: screenTypeSchema,
  title: z.string().max(MAX_TITLE_LENGTH),
  content: puckDataSchema,
  animation: animationSchema,
  position: positionSchema,
  header: screenHeaderSchema.optional(),
  group: z.string().max(MAX_GROUP_NAME_LENGTH).optional(),
  autoNavigation: z.boolean().optional(),
  style: screenStyleSchema.optional(),
});
export type Screen = z.infer<typeof screenSchema>;

export const conditionSchema = z.discriminatedUnion('kind', [
  z.object({ kind: z.literal('always') }),
  z.object({ kind: z.literal('answer_equals'), screenId: idSchema, optionId: idSchema }),
  z.object({ kind: z.literal('answer_includes'), screenId: idSchema, optionId: idSchema }),
  z.object({ kind: z.literal('default') }),
  z.object({ kind: z.literal('payment_succeeded'), screenId: idSchema }),
]);
export type Condition = z.infer<typeof conditionSchema>;

export const edgeSchema = z.object({
  id: idSchema,
  sourceScreenId: idSchema,
  targetScreenId: idSchema,
  condition: conditionSchema,
});
export type Edge = z.infer<typeof edgeSchema>;

export const MIN_FONT_SCALE = 0.75;
export const MAX_FONT_SCALE = 1.5;

export const themeSchema = z.object({
  primaryColor: colorSchema,
  backgroundColor: colorSchema,
  textColor: colorSchema,
  fontScale: z.number().min(MIN_FONT_SCALE).max(MAX_FONT_SCALE).optional(),
  logoUrl: urlStringSchema.optional(),
  screen: screenStyleSchema.optional(),
  elements: z
    .record(
      z.string().max(40),
      z.record(z.string().max(40), z.union([z.string().max(200), z.number(), z.boolean()])),
    )
    .refine((v) => Object.keys(v).length <= 30, { message: 'Too many element theme groups.' })
    .optional(),
});
export type Theme = z.infer<typeof themeSchema>;

export const funnelDefinitionSchema = z.object({
  schemaVersion: z.literal(CURRENT_SCHEMA_VERSION),
  startScreenId: idSchema,
  screens: z.array(screenSchema).max(MAX_SCREENS),
  edges: z.array(edgeSchema).max(MAX_EDGES),
  theme: themeSchema,
  allowCycles: z.boolean().optional(),
});
export type FunnelDefinition = z.infer<typeof funnelDefinitionSchema>;

export const SLUG_PATTERN = /^[a-z0-9-]{3,60}$/;
export const slugSchema = z.string().regex(SLUG_PATTERN);

export const funnelSchema = z.object({
  id: z.string().min(1),
  projectId: z.string().min(1),
  slug: slugSchema,
  name: z.string().min(1),
  status: z.enum(['draft', 'published']),
  draftVersionId: z.string().min(1),
  publishedVersionId: z.string().min(1).nullable(),
  draftRevision: z.number().int().positive(),
});
export type Funnel = z.infer<typeof funnelSchema>;

export const funnelVersionSchema = z.object({
  id: z.string().min(1),
  funnelId: z.string().min(1),
  version: z.number().int().nonnegative(),
  schemaVersion: z.number().int().positive(),
  createdAt: z.string(),
  definition: funnelDefinitionSchema,
});
export type FunnelVersion = z.infer<typeof funnelVersionSchema>;

export type Answers = Record<string, string | string[]>;
export type Payments = Record<string, 'succeeded'>;
