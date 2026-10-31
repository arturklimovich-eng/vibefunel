'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { CSSProperties } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import type { TargetAndTransition } from 'motion/react';
import { Render } from '@puckeditor/core';
import { migrate, nextScreen } from '@funnel/schema';
import type { Answers, AnimationPreset, FunnelDefinition, Payments, Screen } from '@funnel/schema';
import type { AnalyticsScope } from '@/lib/analytics/events';
import { useFunnelAnalytics } from '@/lib/analytics/use-funnel-analytics';
import { emailBlocksOf, emailKey, isValidEmail } from '@/lib/email';
import { sendLead } from '@/lib/leads';
import { fetchPaymentStatus } from '@/lib/payment-status';
import { getScreenOptions, toPuckData } from '@/lib/puck/adapters';
import { puckConfig } from '@/lib/puck/config';
import { RuntimeContext } from '@/lib/puck/runtime-context';
import type { AnswerSummaryItem, RuntimeApi } from '@/lib/puck/runtime-context';
import { advance, retreat } from '@/lib/run-state';
import { adoptRunId, getOrCreateRunId, loadRun, saveRun } from '@/lib/run-storage';
import type { HistoryEntry, RunState } from '@/lib/run-state';
import { ConsentBanner } from './ConsentBanner';
import styles from './FunnelRuntime.module.css';

const PRESETS: Record<
  AnimationPreset,
  { initial: TargetAndTransition; animate: TargetAndTransition; exit: TargetAndTransition }
> = {
  none: { initial: {}, animate: {}, exit: {} },
  fade: { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 } },
  slide_up: {
    initial: { opacity: 0, y: 32 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -32 },
  },
  slide_left: {
    initial: { opacity: 0, x: 48 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -48 },
  },
};

const DEFAULT_DURATION_MS = 300;
const MAX_VERIFIED_PAYMENTS = 5;

export interface ReturnParams {
  runId: string;
  screenId: string;
  ref: string | null;
}

interface RuntimeProps {
  funnelId: string;
  projectId?: string | null;
  funnelVersion?: number | null;
  slug?: string;
  returning?: ReturnParams | null;
  definition: unknown;
  label?: string;
  embedded?: boolean;
  onInvalid?: () => void;
}

const PUBLIC_ERROR = 'This funnel cannot be displayed right now.';

function parseDefinition(
  input: unknown,
  detailed: boolean,
): { definition: FunnelDefinition } | { error: string } {
  try {
    const definition = migrate(input);
    if (!definition.screens.some((s) => s.id === definition.startScreenId)) {
      return { error: 'The funnel has no valid start screen.' };
    }
    return { definition };
  } catch (error) {
    const detail = error instanceof Error ? error.message : 'Invalid funnel definition.';
    if (detailed) return { error: detail };
    console.error('Invalid funnel definition:', detail);
    return { error: PUBLIC_ERROR };
  }
}

const DARK_FOREGROUND = '#111827';
const LIGHT_FOREGROUND = '#ffffff';
const NUMBER_PATTERN = /-?\d*\.?\d+%?/g;

function parseChannel(raw: string): number | null {
  const percent = raw.endsWith('%');
  const value = Number(percent ? raw.slice(0, -1) : raw);
  if (!Number.isFinite(value)) return null;
  const scaled = percent ? (value / 100) * 255 : value;
  return Math.min(255, Math.max(0, scaled));
}

function parseHex(hex: string): [number, number, number] | null {
  if (!/^[0-9a-f]+$/i.test(hex)) return null;
  let digits = hex;
  if (hex.length === 3 || hex.length === 4) {
    digits = hex
      .split('')
      .map((c) => c + c)
      .join('');
  }
  if (digits.length !== 6 && digits.length !== 8) return null;
  return [
    parseInt(digits.slice(0, 2), 16),
    parseInt(digits.slice(2, 4), 16),
    parseInt(digits.slice(4, 6), 16),
  ];
}

function linearize(channel: number): number {
  const s = channel / 255;
  return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
}

function foregroundForLuminance(luminance: number): string {
  return luminance > 0.179 ? DARK_FOREGROUND : LIGHT_FOREGROUND;
}

