import { z } from 'zod';
import { CURRENT_SCHEMA_VERSION, ID_PATTERN } from './schema';
import type { Edge, FunnelDefinition, PuckData, Screen, ScreenType, Theme } from './schema';

const HEX = /^#[0-9a-fA-F]{6}$/;

export const BRIEF_GOALS = ['lead', 'subscription', 'one_time'] as const;
export const BRIEF_TONES = ['friendly', 'expert', 'bold', 'calm'] as const;
export const MIN_BRIEF_QUESTIONS = 3;
export const MAX_BRIEF_QUESTIONS = 15;
export const MAX_OUTLINE_SCREENS = 40;

export const briefSchema = z.object({
  product: z.string().trim().min(3).max(600),
  offer: z.string().trim().max(600).default(''),
  audience: z.string().trim().max(600).default(''),
  goal: z.enum(BRIEF_GOALS),
  questions: z.number().int().min(MIN_BRIEF_QUESTIONS).max(MAX_BRIEF_QUESTIONS),
  tone: z.enum(BRIEF_TONES),
  language: z.string().trim().min(2).max(40),
  brandColor: z.string().regex(HEX).nullable().default(null),
  planKeys: z.array(z.string().min(1).max(100)).max(4).default([]),
});
export type Brief = z.infer<typeof briefSchema>;

export const OUTLINE_KINDS = [
  'intro',
  'question',
  'info',
  'input',
  'loader',
  'email',
  'paywall',
  'checkout',
  'finish',
] as const;
export type OutlineKind = (typeof OUTLINE_KINDS)[number];

export const outlineOptionSchema = z.object({
  key: z.string().min(1).max(60),
  label: z.string().min(1).max(120),
  emoji: z.string().max(16).nullable(),
});

export const outlineScreenSchema = z.object({
  key: z.string().min(1).max(60),
  kind: z.enum(OUTLINE_KINDS),
  title: z.string().min(1).max(120),
  goal: z.string().max(400),
  question: z
    .object({
      text: z.string().min(1).max(200),
      mode: z.enum(['single', 'multi']),
      options: z.array(outlineOptionSchema).max(12),
    })
    .nullable(),
  branchOf: z.object({ screenKey: z.string(), optionKey: z.string() }).nullable(),
});
export type OutlineScreen = z.infer<typeof outlineScreenSchema>;

export const outlineSchema = z.object({
  name: z.string().min(1).max(120),
  screens: z.array(outlineScreenSchema).min(2).max(MAX_OUTLINE_SCREENS),
});
export type Outline = z.infer<typeof outlineSchema>;

const text = z.string().max(2000);
const line = z.string().max(200);

export const aiElementSchema = z.discriminatedUnion('type', [
  z.object({ type: z.literal('Slot') }),
  z.object({
    type: z.literal('Text'),
    variant: z.enum(['title', 'subtitle', 'paragraph']),
    text,
  }),
  z.object({
    type: z.literal('List'),
    marker: z.enum(['bullet', 'number', 'check', 'cross']),
    items: z.array(line).max(12),
  }),
  z.object({
    type: z.literal('Faq'),
    items: z.array(z.object({ question: line, answer: text })).max(10),
  }),
  z.object({ type: z.literal('Badge'), text: line }),
  z.object({
    type: z.literal('Rating'),
    label: line,
    variant: z.enum(['stars', 'numbers', 'emoji']),
    minLabel: line,
    maxLabel: line,
  }),
  z.object({
    type: z.literal('Slider'),
    label: line,
    min: z.number(),
    max: z.number(),
    step: z.number(),
    initial: z.number(),
    unit: z.string().max(12),
    minLabel: line,
    maxLabel: line,
  }),
  z.object({
    type: z.literal('TextInput'),
    label: line,
    placeholder: line,
    inputType: z.enum(['text', 'number', 'name']),
    unit: z.string().max(12),
  }),
  z.object({ type: z.literal('DatePicker'), label: line, mode: z.enum(['date', 'birthday']) }),
  z.object({ type: z.literal('Checkbox'), label: line }),
  z.object({
    type: z.literal('Loader'),
    variant: z.enum(['bar', 'circle']),
    title: line,
    steps: z.array(line).max(8),
    seconds: z.number(),
  }),
  z.object({
    type: z.literal('Processing'),
    variant: z.enum(['checklist', 'bars']),
    steps: z.array(line).max(8),
    seconds: z.number(),
  }),
  z.object({ type: z.literal('Timer'), label: line, minutes: z.number(), expiredText: line }),
  z.object({
    type: z.literal('Reviews'),
    items: z.array(z.object({ name: line, text, rating: z.number() })).max(6),
  }),
  z.object({
    type: z.literal('Chart'),
    variant: z.enum(['line', 'bars']),
    title: line,
    unit: z.string().max(12),
    points: z.array(z.object({ label: z.string().max(40), value: z.number() })).max(12),
  }),
  z.object({ type: z.literal('ResultSummary'), title: line }),
]);
export type AiElement = z.infer<typeof aiElementSchema>;

