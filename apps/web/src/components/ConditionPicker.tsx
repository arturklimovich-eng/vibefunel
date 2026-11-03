'use client';

import { isQuizScreen, quizOf } from '@funnel/schema';
import type { Condition, Screen } from '@funnel/schema';
import { getScreenOptions } from '@/lib/puck/adapters';
import styles from './FunnelEditor.module.css';

export type ConnectionChoice =
  | { kind: 'always' }
  | { kind: 'default' }
  | { kind: 'payment' }
  | { kind: 'option'; optionId: string };

const OPTION_PREFIX = 'option:';

export function isPaymentScreen(source: Screen): boolean {
  return source.type === 'checkout' || source.type === 'upsell';
}

function encodeChoice(choice: ConnectionChoice): string {
  return choice.kind === 'option' ? `${OPTION_PREFIX}${choice.optionId}` : choice.kind;
}

function decodeChoice(value: string): ConnectionChoice {
  if (value.startsWith(OPTION_PREFIX)) {
    return { kind: 'option', optionId: value.slice(OPTION_PREFIX.length) };
  }
  if (value === 'default') return { kind: 'default' };
  if (value === 'payment') return { kind: 'payment' };
  return { kind: 'always' };
}

export function normalizeChoice(source: Screen, choice: ConnectionChoice): ConnectionChoice {
  if (isPaymentScreen(source)) {
    return choice.kind === 'default' ? { kind: 'default' } : { kind: 'payment' };
  }
  if (choice.kind === 'payment') return { kind: 'always' };
  if (choice.kind === 'option') {
    const known =
      isQuizScreen(source) && getScreenOptions(source).some((o) => o.id === choice.optionId);
    return known ? choice : { kind: 'always' };
  }
  return choice;
}

export function choiceToCondition(source: Screen, requested: ConnectionChoice): Condition {
  const choice = normalizeChoice(source, requested);
  if (choice.kind === 'payment') return { kind: 'payment_succeeded', screenId: source.id };
  if (choice.kind === 'always') return { kind: 'always' };
  if (choice.kind === 'default') return { kind: 'default' };
  return quizOf(source)?.mode === 'multi'
    ? { kind: 'answer_includes', screenId: source.id, optionId: choice.optionId }
    : { kind: 'answer_equals', screenId: source.id, optionId: choice.optionId };
}

export function ConditionPicker({
  source,
  value,
  onChange,
}: {
  source: Screen;
  value: ConnectionChoice;
  onChange: (choice: ConnectionChoice) => void;
}) {
  const current = normalizeChoice(source, value);
  if (isPaymentScreen(source)) {
    return (
      <label className={styles.field}>
        Condition
        <select
          value={current.kind === 'default' ? 'default' : 'payment'}
          onChange={(e) => onChange(decodeChoice(e.target.value))}
        >
          <option value="payment">payment succeeded (server confirmed)</option>
          <option value="default">decline (default)</option>
        </select>
      </label>
    );
  }
  const options = isQuizScreen(source) ? getScreenOptions(source) : [];
  return (
    <label className={styles.field}>
      Condition
      <select
        value={encodeChoice(current)}
        onChange={(e) => onChange(decodeChoice(e.target.value))}
      >
        <option value="always">always</option>
        <option value="default">default (fallback)</option>
        {options.map((o) => (
          <option key={o.id} value={`${OPTION_PREFIX}${o.id}`}>
            answer: {o.label} ({o.id})
          </option>
        ))}
      </select>
    </label>
  );
}
