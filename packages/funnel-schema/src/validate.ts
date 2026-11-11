import { z } from 'zod';
import { ELEMENT_PROP_SCHEMAS, unknownPlanKeys } from './element-props';
import { flattenContent } from './walk';
import { isPaymentType, isSkipType } from './schema';
import type { Edge, FunnelDefinition, Screen } from './schema';

export type IssueSeverity = 'error' | 'warning';
export type IssueCode =
  | 'missing_start_screen'
  | 'duplicate_screen_id'
  | 'duplicate_edge_id'
  | 'edge_source_not_found'
  | 'edge_target_not_found'
  | 'unreachable_screen'
  | 'dead_end'
  | 'option_list_invalid'
  | 'cycle'
  | 'condition_screen_mismatch'
  | 'condition_option_missing'
  | 'condition_source_not_quiz'
  | 'edge_duplicate'
  | 'edge_unreachable'
  | 'option_mode_mismatch'
  | 'quiz_without_options'
  | 'multiple_option_lists'
  | 'payment_bypass'
  | 'skip_not_allowed'
  | 'skip_without_default'
  | 'checkout_without_plan'
  | 'plan_picker_unbound'
  | 'button_destination_missing'
  | 'decline_to_success'
  | 'condition_source_not_payment'
  | 'schema_invalid'
  | 'unknown_plan'
  | 'element_props_invalid'
  | 'patch_target_missing'
  | 'patch_id_taken'
  | 'patch_last_screen';

export interface ValidationIssue {
  code: IssueCode;
  severity: IssueSeverity;
  message: string;
  screenId?: string;
  edgeId?: string;
  path?: string;
}

export type ValidateMode = 'save' | 'publish';

export interface ValidateOptions {
  allowCycles?: boolean;
  mode?: ValidateMode;
  planKeys?: Iterable<string>;
}

export interface ValidationResult {
  ok: boolean;
  issues: ValidationIssue[];
  errors: ValidationIssue[];
  warnings: ValidationIssue[];
}

const TERMINAL_TYPES: ReadonlySet<string> = new Set(['finish']);

const optionListSchema = z.object({
  mode: z.enum(['single', 'multi']).default('single'),
  options: z.array(z.object({ id: z.string() })).default([]),
});

interface OptionListInfo {
  mode: 'single' | 'multi';
  optionIds: string[];
}

interface OptionListScan {
  lists: OptionListInfo[];
  invalid: string[];
}

function scanOptionLists(screen: Screen): OptionListScan {
  const lists: OptionListInfo[] = [];
  const invalid: string[] = [];
  for (const item of screen.content.content) {
    if (item.type !== 'OptionList') continue;
    const parsed = optionListSchema.safeParse(item.props);
    if (parsed.success) {
      lists.push({ mode: parsed.data.mode, optionIds: parsed.data.options.map((o) => o.id) });
    } else {
      invalid.push(parsed.error.issues.map((i) => i.message).join('; '));
    }
  }
  return { lists, invalid };
}

function getOptionLists(screen: Screen): OptionListInfo[] {
  return scanOptionLists(screen).lists;
}

function isQuiz(screen: Screen): boolean {
  return scanOptionLists(screen).lists.length > 0;
}

function quizMode(screen: Screen): 'single' | 'multi' | undefined {
  return scanOptionLists(screen).lists[0]?.mode;
}

function isFallbackEdge(edge: Edge): boolean {
  return edge.condition.kind === 'always' || edge.condition.kind === 'default';
}

function isPaymentScreen(screen: Screen): boolean {
  return isPaymentType(screen.type);
}