export const AI_ELEMENT_TYPES = [
  'Slot',
  'Text',
  'List',
  'Faq',
  'Badge',
  'Rating',
  'Slider',
  'TextInput',
  'DatePicker',
  'Checkbox',
  'Loader',
  'Processing',
  'Timer',
  'Reviews',
  'Chart',
  'ResultSummary',
] as const;

export const flatElementSchema = z.object({
  type: z.enum(AI_ELEMENT_TYPES),
  variant: z.string().max(20),
  text: z.string().max(2000),
  items: z.array(z.string().max(200)).max(12),
  entries: z
    .array(z.object({ title: z.string().max(200), text: z.string().max(2000), value: z.number() }))
    .max(12),
  numbers: z.array(z.number()).max(4),
  extra: z.array(z.string().max(200)).max(3),
});
export type FlatElement = z.infer<typeof flatElementSchema>;

function pick<T extends string>(value: string, allowed: readonly T[], fallback: T): T {
  return (allowed as readonly string[]).includes(value) ? (value as T) : fallback;
}

export function elementFromFlat(f: FlatElement): AiElement | null {
  const n = (i: number, fallback: number) => f.numbers[i] ?? fallback;
  const x = (i: number) => f.extra[i] ?? '';
  let element: unknown;
  switch (f.type) {
    case 'Slot':
      element = { type: 'Slot' };
      break;
    case 'Text':
      element = {
        type: 'Text',
        variant: pick(f.variant, ['title', 'subtitle', 'paragraph'], 'paragraph'),
        text: f.text,
      };
      break;
    case 'List':
      element = {
        type: 'List',
        marker: pick(f.variant, ['bullet', 'number', 'check', 'cross'], 'check'),
        items: f.items,
      };
      break;
    case 'Faq':
      element = {
        type: 'Faq',
        items: f.entries.map((e) => ({ question: e.title, answer: e.text })),
      };
      break;
    case 'Badge':
      element = { type: 'Badge', text: f.text };
      break;
    case 'Rating':
      element = {
        type: 'Rating',
        label: f.text,
        variant: pick(f.variant, ['stars', 'numbers', 'emoji'], 'stars'),
        minLabel: x(0),
        maxLabel: x(1),
      };
      break;
    case 'Slider':
      element = {
        type: 'Slider',
        label: f.text,
        min: n(0, 0),
        max: n(1, 100),
        step: n(2, 1),
        initial: n(3, n(0, 0)),
        unit: x(0),
        minLabel: x(1),
        maxLabel: x(2),
      };
      break;
    case 'TextInput':
      element = {
        type: 'TextInput',
        label: f.text,
        placeholder: x(0),
        inputType: pick(f.variant, ['text', 'number', 'name'], 'text'),
        unit: x(1),
      };
      break;
    case 'DatePicker':
      element = {
        type: 'DatePicker',
        label: f.text,
        mode: pick(f.variant, ['date', 'birthday'], 'date'),
      };
      break;
    case 'Checkbox':
      element = { type: 'Checkbox', label: f.text };
      break;
    case 'Loader':
      element = {
        type: 'Loader',
        variant: pick(f.variant, ['bar', 'circle'], 'bar'),
        title: f.text,
        steps: f.items,
        seconds: n(0, 5),
      };
      break;
    case 'Processing':
      element = {
        type: 'Processing',
        variant: pick(f.variant, ['checklist', 'bars'], 'checklist'),
        steps: f.items,
        seconds: n(0, 5),
      };
      break;
    case 'Timer':
      element = { type: 'Timer', label: f.text, minutes: n(0, 10), expiredText: x(0) };
      break;
    case 'Reviews':
      element = {
        type: 'Reviews',
        items: f.entries.map((e) => ({ name: e.title, text: e.text, rating: e.value })),
      };
      break;
    case 'Chart':
      element = {
        type: 'Chart',
        variant: pick(f.variant, ['line', 'bars'], 'line'),
        title: f.text,
        unit: x(0),
        points: f.entries.map((e) => ({ label: e.title.slice(0, 40), value: e.value })),
      };
      break;
    case 'ResultSummary':
      element = { type: 'ResultSummary', title: f.text };
      break;
  }
  const parsed = aiElementSchema.safeParse(element);
  return parsed.success ? parsed.data : null;
}