function contrastingForeground(color: string): string {
  const value = color.trim().toLowerCase();
  if (value.startsWith('#')) {
    const rgb = parseHex(value.slice(1));
    if (!rgb) return LIGHT_FOREGROUND;
    const luminance =
      0.2126 * linearize(rgb[0]) + 0.7152 * linearize(rgb[1]) + 0.0722 * linearize(rgb[2]);
    return foregroundForLuminance(luminance);
  }
  const call = /^(rgba?|hsla?)\((.*)\)$/.exec(value);
  const fn = call?.[1];
  const args = call?.[2];
  if (fn === undefined || args === undefined) return LIGHT_FOREGROUND;
  const numbers = args.match(NUMBER_PATTERN) ?? [];
  if (fn.startsWith('hsl')) {
    const raw = numbers[2];
    if (raw === undefined) return LIGHT_FOREGROUND;
    const lightness = Number(raw.endsWith('%') ? raw.slice(0, -1) : raw);
    if (!Number.isFinite(lightness)) return LIGHT_FOREGROUND;
    return lightness > 50 ? DARK_FOREGROUND : LIGHT_FOREGROUND;
  }
  const channels = numbers.slice(0, 3).map(parseChannel);
  const [r, g, b] = channels;
  if (r === undefined || g === undefined || b === undefined) return LIGHT_FOREGROUND;
  if (r === null || g === null || b === null) return LIGHT_FOREGROUND;
  return foregroundForLuminance(
    0.2126 * linearize(r) + 0.7152 * linearize(g) + 0.0722 * linearize(b),
  );
}

function loadUsableRun(funnelId: string, runId: string, screens: Screen[]): RunState | null {
  const saved = loadRun(funnelId, runId);
  if (saved === null) return null;
  const known = new Set(screens.map((s) => s.id));
  const usable =
    known.has(saved.currentScreenId) && saved.history.every((entry) => known.has(entry.screenId));
  return usable ? saved : null;
}

function longestPathFrom(definition: FunnelDefinition): Map<string, number> {
  const ids = definition.screens.map((s) => s.id);
  const known = new Set(ids);
  const adjacency = new Map<string, string[]>();
  for (const e of definition.edges) {
    if (!known.has(e.sourceScreenId) || !known.has(e.targetScreenId)) continue;
    const list = adjacency.get(e.sourceScreenId) ?? [];
    list.push(e.targetScreenId);
    adjacency.set(e.sourceScreenId, list);
  }

  const backEdges = new Set<string>();
  const state = new Map<string, 'open' | 'done'>();
  const classify = (id: string): void => {
    state.set(id, 'open');
    for (const target of adjacency.get(id) ?? []) {
      const seen = state.get(target);
      if (seen === 'open') backEdges.add(`${id}>${target}`);
      else if (seen === undefined) classify(target);
    }
    state.set(id, 'done');
  };
  const roots = [definition.startScreenId, ...ids];
  for (const id of roots) {
    if (known.has(id) && !state.has(id)) classify(id);
  }

  const memo = new Map<string, number>();
  const measure = (id: string): number => {
    const cached = memo.get(id);
    if (cached !== undefined) return cached;
    let best = 0;
    for (const target of adjacency.get(id) ?? []) {
      if (backEdges.has(`${id}>${target}`)) continue;
      best = Math.max(best, measure(target));
    }
    memo.set(id, best + 1);
    return best + 1;
  };
  for (const id of ids) measure(id);
  return memo;
}

interface EmailBlock {
  blockId: string;
  required: boolean;
}

function emailBlocks(screen: Screen): { valid: boolean; blocks: EmailBlock[] } {
  const blocks: EmailBlock[] = [];
  let valid = true;
  for (const block of emailBlocksOf(screen)) {
    if (block.props === null) valid = false;
    else blocks.push({ blockId: block.blockId, required: block.props.required });
  }
  return { valid, blocks };
}

