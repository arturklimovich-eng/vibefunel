'use client';

import { useEffect, useRef, useState } from 'react';
import { screenTextFields } from '@funnel/schema';
import type { Screen, TextEdit, TextField } from '@funnel/schema';
import { z } from 'zod';
import { AI_ROUTES, readJson } from '@/lib/api-routes';
import shell from '../EditorShell.module.css';
import { MagicIcon } from '../EditorIcons';
import { errorText } from './errors';
import css from './InlineAi.module.css';

type Action = 'rewrite' | 'shorten' | 'persuasive' | 'fix' | 'translate' | 'variants';

const ACTIONS: [Action, string][] = [
  ['rewrite', 'Rewrite'],
  ['shorten', 'Shorten'],
  ['persuasive', 'More persuasive'],
  ['fix', 'Fix errors'],
  ['variants', '3 variants'],
];

const LANGUAGES = [
  'English',
  'Spanish',
  'German',
  'French',
  'Italian',
  'Portuguese',
  'Polish',
  'Ukrainian',
  'Russian',
  'Turkish',
  'Japanese',
];

const MAX_FIELDS_PER_CALL = 120;

const responseSchema = z.object({
  variants: z.array(
    z.object({ fields: z.array(z.object({ key: z.string(), value: z.string() })) }),
  ),
});
const errorSchema = z.object({ error: z.string(), message: z.string().optional() });

type Outcome = { ok: true; variants: TextEdit[][] } | { ok: false; code: string; message: string };

const STOP_CODES = new Set([
  'budget_exhausted',
  'rate_limited',
  'quota_exhausted',
  'ai_not_configured',
]);

async function requestEdits(
  funnelId: string,
  scope: 'element' | 'screen',
  action: Action,
  fields: TextField[],
  context: string[],
  screenTitle: string,
  targetLang: string | null,
  signal: AbortSignal,
): Promise<Outcome> {
  const byKey = new Map(fields.map((f) => [f.key, f]));
  const res = await fetch(AI_ROUTES.inline, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      funnelId,
      scope,
      action,
      targetLang,
      screenTitle,
      fields: fields.map((f) => ({ key: f.key, element: f.elementType, value: f.value })),
      context,
    }),
    signal,
  });
  const raw = await readJson(res);
  if (!res.ok) {
    const parsed = errorSchema.safeParse(raw);
    const code = parsed.success ? parsed.data.error : `http_${res.status}`;
    return {
      ok: false,
      code,
      message: errorText(code, parsed.success ? parsed.data.message : undefined),
    };
  }
  const parsed = responseSchema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false, code: 'invalid_output', message: errorText('invalid_output') };
  }
  return {
    ok: true,
    variants: parsed.data.variants.map((v) =>
      v.fields.flatMap((f) => {
        const field = byKey.get(f.key);
        return field
          ? [
              {
                screenId: field.screenId,
                elementId: field.elementId,
                path: field.path,
                value: f.value,
              },
            ]
          : [];
      }),
    ),
  };
}

function chunk<T>(items: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < items.length; i += size) out.push(items.slice(i, i + size));
  return out;
}

interface Proposal {
  variants: TextEdit[][];
  note: string | null;
}

