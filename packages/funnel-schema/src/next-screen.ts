import { isPaymentType, isSkipType } from './schema';
import type { Answers, Condition, FunnelDefinition, Payments } from './schema';

function own<T>(record: Record<string, T>, key: string): T | undefined {
  return Object.prototype.hasOwnProperty.call(record, key) ? record[key] : undefined;
}

function matches(
  condition: Condition,
  sourceScreenId: string,
  answers: Answers,
  payments: Payments,
): boolean {
  switch (condition.kind) {
    case 'always':
      return true;
    case 'default':
      return false;
    case 'payment_succeeded':
      return own(payments, sourceScreenId) === 'succeeded';
    case 'answer_equals': {
      const a = own(answers, condition.screenId);
      if (a === undefined) return false;
      if (typeof a === 'string') return a === condition.optionId;
      return a.length === 1 && a[0] === condition.optionId;
    }
    case 'answer_includes': {
      const a = own(answers, condition.screenId);
      if (a === undefined) return false;
      if (typeof a === 'string') return a === condition.optionId;
      return a.includes(condition.optionId);
    }
  }
}

export interface NextScreenOptions {
  fallbackOnly?: boolean;
}

export function nextScreen(
  definition: FunnelDefinition,
  currentScreenId: string,
  answers: Answers,
  payments: Payments = {},
  options: NextScreenOptions = {},
): string | null {
  const outgoing = definition.edges.filter((e) => e.sourceScreenId === currentScreenId);
  const source = definition.screens.find((s) => s.id === currentScreenId);
  const fallbackOnly =
    options.fallbackOnly === true && source !== undefined && isSkipType(source.type);
  const isPaymentScreen = source !== undefined && isPaymentType(source.type);
  if (isPaymentScreen && !fallbackOnly) {
    const paid = outgoing.find(
      (e) =>
        e.condition.kind === 'payment_succeeded' &&
        matches(e.condition, currentScreenId, answers, payments),
    );
    return paid ? paid.targetScreenId : null;
  }
  if (!fallbackOnly) {
    for (const e of outgoing) {
      if (matches(e.condition, currentScreenId, answers, payments)) return e.targetScreenId;
    }
  }
  const fallback = outgoing.find((e) => e.condition.kind === 'default');
  return fallback ? fallback.targetScreenId : null;
}