export function validateFunnel(
  definition: FunnelDefinition,
  options: ValidateOptions = {},
): ValidationResult {
  const issues: ValidationIssue[] = [];
  const allowCycles = options.allowCycles ?? definition.allowCycles ?? false;
  const mode: ValidateMode = options.mode ?? 'publish';
  const gateSeverity: IssueSeverity = mode === 'publish' ? 'error' : 'warning';
  const screenIds = new Set<string>();
  const screensById = new Map<string, Screen>();

  for (const s of definition.screens) {
    if (screenIds.has(s.id)) {
      issues.push({
        code: 'duplicate_screen_id',
        severity: 'error',
        message: `Duplicate screen id "${s.id}".`,
        screenId: s.id,
      });
    }
    screenIds.add(s.id);
    screensById.set(s.id, s);
  }
  const edgeIds = new Set<string>();
  for (const e of definition.edges) {
    if (edgeIds.has(e.id)) {
      issues.push({
        code: 'duplicate_edge_id',
        severity: 'error',
        message: `Duplicate edge id "${e.id}".`,
        edgeId: e.id,
      });
    }
    edgeIds.add(e.id);
  }

  const hasStart = screenIds.has(definition.startScreenId);
  if (!hasStart) {
    issues.push({
      code: 'missing_start_screen',
      severity: 'error',
      message: `Start screen "${definition.startScreenId}" does not exist.`,
      screenId: definition.startScreenId,
    });
  }

  const adjacency = new Map<string, string[]>();
  for (const id of screenIds) adjacency.set(id, []);
  for (const e of definition.edges) {
    const sourceOk = screenIds.has(e.sourceScreenId);
    const targetOk = screenIds.has(e.targetScreenId);
    if (!sourceOk) {
      issues.push({
        code: 'edge_source_not_found',
        severity: 'error',
        message: `Edge "${e.id}" has unknown source screen "${e.sourceScreenId}".`,
        edgeId: e.id,
        screenId: e.sourceScreenId,
      });
    }
    if (!targetOk) {
      issues.push({
        code: 'edge_target_not_found',
        severity: 'error',
        message: `Edge "${e.id}" has unknown target screen "${e.targetScreenId}".`,
        edgeId: e.id,
        screenId: e.targetScreenId,
      });
    }
    if (sourceOk && targetOk) adjacency.get(e.sourceScreenId)?.push(e.targetScreenId);
  }

  const buttonLinked = new Set<string>();
  for (const s of definition.screens) {
    if (isPaymentScreen(s)) continue;
    for (const item of flattenContent(s.content.content)) {
      if (item.type !== 'Button') continue;
      const action = item.props.action ?? 'next';
      const destination = item.props.destination;
      if (action !== 'next' || typeof destination !== 'string' || destination === '') continue;
      if (screenIds.has(destination)) {
        adjacency.get(s.id)?.push(destination);
        buttonLinked.add(s.id);
      } else {
        issues.push({
          code: 'button_destination_missing',
          severity: gateSeverity,
          message: `A button on screen "${s.id}" goes to screen "${destination}", which does not exist.`,
          screenId: s.id,
        });
      }
    }
  }

  for (const e of definition.edges) {
    const source = screensById.get(e.sourceScreenId);
    if (!source) continue;
    const kind = e.condition.kind;
    if (isPaymentScreen(source) && kind !== 'payment_succeeded' && kind !== 'default') {
      issues.push({
        code: 'payment_bypass',
        severity: 'error',
        message: `Edge "${e.id}" leaves the ${source.type} screen "${source.id}" with a "${kind}" condition. Only "payment_succeeded" (purchase) or one "default" (decline) may leave a payment screen.`,
        edgeId: e.id,
        screenId: source.id,
      });
    }
    if (e.condition.kind === 'payment_succeeded') {
      if (!isPaymentScreen(source)) {
        issues.push({
          code: 'condition_source_not_payment',
          severity: 'error',
          message: `Edge "${e.id}" uses "payment_succeeded" but source screen "${source.id}" is not a checkout or upsell screen.`,
          edgeId: e.id,
          screenId: source.id,
        });
      }
      if (e.condition.screenId !== e.sourceScreenId) {
        issues.push({
          code: 'condition_screen_mismatch',
          severity: 'error',
          message: `Edge "${e.id}" condition refers to screen "${e.condition.screenId}" but its source is "${e.sourceScreenId}".`,
          edgeId: e.id,
          screenId: e.sourceScreenId,
        });
      }
    }
  }

  const optionIdCache = new Map<string, Set<string>>();
  const optionIdsOf = (screen: Screen): Set<string> => {
    let ids = optionIdCache.get(screen.id);
    if (!ids) {
      ids = new Set(getOptionLists(screen).flatMap((l) => l.optionIds));
      optionIdCache.set(screen.id, ids);
    }
    return ids;
  };

  for (const e of definition.edges) {
    const c = e.condition;
    if (c.kind !== 'answer_equals' && c.kind !== 'answer_includes') continue;
    const source = screensById.get(e.sourceScreenId);
    if (!source) continue;
    if (c.screenId !== e.sourceScreenId) {
      issues.push({
        code: 'condition_screen_mismatch',
        severity: 'error',
        message: `Edge "${e.id}" condition refers to screen "${c.screenId}" but its source is "${e.sourceScreenId}".`,
        edgeId: e.id,
        screenId: e.sourceScreenId,
      });
    }
    if (!isQuiz(source)) {
      issues.push({
        code: 'condition_source_not_quiz',
        severity: 'error',
        message: `Edge "${e.id}" uses an answer condition but source screen "${source.id}" is not a quiz screen.`,
        edgeId: e.id,
        screenId: source.id,
      });
    }
    if (!optionIdsOf(source).has(c.optionId)) {
      issues.push({
        code: 'condition_option_missing',
        severity: 'error',
        message: `Edge "${e.id}" refers to option "${c.optionId}" which does not exist on screen "${source.id}".`,
        edgeId: e.id,
        screenId: source.id,
      });
    }
  }

  for (const s of definition.screens) {
    if (!isQuiz(s)) continue;
    const { lists, invalid } = scanOptionLists(s);
    for (const detail of invalid) {
      issues.push({
        code: 'option_list_invalid',
        severity: 'error',
        message: `Screen "${s.id}" has an option list with invalid options (${detail}).`,
        screenId: s.id,
      });
    }
    if (invalid.length === 0 && !lists.some((l) => l.optionIds.length > 0)) {
      issues.push({
        code: 'quiz_without_options',
        severity: gateSeverity,
        message: `Screen "${s.id}" has an Options element without options.`,
        screenId: s.id,
      });
    }
    if (lists.length > 1) {
      issues.push({
        code: 'multiple_option_lists',
        severity: gateSeverity,
        message: `Screen "${s.id}" has ${lists.length} Options elements. Use one per screen so the answer is unambiguous.`,
        screenId: s.id,
      });
    }
  }

  for (const e of definition.edges) {
    const c = e.condition;
    if (c.kind !== 'answer_equals' && c.kind !== 'answer_includes') continue;
    const source = screensById.get(e.sourceScreenId);
    const mode = source ? quizMode(source) : undefined;
    if (!source || !mode) continue;
    const expected = mode === 'multi' ? 'answer_includes' : 'answer_equals';
    if (c.kind !== expected) {
      issues.push({
        code: 'option_mode_mismatch',
        severity: 'error',
        message: `Edge "${e.id}" uses "${c.kind}" but the Options element on "${source.id}" is ${mode === 'multi' ? 'multiple' : 'single'} choice.`,
        edgeId: e.id,
        screenId: source.id,
      });
    }
  }

  const PICKERS = new Set([
    'PlanPicker',
    'PlanPickerComposite',
    'BillingPlanPicker',
    'TrialPicker',
  ]);
  let pickerPlans = 0;
  for (const s of definition.screens) {
    for (const item of s.content.content) {
      if (!PICKERS.has(item.type)) continue;
      const items = Array.isArray(item.props.items) ? item.props.items : [];
      const keys = items.map((i: unknown) =>
        typeof i === 'object' && i !== null && 'planKey' in i && typeof i.planKey === 'string'
          ? i.planKey
          : '',
      );
      pickerPlans += keys.filter((k) => k !== '').length;
      if (keys.some((k) => k === '')) {
        issues.push({
          code: 'plan_picker_unbound',
          severity: gateSeverity,
          message: `Screen "${s.id}" has a plan picker option without a Stripe plan selected.`,
          screenId: s.id,
        });
      }
    }
  }

  for (const s of definition.screens) {
    if (!isPaymentScreen(s)) continue;
    const bound = s.content.content.some((item) => {
      const purchase = item.type === 'Button' && item.props.action === 'purchase';
      if (item.type !== 'CheckoutBlock' && item.type !== 'WalletButton' && !purchase) return false;
      const fromPicker =
        item.props.source === 'picker' ||
        ((item.type === 'WalletButton' || purchase) && item.props.source !== 'fixed');
      if (fromPicker) return pickerPlans > 0;
      return typeof item.props.planKey === 'string' && item.props.planKey !== '';
    });
    if (!bound) {
      issues.push({
        code: 'checkout_without_plan',
        severity: gateSeverity,
        message: `Screen "${s.id}" is ${s.type} but has no Checkout or Wallet Button with a plan (fixed, or picked on a paywall that lists plans).`,
        screenId: s.id,
      });
    }
  }

  for (const s of definition.screens) {
    const hasSkip = s.content.content.some(
      (item) => item.type === 'Button' && item.props.action === 'skip',
    );
    if (!hasSkip) continue;
    if (!isSkipType(s.type)) {
      issues.push({
        code: 'skip_not_allowed',
        severity: 'error',
        message: `Screen "${s.id}" is ${s.type} and cannot have a "skip" button; only paywall, checkout and upsell screens can.`,
        screenId: s.id,
      });
    } else if (
      !definition.edges.some((e) => e.sourceScreenId === s.id && e.condition.kind === 'default')
    ) {
      issues.push({
        code: 'skip_without_default',
        severity: gateSeverity,
        message: `Screen "${s.id}" has a "skip" button but no "default" edge for it to follow.`,
        screenId: s.id,
      });
    }
  }

  for (const e of definition.edges) {
    const source = screensById.get(e.sourceScreenId);
    const target = screensById.get(e.targetScreenId);
    if (
      source &&
      target &&
      isPaymentScreen(source) &&
      e.condition.kind === 'default' &&
      target.type === 'finish'
    ) {
      issues.push({
        code: 'decline_to_success',
        severity: 'warning',
        message: `Decline edge "${e.id}" from ${source.type} screen "${source.id}" goes straight to the success screen "${target.id}".`,
        edgeId: e.id,
        screenId: source.id,
      });
    }
  }

  const outgoingBySource = new Map<string, Edge[]>();
  for (const e of definition.edges) {
    const list = outgoingBySource.get(e.sourceScreenId) ?? [];
    list.push(e);
    outgoingBySource.set(e.sourceScreenId, list);
  }
  for (const [sourceId, edges] of outgoingBySource) {
    const sourceScreen = screensById.get(sourceId);
    if (!sourceScreen) continue;
    const skipSource = isSkipType(sourceScreen.type);
    const anyAlways = edges.find((e) => e.condition.kind === 'always') ?? null;
    const seen = new Set<string>();
    let alwaysEdge: Edge | null = null;
    let defaultEdge: Edge | null = null;
    let paymentEdge: Edge | null = null;
    for (const e of edges) {
      const key = `${e.targetScreenId}|${JSON.stringify(e.condition)}`;
      if (seen.has(key)) {
        issues.push({
          code: 'edge_duplicate',
          severity: 'warning',
          message: `Edge "${e.id}" duplicates an earlier edge from "${sourceId}".`,
          edgeId: e.id,
          screenId: sourceId,
        });
        continue;
      }
      seen.add(key);
      let shadow = alwaysEdge;
      if (e.condition.kind === 'default') {
        shadow = defaultEdge;
        if (!shadow && !skipSource) shadow = anyAlways;
      }
      if (shadow) {
        issues.push({
          code: 'edge_unreachable',
          severity: 'warning',
          message: `Edge "${e.id}" can never be taken because of the "${shadow.condition.kind}" edge "${shadow.id}" from "${sourceId}".`,
          edgeId: e.id,
          screenId: sourceId,
        });
      }
      if (e.condition.kind === 'payment_succeeded') {
        if (paymentEdge) {
          issues.push({
            code: 'edge_unreachable',
            severity: 'warning',
            message: `Edge "${e.id}" can never be taken because of the "payment_succeeded" edge "${paymentEdge.id}" from "${sourceId}".`,
            edgeId: e.id,
            screenId: sourceId,
          });
        } else {
          paymentEdge = e;
        }
      }
      if (e.condition.kind === 'always' && !alwaysEdge) alwaysEdge = e;
      if (e.condition.kind === 'default' && !defaultEdge) defaultEdge = e;
    }
  }

  if (hasStart) {
    const reachable = new Set<string>();
    const stack = [definition.startScreenId];
    while (stack.length > 0) {
      const id = stack.pop();
      if (id === undefined || reachable.has(id)) continue;
      reachable.add(id);
      for (const next of adjacency.get(id) ?? []) stack.push(next);
    }
    for (const s of definition.screens) {
      if (!reachable.has(s.id)) {
        issues.push({
          code: 'unreachable_screen',
          severity: gateSeverity,
          message: `Screen "${s.id}" is not reachable from the start screen.`,
          screenId: s.id,
        });
      }
    }
  }

  for (const s of definition.screens) {
    if (TERMINAL_TYPES.has(s.type)) continue;
    const outgoing = outgoingBySource.get(s.id) ?? [];
    if ((adjacency.get(s.id) ?? []).length === 0) {
      issues.push({
        code: 'dead_end',
        severity: gateSeverity,
        message: `Screen "${s.id}" is not terminal and has no outgoing edge.`,
        screenId: s.id,
      });
    } else if (isPaymentScreen(s)) {
      if (!outgoing.some((e) => e.condition.kind === 'payment_succeeded')) {
        issues.push({
          code: 'dead_end',
          severity: gateSeverity,
          message: `Screen "${s.id}" is a ${s.type} screen with no "payment_succeeded" edge, so a visitor who pays cannot continue.`,
          screenId: s.id,
        });
      }
    } else if (!outgoing.some(isFallbackEdge) && !buttonLinked.has(s.id)) {
      issues.push({
        code: 'dead_end',
        severity: gateSeverity,
        message: `Screen "${s.id}" has only conditional edges and needs an "always" or "default" fallback edge.`,
        screenId: s.id,
      });
    }
  }

  if (hasStart) {
    const state = new Map<string, 1 | 2>();
    const cycleScreens = new Set<string>();
    const visit = (id: string): void => {
      state.set(id, 1);
      for (const next of adjacency.get(id) ?? []) {
        const st = state.get(next);
        if (st === 1) cycleScreens.add(next);
        else if (st === undefined) visit(next);
      }
      state.set(id, 2);
    };
    visit(definition.startScreenId);
    for (const id of cycleScreens) {
      issues.push({
        code: 'cycle',
        severity: allowCycles ? 'warning' : gateSeverity,
        message: `Screen "${id}" is part of a cycle.`,
        screenId: id,
      });
    }
  }

  for (const s of definition.screens) {
    for (const item of flattenContent(s.content.content)) {
      const schema = ELEMENT_PROP_SCHEMAS[item.type];
      if (!schema) continue;
      const parsed = schema.safeParse(item.props);
      if (parsed.success) continue;
      const detail = parsed.error.issues
        .map((i) => (i.path.length > 0 ? `${i.path.join('.')}: ${i.message}` : i.message))
        .join('; ');
      issues.push({
        code: 'element_props_invalid',
        severity: gateSeverity,
        message: `${item.type} on screen "${s.id}" has invalid settings: ${detail}`,
        screenId: s.id,
      });
    }
  }

  if (options.planKeys !== undefined) {
    const known = [...options.planKeys];
    const knownText = known.length > 0 ? known.join(', ') : 'none';
    for (const key of unknownPlanKeys(definition, known)) {
      issues.push({
        code: 'unknown_plan',
        severity: gateSeverity,
        message: `Plan "${key}" is not in the plan catalogue of this deployment. Known plans: ${knownText}.`,
      });
    }
  }

  const errors = issues.filter((i) => i.severity === 'error');
  const warnings = issues.filter((i) => i.severity === 'warning');
  return { ok: errors.length === 0, issues, errors, warnings };
}