export const screenBlueprintSchema = z.object({
  cta: line.nullable(),
  skipLabel: line.nullable(),
  optionsLayout: z.enum(['list', 'grid', 'cards']).nullable(),
  planNote: line.nullable(),
  emailLabel: line.nullable(),
  elements: z.array(flatElementSchema).max(14),
});
export type ScreenBlueprint = z.infer<typeof screenBlueprintSchema>;

export const themeDraftSchema = z.object({
  primaryColor: z.string(),
  backgroundColor: z.string(),
  textColor: z.string(),
  font: z.enum(['sans', 'serif', 'rounded']),
});
export type ThemeDraft = z.infer<typeof themeDraftSchema>;

export interface BriefPlan {
  key: string;
  title: string;
  displayPrice: string;
}

const KIND_SCREEN_TYPE: Record<OutlineKind, ScreenType> = {
  intro: 'default',
  question: 'default',
  info: 'default',
  input: 'default',
  loader: 'default',
  email: 'auth',
  paywall: 'paywall',
  checkout: 'checkout',
  finish: 'finish',
};

export function screenTypeForKind(kind: OutlineKind): ScreenType {
  return KIND_SCREEN_TYPE[kind];
}

function slugKey(raw: string, fallback: string): string {
  const cleaned = raw
    .toLowerCase()
    .replace(/[^a-z0-9_-]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .slice(0, 40);
  return cleaned === '' ? fallback : cleaned;
}

function uniqueKey(base: string, used: Set<string>): string {
  let key = base;
  let n = 2;
  while (used.has(key)) key = `${base}_${n++}`;
  used.add(key);
  return key;
}

export function normalizeOutline(outline: Outline, brief: Brief, plans: BriefPlan[]): Outline {
  const used = new Set<string>();
  const renamed = new Map<string, string>();
  let screens: OutlineScreen[] = outline.screens.map((s, i) => {
    const key = uniqueKey(slugKey(s.key, `s${i + 1}`), used);
    if (!renamed.has(s.key)) renamed.set(s.key, key);
    let question = s.question;
    if (question) {
      const optUsed = new Set<string>();
      question = {
        ...question,
        options: question.options.map((o, j) => ({
          ...o,
          key: uniqueKey(slugKey(o.key, `o${j + 1}`), optUsed),
        })),
      };
    }
    return { ...s, key, question };
  });

  screens = screens.map((s) => {
    if (s.kind === 'question' && (!s.question || s.question.options.length < 2)) {
      return { ...s, kind: 'info', question: null };
    }
    if (s.kind !== 'question') return { ...s, question: null };
    return s;
  });

  const paid = brief.goal !== 'lead' && plans.length > 0;
  if (!paid) screens = screens.filter((s) => s.kind !== 'paywall' && s.kind !== 'checkout');

  const byKey = new Map(screens.map((s) => [s.key, s]));
  screens = screens.map((s, index) => {
    if (!s.branchOf) return s;
    const sourceKey = renamed.get(s.branchOf.screenKey) ?? s.branchOf.screenKey;
    const source = byKey.get(sourceKey);
    const sourceIndex = screens.findIndex((x) => x.key === sourceKey);
    const option = source?.question?.options.find(
      (o) => o.key === slugKey(s.branchOf!.optionKey, '') || o.key === s.branchOf!.optionKey,
    );
    if (!source || source.branchOf || sourceIndex >= index || !option) {
      return { ...s, branchOf: null };
    }
    const kind: OutlineKind = s.kind === 'loader' ? 'loader' : 'info';
    return {
      ...s,
      kind,
      question: null,
      branchOf: { screenKey: source.key, optionKey: option.key },
    };
  });

  const main = screens.filter((s) => !s.branchOf);
  const side = screens.filter((s) => s.branchOf);
  let body = main.filter(
    (s) => s.kind !== 'finish' && s.kind !== 'paywall' && s.kind !== 'checkout',
  );
  const paywall = main.find((s) => s.kind === 'paywall');
  const checkout = main.find((s) => s.kind === 'checkout');
  const finish = main.find((s) => s.kind === 'finish');
  const tail: OutlineScreen[] = [];
  if (paid) {
    tail.push(
      paywall ?? {
        key: uniqueKey('paywall', used),
        kind: 'paywall',
        title: 'Plans',
        goal: 'Present the plans and the main benefit.',
        question: null,
        branchOf: null,
      },
    );
    tail.push(
      checkout ?? {
        key: uniqueKey('checkout', used),
        kind: 'checkout',
        title: 'Checkout',
        goal: 'Payment for the selected plan.',
        question: null,
        branchOf: null,
      },
    );
  }
  tail.push(
    finish ?? {
      key: uniqueKey('finish', used),
      kind: 'finish',
      title: 'Done',
      goal: 'Thank the visitor and say what happens next.',
      question: null,
      branchOf: null,
    },
  );
  if (body.length === 0) {
    body = [
      {
        key: uniqueKey('intro', used),
        kind: 'intro',
        title: 'Welcome',
        goal: 'Introduce the offer.',
        question: null,
        branchOf: null,
      },
    ];
  }
  const ordered: OutlineScreen[] = [];
  for (const s of body) {
    ordered.push(s);
    for (const b of side) if (b.branchOf?.screenKey === s.key) ordered.push(b);
  }
  return {
    name: outline.name,
    screens: [...ordered.slice(0, MAX_OUTLINE_SCREENS - tail.length), ...tail],
  };
}

type PuckItem = PuckData['content'][number];

export interface CompileInput {
  outline: Outline;
  blueprints: Record<string, ScreenBlueprint | undefined>;
  theme: ThemeDraft | null;
  brief: Brief;
  plans: BriefPlan[];
  allowed: (elementType: string, screenType: ScreenType) => boolean;
  newId: () => string;
}

function hex(value: string | undefined | null, fallback: string): string {
  return value && HEX.test(value) ? value : fallback;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, Number.isFinite(value) ? value : min));
}

