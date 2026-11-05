'use client';

import { useEffect, useRef, useState } from 'react';
import type { FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import {
  BRIEF_TONES,
  MAX_BRIEF_QUESTIONS,
  MIN_BRIEF_QUESTIONS,
  outlineSchema,
} from '@funnel/schema';
import type { Brief, BriefPlan, Outline, OutlineKind, OutlineScreen } from '@funnel/schema';
import { z } from 'zod';
import { AI_ROUTES, readJson } from '@/lib/api-routes';
import type { FunnelGroup } from '@/server/funnel-repository';
import styles from '../StudioDashboard.module.css';
import wiz from './BriefWizard.module.css';
import { errorText } from './errors';

type Plan = BriefPlan;

const outlineResponse = z.object({ outline: outlineSchema });
const errorResponse = z.object({ error: z.string(), message: z.string().optional() });

const streamEvent = z.discriminatedUnion('type', [
  z.object({ type: z.literal('screen'), key: z.string(), ok: z.boolean() }),
  z.object({ type: z.literal('theme'), ok: z.boolean() }),
  z.object({
    type: z.literal('done'),
    funnelId: z.string(),
    warnings: z.number(),
    failedScreens: z.array(z.string()),
  }),
  z.object({ type: z.literal('error'), error: z.string(), message: z.string() }),
]);

const GOALS: [Brief['goal'], string][] = [
  ['lead', 'Leads'],
  ['subscription', 'Subscription'],
  ['one_time', 'One-time purchase'],
];

const TONE_LABELS: Record<(typeof BRIEF_TONES)[number], string> = {
  friendly: 'Friendly',
  expert: 'Expert',
  bold: 'Bold',
  calm: 'Calm',
};

const KIND_LABELS: Record<OutlineKind, string> = {
  intro: 'Intro',
  question: 'Question',
  info: 'Info',
  input: 'Input',
  loader: 'Loader',
  email: 'Email',
  paywall: 'Paywall',
  checkout: 'Checkout',
  finish: 'Finish',
};

const LOCKED_KINDS: ReadonlySet<OutlineKind> = new Set(['finish', 'checkout']);

const DROPPED_TEXT =
  'The connection dropped. Generation goes on, and the funnel appears in your list when it is ready.';

export function confirmStopGeneration(): boolean {
  return window.confirm('Stop generating this funnel? Screens written so far will be discarded.');
}

type Step = 'brief' | 'outline' | 'generating';
type ScreenStatus = 'pending' | 'done' | 'failed';

export function BriefWizard({
  groups,
  initialGroupId,
  onCancel,
  onRunChange,
  plans,
}: {
  groups: FunnelGroup[];
  initialGroupId: string | null;
  onCancel?: () => void;
  onRunChange?: (stop: (() => void) | null) => void;
  plans: Plan[];
}) {
  const router = useRouter();
  const [step, setStep] = useState<Step>('brief');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [brief, setBrief] = useState<Brief>({
    product: '',
    offer: '',
    audience: '',
    goal: 'lead',
    questions: 6,
    tone: 'friendly',
    language: 'English',
    brandColor: null,
    planKeys: [],
  });
  const [groupId, setGroupId] = useState<string>(
    initialGroupId && groups.some((g) => g.id === initialGroupId) ? initialGroupId : '',
  );
  const [outline, setOutline] = useState<Outline | null>(null);
  const [status, setStatus] = useState<Record<string, ScreenStatus>>({});
  const abortRef = useRef<AbortController | null>(null);
  const runIdRef = useRef<string | null>(null);

  useEffect(() => () => abortRef.current?.abort(), []);

  useEffect(() => {
    if (step !== 'generating') return;
    const warn = (event: BeforeUnloadEvent) => event.preventDefault();
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [step]);

  const stopRun = () => {
    const runId = runIdRef.current;
    runIdRef.current = null;
    onRunChange?.(null);
    if (runId) {
      void fetch(AI_ROUTES.briefCancel, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ runId }),
        keepalive: true,
      }).catch(() => {});
    }
    abortRef.current?.abort();
    setStep('outline');
  };

  const set = <K extends keyof Brief>(key: K, value: Brief[K]) =>
    setBrief((b) => ({ ...b, [key]: value }));

  const requestOutline = async (event?: FormEvent) => {
    event?.preventDefault();
    if (brief.product.trim().length < 3) {
      setError('Describe the product in a few words.');
      return;
    }
    setBusy(true);
    setError(null);
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    try {
      const res = await fetch(AI_ROUTES.briefOutline, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ brief, groupId: groupId || null }),
        signal: controller.signal,
      });
      const raw = await readJson(res);
      if (!res.ok) {
        const parsed = errorResponse.safeParse(raw);
        setError(
          parsed.success ? errorText(parsed.data.error, parsed.data.message) : `HTTP ${res.status}`,
        );
        return;
      }
      const parsed = outlineResponse.safeParse(raw);
      if (!parsed.success) {
        setError('The server returned an unexpected outline.');
        return;
      }
      setOutline(parsed.data.outline);
      setStep('outline');
    } catch (requestError) {
      if (controller.signal.aborted) return;
      setError(requestError instanceof Error ? requestError.message : 'Network error');
    } finally {
      setBusy(false);
    }
  };

  const updateScreen = (key: string, patch: (s: OutlineScreen) => OutlineScreen) =>
    setOutline((o) =>
      o ? { ...o, screens: o.screens.map((s) => (s.key === key ? patch(s) : s)) } : o,
    );

  const removeScreen = (key: string) =>
    setOutline((o) =>
      o
        ? {
            ...o,
            screens: o.screens
              .filter((s) => s.key !== key)
              .map((s) => (s.branchOf?.screenKey === key ? { ...s, branchOf: null } : s)),
          }
        : o,
    );

  const generate = async () => {
    if (!outline) return;
    setBusy(true);
    setError(null);
    setStatus(Object.fromEntries(outline.screens.map((s) => [s.key, 'pending' as const])));
    setStep('generating');
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    const runId = crypto.randomUUID();
    runIdRef.current = runId;
    onRunChange?.(stopRun);
    let streaming = false;
    try {
      const res = await fetch(AI_ROUTES.briefGenerate, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ brief, outline, groupId: groupId || null, runId }),
        signal: controller.signal,
      });
      if (!res.ok || !res.body) {
        const parsed = errorResponse.safeParse(await readJson(res));
        setError(
          parsed.success ? errorText(parsed.data.error, parsed.data.message) : `HTTP ${res.status}`,
        );
        setStep('outline');
        return;
      }
      streaming = true;
      const reader = res.body.pipeThrough(new TextDecoderStream()).getReader();
      let buffer = '';
      for (;;) {
        const { value, done } = await reader.read();
        if (done) break;
        buffer += value;
        let cut = buffer.indexOf('\n\n');
        while (cut !== -1) {
          const chunk = buffer.slice(0, cut);
          buffer = buffer.slice(cut + 2);
          cut = buffer.indexOf('\n\n');
          if (!chunk.startsWith('data: ')) continue;
          let json: unknown;
          try {
            json = JSON.parse(chunk.slice(6));
          } catch {
            continue;
          }
          const parsed = streamEvent.safeParse(json);
          if (!parsed.success) continue;
          const event = parsed.data;
          if (event.type === 'screen') {
            setStatus((s) => ({ ...s, [event.key]: event.ok ? 'done' : 'failed' }));
          } else if (event.type === 'done') {
            router.push(`/studio/funnels/${event.funnelId}`);
            return;
          } else if (event.type === 'error') {
            setError(errorText(event.error, event.message));
            setStep('outline');
            return;
          }
        }
      }
      setError(DROPPED_TEXT);
      setStep('outline');
    } catch (requestError) {
      if (controller.signal.aborted) return;
      if (streaming) setError(DROPPED_TEXT);
      else setError(requestError instanceof Error ? requestError.message : 'Network error');
      setStep('outline');
    } finally {
      setBusy(false);
      if (runIdRef.current === runId) {
        runIdRef.current = null;
        onRunChange?.(null);
      }
    }
  };

  if (step === 'generating' && outline) {
    const done = Object.values(status).filter((s) => s !== 'pending').length;
    return (
      <div className={wiz.wizard}>
        <p className={wiz.lead}>
          Writing screens: {done} of {outline.screens.length}
        </p>
        <div className={wiz.progress}>
          <span style={{ width: `${(done / Math.max(1, outline.screens.length)) * 100}%` }} />
        </div>
        <ol className={wiz.statusList}>
          {outline.screens.map((s) => (
            <li key={s.key} data-status={status[s.key] ?? 'pending'}>
              <span className={wiz.dot} aria-hidden />
              <span className={wiz.kind}>{KIND_LABELS[s.kind]}</span>
              {s.title}
            </li>
          ))}
        </ol>
        <div className={styles.formActions}>
          <button type="button" className={styles.outlineBtn} onClick={stopRun}>
            Stop
          </button>
        </div>
      </div>
    );
  }

  if (step === 'outline' && outline) {
    const titleOf = new Map(outline.screens.map((s) => [s.key, s]));
    return (
      <div className={wiz.wizard}>
        <label className={styles.formField}>
          <span>Funnel name</span>
          <input
            type="text"
            value={outline.name}
            maxLength={120}
            onChange={(e) => setOutline({ ...outline, name: e.target.value })}
          />
        </label>
        <p className={wiz.lead}>
          {outline.screens.length} screens. Edit titles, questions and answers, or remove screens,
          then generate.
        </p>
        <ol className={wiz.outline}>
          {outline.screens.map((s) => (
            <li key={s.key} className={s.branchOf ? wiz.branch : undefined}>
              <div className={wiz.row}>
                <span className={wiz.kind} data-kind={s.kind}>
                  {KIND_LABELS[s.kind]}
                </span>
                <input
                  type="text"
                  className={wiz.inline}
                  value={s.title}
                  maxLength={120}
                  aria-label="Screen title"
                  onChange={(e) => updateScreen(s.key, (x) => ({ ...x, title: e.target.value }))}
                />
                {LOCKED_KINDS.has(s.kind) ? null : (
                  <button
                    type="button"
                    className={wiz.remove}
                    aria-label={`Remove ${s.title}`}
                    onClick={() => removeScreen(s.key)}
                  >
                    ×
                  </button>
                )}
              </div>
              {s.branchOf ? (
                <p className={wiz.note}>
                  Shown after &ldquo;
                  {titleOf
                    .get(s.branchOf.screenKey)
                    ?.question?.options.find((o) => o.key === s.branchOf?.optionKey)?.label ??
                    s.branchOf.optionKey}
                  &rdquo;
                </p>
              ) : null}
              <p className={wiz.note}>{s.goal}</p>
              {s.question ? (
                <div className={wiz.question}>
                  <input
                    type="text"
                    className={wiz.inline}
                    value={s.question.text}
                    maxLength={200}
                    aria-label="Question"
                    onChange={(e) =>
                      updateScreen(s.key, (x) =>
                        x.question
                          ? { ...x, question: { ...x.question, text: e.target.value } }
                          : x,
                      )
                    }
                  />
                  <div className={wiz.options}>
                    {s.question.options.map((o) => (
                      <span key={o.key} className={wiz.option}>
                        {o.emoji ? <span aria-hidden>{o.emoji}</span> : null}
                        <input
                          type="text"
                          value={o.label}
                          maxLength={120}
                          aria-label="Answer"
                          onChange={(e) =>
                            updateScreen(s.key, (x) =>
                              x.question
                                ? {
                                    ...x,
                                    question: {
                                      ...x.question,
                                      options: x.question.options.map((y) =>
                                        y.key === o.key ? { ...y, label: e.target.value } : y,
                                      ),
                                    },
                                  }
                                : x,
                            )
                          }
                        />
                      </span>
                    ))}
                  </div>
                </div>
              ) : null}
            </li>
          ))}
        </ol>
        {error ? (
          <p role="alert" className={styles.formError}>
            {error}
          </p>
        ) : null}
        <div className={styles.formActions}>
          <button type="button" className={styles.outlineBtn} onClick={() => setStep('brief')}>
            Back
          </button>
          <button
            type="button"
            className={styles.outlineBtn}
            disabled={busy}
            onClick={() => void requestOutline()}
          >
            {busy ? 'Thinking...' : 'New outline'}
          </button>
          <button
            type="button"
            className={styles.createBtn}
            disabled={busy || outline.name.trim() === ''}
            onClick={() => void generate()}
          >
            Generate funnel
          </button>
        </div>
      </div>
    );
  }

  const paid = brief.goal !== 'lead';
  return (
    <form onSubmit={(e) => void requestOutline(e)} className={`${styles.form} ${wiz.wizard}`}>
      <label className={styles.formField}>
        <span>Product or offer</span>
        <textarea
          rows={3}
          value={brief.product}
          maxLength={600}
          autoFocus
          placeholder="A 28-day home workout plan for busy parents, no equipment"
          onChange={(e) => set('product', e.target.value)}
        />
      </label>
      <label className={styles.formField}>
        <span>Audience</span>
        <input
          type="text"
          value={brief.audience}
          maxLength={600}
          placeholder="Women 30-45, little free time, want to feel stronger"
          onChange={(e) => set('audience', e.target.value)}
        />
      </label>
      <label className={styles.formField}>
        <span>What makes it worth it</span>
        <input
          type="text"
          value={brief.offer}
          maxLength={600}
          placeholder="15 minutes a day, plan adapts to your level, first week free"
          onChange={(e) => set('offer', e.target.value)}
        />
      </label>
      <div className={styles.formField}>
        <span>Goal</span>
        <div className={wiz.segment} role="radiogroup" aria-label="Goal">
          {GOALS.map(([value, label]) => (
            <button
              key={value}
              type="button"
              role="radio"
              aria-checked={brief.goal === value}
              onClick={() => set('goal', value)}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
      {paid ? (
        <div className={styles.formField}>
          <span>Plans on the paywall</span>
          {plans.length === 0 ? (
            <p className={wiz.note}>
              No payment plans are configured, so the funnel will end without a paywall.
            </p>
          ) : (
            <div className={wiz.checks}>
              {plans.map((p) => (
                <label key={p.key} className={wiz.check}>
                  <input
                    type="checkbox"
                    checked={brief.planKeys.includes(p.key)}
                    onChange={(e) =>
                      set(
                        'planKeys',
                        e.target.checked
                          ? [...brief.planKeys, p.key].slice(0, 4)
                          : brief.planKeys.filter((k) => k !== p.key),
                      )
                    }
                  />
                  {p.title} <span className={wiz.note}>{p.displayPrice}</span>
                </label>
              ))}
              <p className={wiz.note}>None selected: all plans, up to four.</p>
            </div>
          )}
        </div>
      ) : null}
      <div className={wiz.grid}>
        <label className={styles.formField}>
          <span>Questions</span>
          <input
            type="number"
            min={MIN_BRIEF_QUESTIONS}
            max={MAX_BRIEF_QUESTIONS}
            value={brief.questions}
            onChange={(e) =>
              set(
                'questions',
                Math.min(
                  MAX_BRIEF_QUESTIONS,
                  Math.max(MIN_BRIEF_QUESTIONS, Math.round(Number(e.target.value) || 0)),
                ),
              )
            }
          />
        </label>
        <label className={styles.formField}>
          <span>Tone</span>
          <select value={brief.tone} onChange={(e) => set('tone', e.target.value as Brief['tone'])}>
            {BRIEF_TONES.map((t) => (
              <option key={t} value={t}>
                {TONE_LABELS[t]}
              </option>
            ))}
          </select>
        </label>
        <label className={styles.formField}>
          <span>Language</span>
          <input
            type="text"
            value={brief.language}
            maxLength={40}
            onChange={(e) => set('language', e.target.value)}
          />
        </label>
        <label className={styles.formField}>
          <span>Brand color</span>
          <span className={wiz.color}>
            <input
              type="color"
              value={brief.brandColor ?? '#4b7bf5'}
              aria-label="Brand color"
              onChange={(e) => set('brandColor', e.target.value)}
            />
            {brief.brandColor ? (
              <button type="button" className={wiz.clear} onClick={() => set('brandColor', null)}>
                Auto
              </button>
            ) : (
              <span className={wiz.note}>Auto</span>
            )}
          </span>
        </label>
      </div>
      {groups.length > 0 ? (
        <label className={styles.formField}>
          <span>Project</span>
          <select value={groupId} onChange={(e) => setGroupId(e.target.value)}>
            <option value="">No project</option>
            {groups.map((g) => (
              <option key={g.id} value={g.id}>
                {g.name}
              </option>
            ))}
          </select>
        </label>
      ) : null}
      {error ? (
        <p role="alert" className={styles.formError}>
          {error}
        </p>
      ) : null}
      <div className={styles.formActions}>
        {onCancel ? (
          <button type="button" className={styles.outlineBtn} onClick={onCancel}>
            Cancel
          </button>
        ) : null}
        <button type="submit" className={styles.createBtn} disabled={busy}>
          {busy ? 'Thinking...' : 'Draft the outline'}
        </button>
      </div>
    </form>
  );
}