export function FunnelRuntime({
  funnelId,
  projectId = null,
  funnelVersion = null,
  slug,
  returning = null,
  definition,
  label,
  embedded = false,
  onInvalid,
}: RuntimeProps) {
  const parsed = useMemo(() => parseDefinition(definition, Boolean(label)), [definition, label]);
  if ('error' in parsed) {
    return (
      <main className={embedded ? styles.pageEmbedded : styles.page}>
        <div className={styles.card} role="alert">
          <h1 className={styles.errorTitle}>This funnel cannot be displayed</h1>
          <p>{parsed.error}</p>
        </div>
      </main>
    );
  }
  return (
    <RuntimeInner
      funnelId={funnelId}
      projectId={projectId}
      funnelVersion={funnelVersion}
      slug={slug ?? null}
      returning={returning}
      definition={parsed.definition}
      label={label}
      embedded={embedded}
      onInvalid={onInvalid}
    />
  );
}

function RuntimeInner({
  funnelId,
  projectId,
  funnelVersion,
  slug,
  returning,
  definition,
  label,
  embedded,
  onInvalid,
}: {
  funnelId: string;
  projectId: string | null;
  funnelVersion: number | null;
  slug: string | null;
  returning: ReturnParams | null;
  definition: FunnelDefinition;
  label?: string;
  embedded: boolean;
  onInvalid?: () => void;
}) {
  const reduceMotion = useReducedMotion();
  const [currentScreenId, setCurrentScreenId] = useState(definition.startScreenId);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [answers, setAnswers] = useState<Answers>({});
  const [emails, setEmails] = useState<Record<string, string>>({});
  const [consents, setConsents] = useState<Record<string, boolean>>({});
  const [payments, setPayments] = useState<Payments>({});
  const [runId, setRunId] = useState<string | null>(null);
  const [returnScreenId, setReturnScreenId] = useState<string | null>(null);
  const [returnRef, setReturnRef] = useState<string | null>(null);
  const [restored, setRestored] = useState(slug === null);
  const [advanceFor, setAdvanceFor] = useState<string | null>(null);
  const completedRef = useRef(false);
  const currentScreenRef = useRef(currentScreenId);
  const cardRef = useRef<HTMLDivElement>(null);
  const focusedScreenRef = useRef<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [fatal, setFatal] = useState<string | null>(null);

  const screen = definition.screens.find((s) => s.id === currentScreenId);
  const pathLengths = useMemo(() => longestPathFrom(definition), [definition]);

  const analyticsScope = useMemo<AnalyticsScope>(
    () => ({ projectId, funnelId, funnelVersion, runId }),
    [projectId, funnelId, funnelVersion, runId],
  );
  const analytics = useFunnelAnalytics(analyticsScope, slug !== null);
  const { track } = analytics;
  const tracking = restored && (slug === null || runId !== null);

  useEffect(() => {
    if (!tracking) return;
    track({ name: 'funnel_view' });
  }, [tracking, track]);

  useEffect(() => {
    if (!tracking || !screen) return;
    track({ name: 'screen_view', screenId: screen.id, screenType: screen.type });
    if (screen.type === 'paywall') track({ name: 'paywall_view', screenId: screen.id });
    if (completedRef.current) return;
    const terminal =
      screen.type === 'success' || !definition.edges.some((e) => e.sourceScreenId === screen.id);
    if (terminal) {
      completedRef.current = true;
      track({ name: 'funnel_completed' });
    }
  }, [tracking, track, screen, definition.edges]);

  useEffect(() => {
    if (!screen && onInvalid) onInvalid();
  }, [screen, onInvalid]);

  useEffect(() => {
    currentScreenRef.current = currentScreenId;
    if (focusedScreenRef.current === null) {
      focusedScreenRef.current = currentScreenId;
      return;
    }
    if (focusedScreenRef.current === currentScreenId) return;
    focusedScreenRef.current = currentScreenId;
    cardRef.current?.focus({ preventScroll: true });
  }, [currentScreenId]);

  const setAnswer = useCallback(
    (screenId: string, value: string | string[]) => {
      if (screenId !== currentScreenRef.current) return;
      setAnswers((prev) => ({ ...prev, [screenId]: value }));
      setMessage(null);
      track({
        name: 'answer_selected',
        screenId,
        optionIds: typeof value === 'string' ? [value] : value,
      });
    },
    [track],
  );

  const setEmail = useCallback((key: string, value: string) => {
    setEmails((prev) => ({ ...prev, [key]: value }));
    setMessage(null);
  }, []);

  const setConsent = useCallback((key: string, value: boolean) => {
    setConsents((prev) => ({ ...prev, [key]: value }));
  }, []);

  const clearReturn = useCallback(() => {
    setReturnScreenId(null);
    setReturnRef(null);
  }, []);

  const confirmPayment = useCallback((screenId: string, options?: { advance?: boolean }) => {
    if (screenId !== currentScreenRef.current) return;
    setPayments((prev) => ({ ...prev, [screenId]: 'succeeded' }));
    setMessage(null);
    if (options?.advance) setAdvanceFor(screenId);
  }, []);

  const next = useCallback(
    (options?: { fallbackOnly?: boolean }) => {
      if (!screen || screen.id !== currentScreenRef.current) return;
      const hasOutgoing = definition.edges.some((e) => e.sourceScreenId === screen.id);
      if (!hasOutgoing) {
        setMessage('You have reached the end of this funnel.');
        return;
      }
      if (screen.type === 'quiz_single' || screen.type === 'quiz_multi') {
        const given = Object.prototype.hasOwnProperty.call(answers, screen.id)
          ? answers[screen.id]
          : undefined;
        const givenIds = given === undefined ? [] : typeof given === 'string' ? [given] : given;
        const known = new Set(getScreenOptions(screen).map((o) => o.id));
        if (!givenIds.some((id) => known.has(id))) {
          setMessage('Please choose an option to continue.');
          return;
        }
      }
      const email = emailBlocks(screen);
      if (!email.valid) {
        setMessage('This screen has an invalid email block and cannot continue.');
        return;
      }
      for (const block of email.blocks) {
        const typed = (emails[emailKey(screen.id, block.blockId)] ?? '').trim();
        if (typed.length === 0 && block.required) {
          setMessage('Please enter your email address to continue.');
          return;
        }
        if (typed.length > 0 && !isValidEmail(typed)) {
          setMessage('Please enter a valid email address to continue.');
          return;
        }
      }
      const targetId = nextScreen(definition, screen.id, answers, payments, options);
      if (targetId === null) {
        if (screen.type === 'checkout' || screen.type === 'upsell') {
          if (options?.fallbackOnly) {
            setMessage('This offer cannot be declined here.');
          } else if (payments[screen.id] !== 'succeeded') {
            setMessage('Complete your payment to continue.');
          } else {
            setMessage(
              'Payment received, but this screen has no path that continues after payment.',
            );
          }
          return;
        }
        setFatal(`Dead end: no path continues from screen "${screen.title || screen.id}".`);
        return;
      }
      if (!definition.screens.some((s) => s.id === targetId)) {
        setFatal(`The next screen "${targetId}" does not exist.`);
        return;
      }
      track({ name: 'step_completed', screenId: screen.id });
      if (slug !== null && runId !== null) {
        for (const block of email.blocks) {
          const key = emailKey(screen.id, block.blockId);
          const typed = (emails[key] ?? '').trim();
          if (typed.length === 0) continue;
          sendLead({
            slug,
            runId,
            screenId: screen.id,
            blockId: block.blockId,
            email: typed,
            consent: consents[key] === true,
          });
        }
      }
      setMessage(null);
      const advanced = advance(
        { currentScreenId: screen.id, history, answers, emails, consents, payments },
        targetId,
      );
      setHistory(advanced.history);
      setAnswers(advanced.answers);
      setEmails(advanced.emails);
      setConsents(advanced.consents);
      setPayments(advanced.payments);
      setCurrentScreenId(advanced.currentScreenId);
    },
    [answers, consents, definition, emails, history, payments, runId, slug, track, screen],
  );

  useEffect(() => {
    if (advanceFor === null || !screen || screen.id !== advanceFor) return;
    if (payments[advanceFor] !== 'succeeded') return;
    setAdvanceFor(null);
    next();
  }, [advanceFor, payments, screen, next]);

  useEffect(() => {
    if (returnScreenId !== null && currentScreenId !== returnScreenId) clearReturn();
  }, [returnScreenId, currentScreenId, clearReturn]);

  useEffect(() => {
    if (slug === null) return;
    const id = returning ? returning.runId : getOrCreateRunId(funnelId);
    if (returning) adoptRunId(funnelId, id);
    const saved = loadUsableRun(funnelId, id, definition.screens);
    if (saved) {
      setCurrentScreenId(saved.currentScreenId);
      setHistory(saved.history);
      setAnswers(saved.answers);
    }
    if (returning) {
      if (!saved) {
        const target = definition.screens.find((s) => s.id === returning.screenId);
        if (target && (target.type === 'checkout' || target.type === 'upsell')) {
          setCurrentScreenId(target.id);
        }
      }
      const honoured = !saved || saved.currentScreenId === returning.screenId;
      if (honoured) {
        setReturnScreenId(returning.screenId);
        setReturnRef(returning.ref);
      }
    }
    setRunId(id);
    setRestored(true);
    if (returning || !saved) return;
    const controller = new AbortController();
    const paidSteps = saved.history
      .map((entry, index) => ({ entry, index }))
      .filter(({ entry }) => {
        const step = definition.screens.find((s) => s.id === entry.screenId);
        return step !== undefined && (step.type === 'checkout' || step.type === 'upsell');
      })
      .slice(-MAX_VERIFIED_PAYMENTS);
    const verify = async () => {
      for (const { entry, index } of paidSteps) {
        const result = await fetchPaymentStatus(id, entry.screenId, controller.signal, null);
        if (controller.signal.aborted) return;
        if (
          result.kind === 'status' &&
          (result.status === 'refunded' || result.status === 'disputed')
        ) {
          setHistory(saved.history.slice(0, index));
          setAnswers(entry.answers);
          setEmails(entry.emails);
          setConsents(entry.consents);
          setPayments({});
          setCurrentScreenId(entry.screenId);
          return;
        }
      }
    };
    verify().catch((error: unknown) => {
      if (controller.signal.aborted) return;
      console.warn('Payment re-check failed:', error instanceof Error ? error.message : error);
    });
    return () => controller.abort();
  }, [slug, returning, funnelId, definition.screens]);

  useEffect(() => {
    if (slug === null || runId === null || !restored) return;
    saveRun(funnelId, runId, { currentScreenId, history, answers, emails, consents, payments });
  }, [
    slug,
    runId,
    restored,
    funnelId,
    currentScreenId,
    history,
    answers,
    emails,
    consents,
    payments,
  ]);

  const back = useCallback(() => {
    if (history.length === 0) return;
    const retreated = retreat({ currentScreenId, history, answers, emails, consents, payments });
    setAnswers(retreated.answers);
    setEmails(retreated.emails);
    setConsents(retreated.consents);
    setPayments(retreated.payments);
    setHistory(retreated.history);
    setCurrentScreenId(retreated.currentScreenId);
    setMessage(null);
    setFatal(null);
  }, [answers, consents, currentScreenId, emails, history, payments]);

  const answerSummary = useMemo<AnswerSummaryItem[]>(() => {
    const items: AnswerSummaryItem[] = [];
    const seen = new Set<string>();
    for (const id of [...history.map((h) => h.screenId), currentScreenId]) {
      if (seen.has(id)) continue;
      seen.add(id);
      const visited = definition.screens.find((s) => s.id === id);
      const given = Object.prototype.hasOwnProperty.call(answers, id) ? answers[id] : undefined;
      if (!visited || given === undefined || (!Array.isArray(given) && typeof given !== 'string'))
        continue;
      const ids = typeof given === 'string' ? [given] : given;
      if (ids.length === 0) continue;
      const options = getScreenOptions(visited);
      items.push({
        screenId: id,
        title: visited.title,
        values: ids.map((optionId) => options.find((o) => o.id === optionId)?.label ?? optionId),
      });
    }
    return items;
  }, [answers, currentScreenId, definition.screens, history]);

  const api = useMemo<RuntimeApi>(
    () => ({
      funnelId,
      slug,
      runId,
      returnScreenId,
      returnRef,
      clearReturn,
      screenId: currentScreenId,
      answers,
      emails,
      consents,
      payments,
      answerSummary,
      setAnswer,
      setEmail,
      setConsent,
      confirmPayment,
      next,
      track,
      analyticsConsent: analytics.hasConsent,
    }),
    [
      funnelId,
      slug,
      runId,
      returnScreenId,
      returnRef,
      clearReturn,
      currentScreenId,
      answers,
      emails,
      consents,
      payments,
      answerSummary,
      setAnswer,
      setEmail,
      setConsent,
      confirmPayment,
      next,
      track,
      analytics.hasConsent,
    ],
  );

  const screenContent = screen?.content;
  const puckData = useMemo(
    () => (screenContent === undefined ? null : toPuckData(screenContent)),
    [screenContent],
  );

  const pageClass = embedded ? styles.pageEmbedded : styles.page;

  if (!restored) {
    return (
      <main className={pageClass}>
        {returning !== null ? (
          <div className={styles.card} role="status">
            <p>Restoring your progress...</p>
          </div>
        ) : (
          <div className={styles.card} aria-busy="true" />
        )}
      </main>
    );
  }

  if (fatal !== null || !screen || puckData === null) {
    return (
      <main className={pageClass}>
        <div className={styles.card} role="alert">
          <h1 className={styles.errorTitle}>Something went wrong</h1>
          <p>{fatal ?? `Screen "${currentScreenId}" was not found.`}</p>
          {history.length > 0 ? (
            <button type="button" className={styles.backButton} onClick={back}>
              Back
            </button>
          ) : null}
        </div>
      </main>
    );
  }

  const preset = PRESETS[screen.animation.preset];
  const duration = (screen.animation.durationMs ?? DEFAULT_DURATION_MS) / 1000;
  const animated = !reduceMotion && screen.animation.preset !== 'none' && duration > 0;
  const animation = animated ? preset : PRESETS.none;
  const stepNumber = history.length + 1;
  const stepTotal = Math.max(stepNumber, history.length + (pathLengths.get(screen.id) ?? 1));
  const themeStyle: CSSProperties & Record<'--funnel-primary' | '--funnel-on-primary', string> = {
    '--funnel-primary': definition.theme.primaryColor,
    '--funnel-on-primary': contrastingForeground(definition.theme.primaryColor),
    background: definition.theme.backgroundColor,
    color: definition.theme.textColor,
    fontSize: `${definition.theme.fontScale ?? 1}rem`,
  };

  const content = (
    <RuntimeContext.Provider value={api}>
      <Render config={puckConfig} data={puckData} />
      <p className={styles.message} role="status" aria-live="polite">
        {message}
      </p>
    </RuntimeContext.Provider>
  );

  return (
    <main className={pageClass} style={themeStyle}>
      {label ? <div className={styles.badge}>{label}</div> : null}
      <div className={styles.card} ref={cardRef} tabIndex={-1}>
        <p className={styles.srOnly} aria-live="polite">
          Step {stepNumber} of up to {stepTotal}: {screen.title}
        </p>
        <div className={styles.topBar}>
          <button
            type="button"
            className={styles.backButton}
            onClick={back}
            disabled={history.length === 0}
          >
            Back
          </button>
          <span className={styles.stepText}>
            Step {stepNumber} of up to {stepTotal}
          </span>
        </div>
        <progress
          className={styles.progress}
          value={stepNumber}
          max={stepTotal}
          aria-label={`Step ${stepNumber} of up to ${stepTotal}`}
        />
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={screen.id}
            initial={animation.initial}
            animate={preset.animate}
            exit={animation.exit}
            transition={{ duration: animated ? duration : 0, ease: 'easeOut' }}
          >
            {content}
          </motion.div>
        </AnimatePresence>
      </div>
      {analytics.showBanner ? <ConsentBanner onDecide={analytics.decide} /> : null}
    </main>
  );
}