function elementProps(element: Exclude<AiElement, { type: 'Slot' }>): Record<string, unknown> {
  switch (element.type) {
    case 'Text':
      return { variant: element.variant, text: element.text };
    case 'List':
      return { marker: element.marker, items: element.items.map((t) => ({ text: t })) };
    case 'Faq':
      return { items: element.items, openFirst: false };
    case 'Badge':
      return { text: element.text, align: 'center' };
    case 'Rating':
      return {
        label: element.label,
        variant: element.variant,
        max: 5,
        minLabel: element.minLabel,
        maxLabel: element.maxLabel,
        required: true,
      };
    case 'Slider': {
      const min = Number.isFinite(element.min) ? element.min : 0;
      const max = element.max > min ? element.max : min + 100;
      return {
        label: element.label,
        min,
        max,
        step: clamp(element.step, 0.1, max - min),
        initial: clamp(element.initial, min, max),
        unit: element.unit,
        minLabel: element.minLabel,
        maxLabel: element.maxLabel,
      };
    }
    case 'TextInput':
      return {
        label: element.label,
        placeholder: element.placeholder,
        inputType: element.inputType,
        unit: element.unit,
        required: true,
      };
    case 'DatePicker':
      return { label: element.label, mode: element.mode, required: true };
    case 'Checkbox':
      return { label: element.label, linkLabel: '', linkUrl: '', required: true };
    case 'Loader':
      return {
        variant: element.variant,
        title: element.title,
        steps: element.steps.map((t) => ({ text: t })),
        seconds: clamp(Math.round(element.seconds), 2, 15),
        autoNext: true,
      };
    case 'Processing':
      return {
        variant: element.variant,
        steps: element.steps.map((t) => ({ text: t })),
        seconds: clamp(Math.round(element.seconds), 2, 15),
        question: '',
        autoNext: true,
      };
    case 'Timer':
      return {
        variant: 'row',
        label: element.label,
        minutes: clamp(Math.round(element.minutes), 1, 60),
        expiredText: element.expiredText,
      };
    case 'Reviews':
      return {
        layout: 'list',
        items: element.items.map((r) => ({
          name: r.name,
          text: r.text,
          rating: clamp(Math.round(r.rating), 1, 5),
          avatar: '',
        })),
      };
    case 'Chart':
      return {
        variant: element.variant,
        title: element.title,
        unit: element.unit,
        color: '',
        points: element.points,
      };
    case 'ResultSummary':
      return { title: element.title, showAnswers: false };
  }
}