export function InlineAi({
  funnelId,
  scope,
  fields,
  context,
  screenTitle,
  screens,
  onApply,
}: {
  funnelId: string;
  scope: 'element' | 'screen';
  fields: TextField[];
  context: string[];
  screenTitle: string;
  screens?: Screen[];
  onApply: (edits: TextEdit[]) => void;
}) {
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [lang, setLang] = useState('');
  const [proposal, setProposal] = useState<Proposal | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const before = new Map(fields.map((f) => [f.key, f.value]));

  useEffect(() => () => abortRef.current?.abort(), []);

  const begin = () => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    setError(null);
    setProposal(null);
    return controller;
  };

  const run = async (action: Action) => {
    if (fields.length === 0) return;
    if (action === 'translate' && lang.trim().length < 2) {
      setError('Pick a language first.');
      return;
    }
    const controller = begin();
    setBusy(action === 'translate' ? `Translating into ${lang.trim()}...` : 'Writing...');
    try {
      const outcome = await requestEdits(
        funnelId,
        scope,
        action,
        fields.slice(0, MAX_FIELDS_PER_CALL),
        context,
        screenTitle,
        action === 'translate' ? lang.trim() : null,
        controller.signal,
      );
      if (!outcome.ok) setError(outcome.message);
      else if (outcome.variants.every((v) => v.length === 0)) setError('Nothing to change here.');
      else setProposal({ variants: outcome.variants.filter((v) => v.length > 0), note: null });
    } catch (requestError) {
      if (!controller.signal.aborted) {
        setError(requestError instanceof Error ? requestError.message : 'Network error');
      }
    } finally {
      if (abortRef.current === controller) setBusy(null);
    }
  };

  const translateFunnel = async () => {
    if (!screens || lang.trim().length < 2) {
      setError('Pick a language first.');
      return;
    }
    const target = lang.trim();
    const jobs = chunk(screens.flatMap(screenTextFields), MAX_FIELDS_PER_CALL);
    if (jobs.length === 0) return;
    const controller = begin();
    const edits: TextEdit[] = [];
    let failed = 0;
    let stopped: string | null = null;
    try {
      for (const [index, job] of jobs.entries()) {
        if (controller.signal.aborted) return;
        setBusy(`Translating part ${index + 1} of ${jobs.length}...`);
        const outcome = await requestEdits(
          funnelId,
          'screen',
          'translate',
          job,
          [],
          '',
          target,
          controller.signal,
        );
        if (outcome.ok) {
          edits.push(...(outcome.variants[0] ?? []));
        } else if (STOP_CODES.has(outcome.code)) {
          stopped = outcome.message;
          break;
        } else {
          failed++;
        }
      }
      if (edits.length === 0) {
        setError(stopped ?? 'Nothing was translated.');
        return;
      }
      const notes = [
        failed > 0
          ? `${failed} part${failed === 1 ? '' : 's'} failed; those texts stay as they are.`
          : null,
        stopped ? `Stopped early: ${stopped}` : null,
      ].filter(Boolean);
      setProposal({ variants: [edits], note: notes.length > 0 ? notes.join(' ') : null });
    } catch (requestError) {
      if (!controller.signal.aborted) {
        setError(requestError instanceof Error ? requestError.message : 'Network error');
      }
    } finally {
      if (abortRef.current === controller) setBusy(null);
    }
  };

  const keyOf = (e: TextEdit) => `${e.screenId}|${e.elementId}|${e.path.join('.')}`;
  const funnelWide = (variant: TextEdit[]) => variant.some((e) => !before.has(keyOf(e)));

  return (
    <div className={shell.paramGroup}>
      <div className={css.head}>
        <MagicIcon size={13} />
        <span>{scope === 'element' ? 'AI copy' : 'AI copy for this screen'}</span>
      </div>
      {fields.length === 0 && !screens ? (
        <p className={shell.muted}>No text to edit here.</p>
      ) : (
        <>
          <div className={css.actions}>
            {ACTIONS.map(([action, label]) => (
              <button
                key={action}
                type="button"
                className={css.chip}
                disabled={busy !== null || fields.length === 0}
                onClick={() => void run(action)}
              >
                {label}
              </button>
            ))}
          </div>
          <div className={css.translate}>
            <input
              className={shell.input}
              list="inline-ai-languages"
              placeholder="Language"
              maxLength={40}
              value={lang}
              aria-label="Translate into"
              onChange={(e) => setLang(e.target.value)}
            />
            <datalist id="inline-ai-languages">
              {LANGUAGES.map((l) => (
                <option key={l} value={l} />
              ))}
            </datalist>
            <button
              type="button"
              className={css.chip}
              disabled={busy !== null || fields.length === 0}
              onClick={() => void run('translate')}
            >
              Translate
            </button>
            {screens ? (
              <button
                type="button"
                className={css.chip}
                disabled={busy !== null}
                title="Translate every screen of the funnel"
                onClick={() => void translateFunnel()}
              >
                Whole funnel
              </button>
            ) : null}
          </div>
        </>
      )}
      {busy ? (
        <div className={css.busy}>
          <span>{busy}</span>
          <button
            type="button"
            className={css.link}
            onClick={() => {
              abortRef.current?.abort();
              setBusy(null);
            }}
          >
            Cancel
          </button>
        </div>
      ) : null}
      {error ? (
        <p className={css.error} role="alert">
          {error}
        </p>
      ) : null}
      {proposal ? (
        <div className={css.proposal}>
          {proposal.note ? <p className={shell.muted}>{proposal.note}</p> : null}
          {proposal.variants.map((variant, index) => (
            <div key={index} className={css.variant}>
              {proposal.variants.length > 1 ? (
                <span className={css.variantTitle}>Variant {index + 1}</span>
              ) : null}
              {funnelWide(variant) ? (
                <p className={shell.muted}>
                  {variant.length} text{variant.length === 1 ? '' : 's'} across{' '}
                  {new Set(variant.map((e) => e.screenId)).size} screens.
                </p>
              ) : (
                <ul className={css.diff}>
                  {variant.map((edit) => (
                    <li key={keyOf(edit)}>
                      <span className={css.before}>{before.get(keyOf(edit))}</span>
                      <span className={css.after}>{edit.value}</span>
                    </li>
                  ))}
                </ul>
              )}
              <div className={css.variantActions}>
                <button
                  type="button"
                  className={css.apply}
                  onClick={() => {
                    onApply(variant);
                    setProposal(null);
                  }}
                >
                  Apply
                </button>
                {index === proposal.variants.length - 1 ? (
                  <button type="button" className={css.link} onClick={() => setProposal(null)}>
                    Discard
                  </button>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}
