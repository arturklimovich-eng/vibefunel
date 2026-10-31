import type { Answers, Payments } from '@funnel/schema';

export const MAX_RUN_HISTORY = 500;

export interface HistoryEntry {
  screenId: string;
  answers: Answers;
  emails: Record<string, string>;
  consents: Record<string, boolean>;
  payments: Payments;
}

export interface RunState {
  currentScreenId: string;
  history: HistoryEntry[];
  answers: Answers;
  emails: Record<string, string>;
  consents: Record<string, boolean>;
  payments: Payments;
}

function withoutScreen<T>(record: Record<string, T>, screenId: string): Record<string, T> {
  const prefix = `${screenId}:`;
  return Object.fromEntries(
    Object.entries(record).filter(([key]) => key !== screenId && !key.startsWith(prefix)),
  );
}

export function advance(state: RunState, targetId: string): RunState {
  return {
    currentScreenId: targetId,
    history: [
      ...state.history,
      {
        screenId: state.currentScreenId,
        answers: state.answers,
        emails: state.emails,
        consents: state.consents,
        payments: state.payments,
      },
    ].slice(-MAX_RUN_HISTORY),
    answers: withoutScreen(state.answers, targetId),
    emails: withoutScreen(state.emails, targetId),
    consents: withoutScreen(state.consents, targetId),
    payments: withoutScreen(state.payments, targetId),
  };
}

export function retreat(state: RunState): RunState {
  const previous = state.history[state.history.length - 1];
  if (!previous) return state;
  return {
    currentScreenId: previous.screenId,
    history: state.history.slice(0, -1),
    answers: previous.answers,
    emails: previous.emails,
    consents: previous.consents,
    payments: previous.payments,
  };
}
