'use client';

import { useEffect, useRef, useState } from 'react';
import type { FormEvent, KeyboardEvent } from 'react';
import type { FunnelDefinition, Screen, Theme } from '@funnel/schema';
import type { UiIssue } from '@/lib/use-draft-saver';
import { randomId } from '@/lib/ids';
import { ArrowUpIcon, CloseIcon, MagicIcon, PlusIcon, StopIcon } from '../EditorIcons';
import shell from '../EditorShell.module.css';
import styles from './AssistantPanel.module.css';

interface TypeMeta {
  label: string;
  color: string;
}

interface PlanStep {
  title: string;
  type: string;
  color: string;
}

type Card =
  | { kind: 'plan'; title: string; steps: PlanStep[] }
  | { kind: 'choice'; question: string; options: string[] }
  | {
      kind: 'theme';
      palettes: {
        name: string;
        theme: Pick<Theme, 'primaryColor' | 'backgroundColor' | 'textColor'>;
      }[];
    }
  | { kind: 'issues' }
  | { kind: 'proposal'; summary: string[] };

interface Message {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  context?: string;
  cards?: Card[];
}

interface AssistantPanelProps {
  definition: FunnelDefinition;
  selected: Screen | undefined;
  typeMeta: (screen: Screen) => TypeMeta;
  issues: UiIssue[];
  issueScreenId: (issue: UiIssue) => string | undefined;
  onSelectScreen: (id: string) => void;
  onClose: () => void;
  hidden?: boolean;
}

const SUGGESTIONS = [
  'Build a 6-question weight-loss quiz with a paywall',
  'Make this screen shorter',
  'Suggest a color theme for this funnel',
  'Check the funnel for problems',
];

const PALETTES = [
  {
    name: 'Calm',
    theme: { primaryColor: '#2f7d6d', backgroundColor: '#f4f1ea', textColor: '#1d2a27' },
  },
  {
    name: 'Energy',
    theme: { primaryColor: '#f0503a', backgroundColor: '#ffffff', textColor: '#1b1b1f' },
  },
  {
    name: 'Night',
    theme: { primaryColor: '#7fa2ff', backgroundColor: '#14141a', textColor: '#ececf1' },
  },
];

function demoReply(
  text: string,
  ctx: { selected?: Screen; color: (t: string) => string },
): Message {
  const t = text.toLowerCase();
  const base = { id: randomId(), role: 'assistant' as const };
  if (/theme|color|colour|palette|style/.test(t)) {
    return {
      ...base,
      text: 'Pick a palette and I would propose it as a theme change.',
      cards: [{ kind: 'theme', palettes: PALETTES }],
    };
  }
  if (/check|problem|issue|error|valid/.test(t)) {
    return {
      ...base,
      text: 'Here are the current validation results for the draft.',
      cards: [{ kind: 'issues' }],
    };
  }
  if (/quiz|build|create|generate|make a|funnel with/.test(t)) {
    return {
      ...base,
      text: 'For a new funnel I would first show the plan and ask a question before adding screens.',
      cards: [
        {
          kind: 'plan',
          title: 'Weight-loss quiz',
          steps: [
            { title: 'Welcome', type: 'Default', color: ctx.color('default') },
            { title: 'Goal', type: 'Question', color: ctx.color('default') },
            { title: 'Age', type: 'Question', color: ctx.color('default') },
            { title: 'Activity level', type: 'Question', color: ctx.color('default') },
            { title: 'Diet preferences', type: 'Multi-choice', color: ctx.color('default') },
            { title: 'Current weight', type: 'Question', color: ctx.color('default') },
            { title: 'Target weight', type: 'Question', color: ctx.color('default') },
            { title: 'Your email', type: 'Auth', color: ctx.color('auth') },
            { title: 'Your plan', type: 'Paywall', color: ctx.color('paywall') },
          ],
        },
        {
          kind: 'choice',
          question: 'Which tone should the questions use?',
          options: ['Friendly', 'Expert', 'Playful'],
        },
      ],
    };
  }
  const target = ctx.selected?.title ?? 'the selected screen';
  return {
    ...base,
    text: 'Edits come back as a proposal you can apply or discard.',
    cards: [
      {
        kind: 'proposal',
        summary: [
          `Shorter title on ${target}`,
          'Body text cut to two lines',
          'One button instead of two',
        ],
      },
    ],
  };
}

