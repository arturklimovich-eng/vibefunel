import 'server-only';
import type { FunnelDefinition } from '@funnel/schema';
import type { PublishedReader } from '../funnel-repository';
import { pickerPlanKeys } from '@/lib/puck/element-schemas';
import { getPlan } from './plans';
import type { Plan } from './plans';

export const PLAN_BOUND_BLOCKS: ReadonlySet<string> = new Set([
  'CheckoutBlock',
  'WalletButton',
  'Button',
]);

export type CheckoutTarget =
  | { ok: true; funnelId: string; projectId: string; plan: Plan; definition: FunnelDefinition }
  | { ok: false; status: 400 | 404 | 503; error: string };

export async function resolveCheckoutTarget(
  reader: PublishedReader,
  input: { slug: string; screenId: string; planKey: string },
): Promise<CheckoutTarget> {
  const plan = getPlan(input.planKey);
  if (!plan) return { ok: false, status: 400, error: 'unknown_plan' };
  const published = await reader.getPublishedBySlug(input.slug);
  if (!published) return { ok: false, status: 404, error: 'funnel_not_found' };
  const screen = published.definition.screens.find((s) => s.id === input.screenId);
  if (!screen || (screen.type !== 'checkout' && screen.type !== 'upsell')) {
    return { ok: false, status: 400, error: 'invalid_screen' };
  }
  const pickerKeys = new Set(
    published.definition.screens.flatMap((s) => s.content.content.flatMap(pickerPlanKeys)),
  );
  const bound = screen.content.content.some((item) => {
    if (!PLAN_BOUND_BLOCKS.has(item.type)) return false;
    if (item.type === 'Button' && item.props.action !== 'purchase') return false;
    const fromPicker =
      item.props.source === 'picker' ||
      ((item.type === 'WalletButton' || item.type === 'Button') && item.props.source !== 'fixed');
    return fromPicker ? pickerKeys.has(input.planKey) : item.props.planKey === input.planKey;
  });
  if (!bound) return { ok: false, status: 400, error: 'plan_not_bound' };
  return {
    ok: true,
    funnelId: published.funnelId,
    projectId: published.projectId,
    plan,
    definition: published.definition,
  };
}