const AUTO_ADVANCING = new Set(['Loader', 'Processing']);

export interface ScreenBuildContext {
  plans: BriefPlan[];
  hasPaywall: boolean;
  allowed: (elementType: string, screenType: ScreenType) => boolean;
  newId: () => string;
}

export const optionIdFor = (key: string) => `opt_${key}`;

export function buildScreen(
  s: OutlineScreen,
  bp: ScreenBlueprint | undefined,
  ctx: ScreenBuildContext,
  placement: { id: string; position: { x: number; y: number }; first: boolean },
): Screen {
  const { plans, hasPaywall, allowed, newId } = ctx;
  const elId = () => `el_${newId()}`;
  const selectedPlan = Math.min(plans.length, plans.length >= 3 ? 2 : 1);
  const structural = (): PuckItem | null => {
    if (s.kind === 'question' && s.question) {
      return {
        type: 'OptionList',
        props: {
          id: elId(),
          mode: s.question.mode,
          layout: bp?.optionsLayout ?? 'list',
          question: '',
          options: s.question.options.map((o) => ({
            id: optionIdFor(o.key),
            label: o.label,
            ...(o.emoji ? { emoji: o.emoji } : {}),
          })),
        },
      };
    }
    if (s.kind === 'email') {
      return {
        type: 'EmailInput',
        props: {
          id: elId(),
          label: bp?.emailLabel ?? 'Email',
          placeholder: 'you@example.com',
          required: true,
          consentLabel: '',
        },
      };
    }
    if (s.kind === 'paywall') {
      return {
        type: 'PlanPicker',
        props: {
          id: elId(),
          groups: [],
          items: plans.map((p, i) => ({
            planKey: p.key,
            title: p.title,
            price: p.displayPrice,
            oldPrice: '',
            period: '',
            perDay: '',
            badge: i + 1 === selectedPlan && plans.length > 1 ? 'Most popular' : '',
            group: '',
          })),
          selected: selectedPlan,
          note: bp?.planNote ?? '',
        },
      };
    }
    if (s.kind === 'checkout') {
      return {
        type: 'CheckoutBlock',
        props: hasPaywall
          ? { id: elId(), source: 'picker', planKey: '' }
          : { id: elId(), source: 'fixed', planKey: plans[0]?.key ?? '' },
      };
    }
    return null;
  };

  const type = screenTypeForKind(s.kind);
  const slot = structural();
  const content: PuckItem[] = [];
  let slotPlaced = slot === null;
  for (const flat of bp?.elements ?? []) {
    const element = elementFromFlat(flat);
    if (!element) continue;
    if (element.type === 'Slot') {
      if (!slotPlaced && slot) {
        content.push(slot);
        slotPlaced = true;
      }
      continue;
    }
    if (!allowed(element.type, type)) continue;
    content.push({ type: element.type, props: { id: elId(), ...elementProps(element) } });
  }
  if (!slotPlaced && slot) {
    const lead = content.findIndex((c) => c.type !== 'Text' || c.props.variant === 'paragraph');
    content.splice(lead === -1 ? content.length : lead, 0, slot);
  }
  if (content.length === 0 || !content.some((c) => c.type === 'Text')) {
    content.unshift({ type: 'Text', props: { id: elId(), variant: 'title', text: s.title } });
  }
  const singleQuestion = s.kind === 'question' && s.question?.mode === 'single';
  const autoAdvances = content.some((c) => AUTO_ADVANCING.has(c.type));
  const needsButton =
    s.kind !== 'checkout' && s.kind !== 'finish' && !singleQuestion && !autoAdvances;
  if (needsButton) {
    content.push({
      type: 'Button',
      props: {
        id: elId(),
        label: bp?.cta ?? 'Continue',
        action: 'next',
        style: { position: 'attached' },
      },
    });
  }
  if (s.kind === 'paywall') {
    content.push({
      type: 'Button',
      props: { id: elId(), label: bp?.skipLabel ?? 'Maybe later', action: 'skip' },
    });
  }
  const quiz = s.kind === 'question' || s.kind === 'input';
  return {
    id: placement.id,
    type,
    title: s.title,
    content: { root: { props: {} }, content },
    animation: { preset: placement.first ? 'fade' : 'slide_left' },
    position: placement.position,
    ...(quiz
      ? { header: { backButton: true, progress: true, progressType: 'line' as const } }
      : {}),
    ...(singleQuestion ? { autoNavigation: true } : {}),
  };
}