export function AssistantPanel({
  definition,
  selected,
  typeMeta,
  issues,
  issueScreenId,
  onSelectScreen,
  onClose,
  hidden,
}: AssistantPanelProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [draft, setDraft] = useState('');
  const [busy, setBusy] = useState(false);
  const [withContext, setWithContext] = useState(true);
  const [picked, setPicked] = useState<Record<string, string>>({});
  const timerRef = useRef<number | null>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const colorFor = (type: string) => typeMeta({ type } as Screen)?.color ?? 'var(--muted)';

  useEffect(() => {
    const el = listRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, busy]);

  useEffect(() => {
    const el = inputRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 160)}px`;
  }, [draft]);

  useEffect(
    () => () => {
      if (timerRef.current !== null) window.clearTimeout(timerRef.current);
    },
    [],
  );

  const send = (text: string) => {
    const value = text.trim();
    if (!value || busy) return;
    const context = withContext && selected ? selected.title : undefined;
    setMessages((m) => [...m, { id: randomId(), role: 'user', text: value, context }]);
    setDraft('');
    setBusy(true);
    timerRef.current = window.setTimeout(() => {
      timerRef.current = null;
      setMessages((m) => [
        ...m,
        demoReply(value, { selected: withContext ? selected : undefined, color: colorFor }),
      ]);
      setBusy(false);
    }, 900);
  };

  const stop = () => {
    if (timerRef.current !== null) window.clearTimeout(timerRef.current);
    timerRef.current = null;
    setBusy(false);
  };

  const reset = () => {
    stop();
    setMessages([]);
    setPicked({});
    inputRef.current?.focus();
  };

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    send(draft);
  };

  const onKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault();
      send(draft);
    }
  };

  const renderCard = (message: Message, card: Card, index: number) => {
    const key = `${message.id}-${index}`;
    switch (card.kind) {
      case 'plan':
        return (
          <div key={key} className={styles.card}>
            <div className={styles.cardHead}>
              <span className={styles.cardKicker}>Plan</span>
              <strong>{card.title}</strong>
              <span className={styles.cardMeta}>{card.steps.length} screens</span>
            </div>
            <ol className={styles.plan}>
              {card.steps.map((step, i) => (
                <li key={i} className={styles.planStep}>
                  <span className={styles.planDot} style={{ background: step.color }} />
                  <span className={styles.planTitle}>{step.title}</span>
                  <span className={styles.planType}>{step.type}</span>
                </li>
              ))}
            </ol>
            <div className={styles.cardActions}>
              <button
                type="button"
                className={shell.outlineBtn}
                disabled
                title="Available when the assistant is connected"
              >
                Edit plan
              </button>
              <button
                type="button"
                className={shell.primaryBtn}
                disabled
                title="Available when the assistant is connected"
              >
                Create screens
              </button>
            </div>
          </div>
        );
      case 'choice':
        return (
          <div key={key} className={styles.card}>
            <p className={styles.cardQuestion}>{card.question}</p>
            <div className={styles.choices}>
              {card.options.map((option) => (
                <button
                  key={option}
                  type="button"
                  className={styles.choice}
                  aria-pressed={picked[key] === option}
                  disabled={picked[key] !== undefined || busy}
                  onClick={() => {
                    setPicked((p) => ({ ...p, [key]: option }));
                    send(option);
                  }}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>
        );
      case 'theme':
        return (
          <div key={key} className={styles.card}>
            <div className={styles.swatches}>
              {card.palettes.map((p) => (
                <button
                  key={p.name}
                  type="button"
                  className={styles.swatch}
                  aria-pressed={picked[key] === p.name}
                  onClick={() => setPicked((s) => ({ ...s, [key]: p.name }))}
                >
                  <span
                    className={styles.swatchPreview}
                    style={{ background: p.theme.backgroundColor }}
                  >
                    <span className={styles.swatchLine} style={{ background: p.theme.textColor }} />
                    <span
                      className={styles.swatchLine}
                      data-short
                      style={{ background: p.theme.textColor }}
                    />
                    <span
                      className={styles.swatchButton}
                      style={{ background: p.theme.primaryColor }}
                    />
                  </span>
                  <span className={styles.swatchName}>{p.name}</span>
                </button>
              ))}
            </div>
          </div>
        );
      case 'issues': {
        if (issues.length === 0) {
          return (
            <div key={key} className={styles.card}>
              <p className={styles.okLine}>No problems found in the draft.</p>
            </div>
          );
        }
        return (
          <div key={key} className={styles.card}>
            <ul className={styles.issues}>
              {issues.slice(0, 8).map((issue, i) => {
                const screenId = issueScreenId(issue);
                return (
                  <li key={i}>
                    <button
                      type="button"
                      className={styles.issue}
                      data-severity={issue.severity}
                      disabled={!screenId}
                      onClick={() => screenId && onSelectScreen(screenId)}
                    >
                      <span className={styles.issueDot} />
                      <span>{issue.message}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
            {issues.length > 8 ? (
              <p className={styles.cardMeta}>+{issues.length - 8} more</p>
            ) : null}
          </div>
        );
      }
      case 'proposal':
        return (
          <div key={key} className={styles.card} data-kind="proposal">
            <div className={styles.cardHead}>
              <span className={styles.cardKicker}>Proposed changes</span>
            </div>
            <ul className={styles.diff}>
              {card.summary.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
            <div className={styles.cardActions}>
              <button
                type="button"
                className={shell.outlineBtn}
                disabled
                title="Available when the assistant is connected"
              >
                Discard
              </button>
              <button
                type="button"
                className={shell.primaryBtn}
                disabled
                title="Available when the assistant is connected"
              >
                Apply
              </button>
            </div>
          </div>
        );
    }
  };

  return (
    <div className={styles.panel} hidden={hidden}>
      <div className={styles.head}>
        <span className={styles.headIcon}>
          <MagicIcon size={15} />
        </span>
        <h2 className={shell.panelTitle}>Assistant</h2>
        <span className={styles.badge}>Preview</span>
        <span className={styles.headSpacer} />
        <button
          type="button"
          className={shell.iconBtn}
          aria-label="New chat"
          title="New chat"
          disabled={messages.length === 0 && !busy}
          onClick={reset}
        >
          <PlusIcon size={15} />
        </button>
        <button
          type="button"
          className={shell.iconBtn}
          aria-label="Close assistant"
          onClick={onClose}
        >
          <CloseIcon size={15} />
        </button>
      </div>

      <div ref={listRef} className={styles.list} aria-live="polite">
        {messages.length === 0 ? (
          <div className={styles.empty}>
            <span className={styles.emptyIcon}>
              <MagicIcon size={22} />
            </span>
            <p className={styles.emptyTitle}>What should we build?</p>
            <p className={styles.emptyText}>
              Describe a funnel or ask for a change. The assistant reads your draft (
              {definition.screens.length} screens) and proposes edits you approve before anything is
              saved.
            </p>
            <div className={styles.suggestions}>
              {SUGGESTIONS.map((s) => (
                <button key={s} type="button" className={styles.suggestion} onClick={() => send(s)}>
                  {s}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <>
            <p className={styles.notice}>
              The assistant is not connected yet. Replies are examples and nothing in your funnel
              changes.
            </p>
            {messages.map((message) =>
              message.role === 'user' ? (
                <div key={message.id} className={styles.userRow}>
                  {message.context ? (
                    <span className={styles.userContext}>@ {message.context}</span>
                  ) : null}
                  <p className={styles.userBubble}>{message.text}</p>
                </div>
              ) : (
                <div key={message.id} className={styles.assistantRow}>
                  <span className={styles.avatar}>
                    <MagicIcon size={13} />
                  </span>
                  <div className={styles.assistantBody}>
                    <p className={styles.assistantText}>{message.text}</p>
                    {message.cards?.map((card, i) => renderCard(message, card, i))}
                  </div>
                </div>
              ),
            )}
          </>
        )}
        {busy ? (
          <div className={styles.assistantRow}>
            <span className={styles.avatar}>
              <MagicIcon size={13} />
            </span>
            <span className={styles.typing} aria-label="Assistant is thinking">
              <i />
              <i />
              <i />
            </span>
          </div>
        ) : null}
      </div>

      <form className={styles.composer} onSubmit={onSubmit}>
        {selected ? (
          <div className={styles.contextRow}>
            <button
              type="button"
              className={styles.contextChip}
              aria-pressed={withContext}
              title={
                withContext
                  ? 'Remove the screen from context'
                  : 'Add the selected screen to context'
              }
              onClick={() => setWithContext((v) => !v)}
            >
              <span
                className={styles.contextDot}
                style={{ background: typeMeta(selected).color }}
              />
              {selected.title}
              {withContext ? <CloseIcon size={11} /> : <PlusIcon size={11} />}
            </button>
          </div>
        ) : null}
        <div className={styles.inputBox}>
          <textarea
            ref={inputRef}
            className={styles.textarea}
            rows={1}
            maxLength={4000}
            placeholder="Ask the assistant…"
            aria-label="Message the assistant"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={onKeyDown}
          />
          {busy ? (
            <button type="button" className={styles.sendBtn} aria-label="Stop" onClick={stop}>
              <StopIcon size={14} />
            </button>
          ) : (
            <button
              type="submit"
              className={styles.sendBtn}
              aria-label="Send"
              disabled={draft.trim() === ''}
            >
              <ArrowUpIcon size={15} />
            </button>
          )}
        </div>
        <p className={styles.footnote}>Enter to send, Shift+Enter for a new line</p>
      </form>
    </div>
  );
}
