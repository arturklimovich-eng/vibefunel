import 'server-only';
import { z } from 'zod';
import { planKeySchema } from './types';

const planSchema = z.object({
  title: z.string().min(1).max(200),
  amount: z.number().int().positive().max(99_999_999),
  currency: z
    .string()
    .regex(/^[a-zA-Z]{3}$/)
    .transform((value) => value.toLowerCase()),
  stripePriceId: z
    .string()
    .regex(/^price_[A-Za-z0-9]+$/)
    .optional(),
  solidgateProductId: z.string().min(1).max(100).optional(),
});

const plansSchema = z
  .record(planKeySchema, planSchema)
  .refine((plans) => Object.keys(plans).length > 0, { message: 'At least one plan is required.' });

export type Plan = z.infer<typeof planSchema>;
export type PlanCatalogue = Record<string, Plan>;

export type PlansResult = { ok: true; plans: PlanCatalogue } | { ok: false; error: string };

export function parsePlans(raw: string | undefined): PlansResult {
  if (raw === undefined || raw.trim() === '') {
    return { ok: false, error: 'PAYMENT_PLANS_JSON is not set.' };
  }
  let json: unknown;
  try {
    json = JSON.parse(raw);
  } catch (error) {
    if (error instanceof SyntaxError) {
      return { ok: false, error: 'PAYMENT_PLANS_JSON is not valid JSON.' };
    }
    throw error;
  }
  const parsed = plansSchema.safeParse(json);
  if (!parsed.success) {
    const first = parsed.error.issues[0];
    const where = first && first.path.length > 0 ? `${first.path.join('.')}: ` : '';
    return { ok: false, error: `PAYMENT_PLANS_JSON invalid: ${where}${first?.message ?? ''}` };
  }
  return { ok: true, plans: parsed.data };
}

let cache: { raw: string | undefined; result: PlansResult } | null = null;

export function loadPlans(): PlansResult {
  const raw = process.env.PAYMENT_PLANS_JSON;
  if (cache && cache.raw === raw) return cache.result;
  const result = parsePlans(raw);
  cache = { raw, result };
  return result;
}

export function getPlan(planKey: string): Plan | null {
  const loaded = loadPlans();
  if (!loaded.ok) return null;
  return Object.hasOwn(loaded.plans, planKey) ? (loaded.plans[planKey] ?? null) : null;
}

export function formatPrice(amount: number, currency: string): string {
  const formatter = new Intl.NumberFormat('en', { style: 'currency', currency });
  const digits = formatter.resolvedOptions().maximumFractionDigits ?? 2;
  return formatter.format(amount / 10 ** digits);
}

export interface PublicPlan {
  key: string;
  title: string;
  displayPrice: string;
}

export function listPublicPlans(): { plans: PublicPlan[]; error: string | null } {
  const loaded = loadPlans();
  if (!loaded.ok) return { plans: [], error: loaded.error };
  return {
    plans: Object.entries(loaded.plans).map(([key, plan]) => ({
      key,
      title: plan.title,
      displayPrice: formatPrice(plan.amount, plan.currency),
    })),
    error: null,
  };
}
