import { z } from 'zod';
import type { FunnelDefinition } from './schema';

export const PLAN_PICKER_TYPES: ReadonlySet<string> = new Set([
  'PlanPicker',
  'PlanPickerComposite',
  'BillingPlanPicker',
  'TrialPicker',
]);

export const ratingProps = z.object({
  label: z.string().default(''),
  variant: z.enum(['stars', 'numbers', 'emoji']).default('stars'),
  max: z.number().int().min(3).max(10).default(5),
  minLabel: z.string().default(''),
  maxLabel: z.string().default(''),
  required: z.boolean().default(true),
});

export const sliderProps = z.object({
  label: z.string().default(''),
  min: z.number().default(0),
  max: z.number().default(100),
  step: z.number().min(0.1).default(1),
  initial: z.number().default(50),
  unit: z.string().max(12).default(''),
  minLabel: z.string().default(''),
  maxLabel: z.string().default(''),
});

export const textInputProps = z.object({
  label: z.string().default(''),
  placeholder: z.string().default(''),
  inputType: z.enum(['text', 'number', 'tel', 'name', 'password']).default('text'),
  unit: z.string().max(12).default(''),
  min: z.number().optional(),
  max: z.number().optional(),
  required: z.boolean().default(true),
});

export const datePickerProps = z.object({
  label: z.string().default(''),
  mode: z.enum(['date', 'birthday']).default('birthday'),
  required: z.boolean().default(true),
});

export const checkboxProps = z.object({
  label: z.string().default('I agree to the Terms and Privacy Policy'),
  linkLabel: z.string().default(''),
  linkUrl: z.string().default(''),
  required: z.boolean().default(true),
});

export const SELECTED_PLAN_KEY = 'plan';

const planItem = z.object({
  planKey: z.string().default(''),
  title: z.string().default(''),
  price: z.string().default(''),
  oldPrice: z.string().default(''),
  period: z.string().default(''),
  perDay: z.string().default(''),
  badge: z.string().default(''),
  group: z.string().default(''),
});

export const planPickerProps = z.object({
  groups: z.array(z.object({ label: z.string() })).default([]),
  items: z.array(planItem).default([]),
  selected: z.number().int().min(1).max(10).default(1),
  note: z.string().default(''),
});

export const trialPickerProps = z.object({
  title: z.string().default(''),
  items: z.array(z.object({ planKey: z.string().default(''), price: z.string() })).default([]),
  selected: z.number().int().min(1).max(10).default(1),
  note: z.string().default(''),
});

export type PlanItem = z.infer<typeof planItem>;

export const walletProps = z.object({
  source: z.enum(['fixed', 'picker']).default('picker'),
  planKey: z.string().default(''),
  label: z.string().default('Buy with'),
});

export function pickerPlanKeys(item: { type: string; props: Record<string, unknown> }): string[] {
  if (!PLAN_PICKER_TYPES.has(item.type)) return [];
  const parsed =
    item.type === 'TrialPicker'
      ? trialPickerProps.safeParse(item.props)
      : planPickerProps.safeParse(item.props);
  if (!parsed.success) return [];
  return parsed.data.items.map((i) => i.planKey).filter((k) => k !== '');
}

export function defaultPickerPlan(definition: FunnelDefinition): string {
  for (const screen of definition.screens) {
    for (const item of screen.content.content) {
      if (!PLAN_PICKER_TYPES.has(item.type)) continue;
      const parsed =
        item.type === 'TrialPicker'
          ? trialPickerProps.safeParse(item.props)
          : planPickerProps.safeParse(item.props);
      if (!parsed.success) continue;
      const pick = parsed.data.items[parsed.data.selected - 1] ?? parsed.data.items[0];
      if (pick?.planKey) return pick.planKey;
    }
  }
  return '';
}

export const totalsProps = z.object({
  rows: z.array(z.object({ label: z.string(), value: z.string() })).default([]),
  totalLabel: z.string().default('Total today'),
  totalValue: z.string().default(''),
  note: z.string().default(''),
});

export const PLAN_BOUND_BLOCKS: ReadonlySet<string> = new Set([
  'CheckoutBlock',
  'WalletButton',
  'Button',
]);

type ContentItem = { type: string; props: Record<string, unknown> };

export function isPlanBound(item: ContentItem): boolean {
  if (!PLAN_BOUND_BLOCKS.has(item.type)) return false;
  return item.type !== 'Button' || item.props.action === 'purchase';
}

export function usesPickerPlan(item: ContentItem): boolean {
  return (
    item.props.source === 'picker' ||
    ((item.type === 'WalletButton' || item.type === 'Button') && item.props.source !== 'fixed')
  );
}

export function unknownPlanKeys(
  definition: FunnelDefinition,
  knownPlanKeys: Iterable<string>,
): string[] {
  const known = new Set(knownPlanKeys);
  const unknown = new Set<string>();
  for (const screen of definition.screens) {
    for (const item of screen.content.content) {
      const keys = pickerPlanKeys(item);
      if (isPlanBound(item) && !usesPickerPlan(item)) {
        const key = item.props.planKey;
        if (typeof key === 'string' && key !== '') keys.push(key);
      }
      for (const key of keys) {
        if (!known.has(key)) unknown.add(key);
      }
    }
  }
  return [...unknown];
}

export const ELEMENT_PROP_SCHEMAS: Readonly<Record<string, z.ZodType>> = {
  Rating: ratingProps,
  Slider: sliderProps,
  TextInput: textInputProps,
  DatePicker: datePickerProps,
  Checkbox: checkboxProps,
  PlanPicker: planPickerProps,
  PlanPickerComposite: planPickerProps,
  BillingPlanPicker: planPickerProps,
  TrialPicker: trialPickerProps,
  WalletButton: walletProps,
  Totals: totalsProps,
};
