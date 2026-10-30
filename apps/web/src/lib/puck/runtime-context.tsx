'use client';

import { createContext, useContext } from 'react';
import type { Answers, Payments } from '@funnel/schema';
import type { BrowserAnalyticsEvent } from '@/lib/analytics/events';

export interface AnswerSummaryItem {
  screenId: string;
  title: string;
  values: string[];
}

export interface RuntimeApi {
  funnelId: string;
  slug: string | null;
  runId: string | null;
  returnScreenId: string | null;
  returnRef: string | null;
  clearReturn: () => void;
  screenId: string | null;
  answers: Answers;
  emails: Record<string, string>;
  payments: Payments;
  answerSummary: AnswerSummaryItem[];
  setAnswer: (screenId: string, value: string | string[]) => void;
  setEmail: (key: string, value: string) => void;
  confirmPayment: (screenId: string, options?: { advance?: boolean }) => void;
  next: (options?: { fallbackOnly?: boolean }) => void;
  track: (event: BrowserAnalyticsEvent) => void;
  analyticsConsent: () => boolean;
}

const defaultApi: RuntimeApi = {
  funnelId: '',
  slug: null,
  runId: null,
  returnScreenId: null,
  returnRef: null,
  clearReturn: () => undefined,
  screenId: null,
  answers: {},
  emails: {},
  payments: {},
  answerSummary: [],
  setAnswer: () => undefined,
  setEmail: () => undefined,
  confirmPayment: () => undefined,
  next: () => undefined,
  track: () => undefined,
  analyticsConsent: () => false,
};

export const RuntimeContext = createContext<RuntimeApi>(defaultApi);

export function useRuntime(): RuntimeApi {
  return useContext(RuntimeContext);
}