export function compileFunnel(input: CompileInput): FunnelDefinition {
  const { outline, blueprints, brief, plans, allowed, newId } = input;
  const screenIdOf = new Map(outline.screens.map((s) => [s.key, `screen_${s.key}`]));
  const optionIdOf = optionIdFor;
  const ctx: ScreenBuildContext = {
    plans,
    hasPaywall: outline.screens.some((s) => s.kind === 'paywall'),
    allowed,
    newId,
  };

  const screens: Screen[] = [];
  const mainKeys = outline.screens.filter((s) => !s.branchOf).map((s) => s.key);
  outline.screens.forEach((s) => {
    const mainIndex = mainKeys.indexOf(s.key);
    const sideOf = s.branchOf ? mainKeys.indexOf(s.branchOf.screenKey) : -1;
    const siblings = s.branchOf
      ? outline.screens.filter((x) => x.branchOf?.screenKey === s.branchOf!.screenKey)
      : [];
    screens.push(
      buildScreen(s, blueprints[s.key], ctx, {
        id: screenIdOf.get(s.key)!,
        first: mainIndex === 0,
        position:
          mainIndex >= 0
            ? { x: mainIndex * 320, y: 0 }
            : { x: sideOf * 320 + 160, y: 360 * (siblings.indexOf(s) + 1) },
      }),
    );
  });

  const edges: Edge[] = [];
  let edgeN = 0;
  const edge = (from: string, to: string, condition: Edge['condition']) => {
    edges.push({
      id: `e_${++edgeN}`,
      sourceScreenId: screenIdOf.get(from)!,
      targetScreenId: screenIdOf.get(to)!,
      condition,
    });
  };
  const finishKey = mainKeys[mainKeys.length - 1]!;
  mainKeys.forEach((key, i) => {
    const s = outline.screens.find((x) => x.key === key)!;
    const next = mainKeys[i + 1];
    if (!next) return;
    if (s.kind === 'checkout') {
      edge(key, next, { kind: 'payment_succeeded', screenId: screenIdOf.get(key)! });
      return;
    }
    if (s.kind === 'paywall') {
      edge(key, next, { kind: 'always' });
      if (next !== finishKey) edge(key, finishKey, { kind: 'default' });
      return;
    }
    const branches = outline.screens.filter((x) => x.branchOf?.screenKey === key);
    if (branches.length > 0 && s.question) {
      const kind = s.question.mode === 'multi' ? 'answer_includes' : 'answer_equals';
      for (const b of branches) {
        edge(key, b.key, {
          kind,
          screenId: screenIdOf.get(key)!,
          optionId: optionIdOf(b.branchOf!.optionKey),
        });
        edge(b.key, next, { kind: 'always' });
      }
      edge(key, next, { kind: 'default' });
      return;
    }
    edge(key, next, { kind: 'always' });
  });

  const draft = input.theme;
  const primary = hex(brief.brandColor, hex(draft?.primaryColor, '#4f46e5'));
  const theme: Theme = {
    primaryColor: primary,
    backgroundColor: hex(draft?.backgroundColor, '#ffffff'),
    textColor: hex(draft?.textColor, '#111827'),
    screen: { fontFamily: draft?.font ?? 'sans', lineColor: primary },
  };

  return {
    schemaVersion: CURRENT_SCHEMA_VERSION,
    startScreenId: screenIdOf.get(mainKeys[0]!)!,
    screens: screens.filter((s) => ID_PATTERN.test(s.id)),
    edges,
    theme,
  };
}
