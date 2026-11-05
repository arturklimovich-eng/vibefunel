'use client';

import { useEffect, useRef, useState } from 'react';
import type { FormEvent, KeyboardEvent } from 'react';
import { assistantCardSchema } from '@funnel/schema';
import type { AssistantCard, FunnelDefinition, FunnelPatch, Screen } from '@funnel/schema';
import { z } from 'zod';
import { AI_ROUTES, readJson } from '@/lib/api-routes';
import { randomId } from '@/lib/ids';
import type { UiIssue } from '@/lib/use-draft-saver';
import { errorText } from '../ai/errors';
import { ArrowUpIcon, CloseIcon, MagicIcon, PlusIcon, StopIcon } from '../EditorIcons';
import shell from '../EditorShell.module.css';
import { AssistantCardView, ProposalCard } from './cards';
import type { ProposalView } from './cards';
import styles from './AssistantPanel.module.css';

interface TypeMeta {
  label: string;
  color: string;
}

interface Proposal extends ProposalView {
  patch: FunnelPatch;
}

interface Message {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  context?: string;
  cards?: AssistantCard[];
  proposal?: Proposal;
  failed?: boolean;
}

interface AssistantPanelProps {
  funnelId: string;
  enabled: boolean;
  definition: FunnelDefinition;
  selected: Screen | undefined;
  selectedElementId: string | null;
  typeMeta: (screen: Screen) => TypeMeta;
  issues: UiIssue[];
  issueScreenId: (issue: UiIssue) => string | undefined;
  onSelectScreen: (id: string) => void;
  onApply: (patch: FunnelPatch) => void;
  onClose: () => void;
  hidden?: boolean;
}

const SUGGESTIONS = [
  'Build a 6-question weight-loss quiz with a paywall',
  'Make this screen shorter',
  'Suggest a color theme for this funnel',
  'Check the funnel for problems',
];

const MAX_HISTORY = 12;

const responseSchema = z.object({
  reply: z.string(),
  cards: z.array(z.unknown()),
  proposal: z
    .object({
      patch: z.array(z.unknown()),
      summary: z.array(z.string()),
      warnings: z.array(z.string()),
      errors: z.array(z.string()),
    })
    .nullable(),
});
const errorSchema = z.object({ error: z.string(), message: z.string().optional() });

function historyText(message: Message): string {
  const parts = [message.text];
  if (message.proposal) {
    parts.push(`[proposal ${message.proposal.state}: ${message.proposal.summary.join(', ')}]`);
  }
  return parts.join(' ').slice(0, 4000);
}

export function AssistantPanel({
  funnelId,
  enabled,
  definition,
  selected,
  selectedElementId,
  typeMeta,
  issues,
  issueScreenId,
  onSelectScreen,
  onApply,
  onClose,
  hidden,
}: AssistantPanelProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [draft, setDraft] = useState('');
  const [busy, setBusy] = useState(false);
  const [withContext, setWithContext] = useState(true);
  const [picked, setPicked] = useState<Record<string, string>>({});
  const abortRef = useRef<AbortController | null>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const colorFor = (type: Screen['type']) => typeMeta({ type } as Screen)?.color ?? 'var(--muted)';

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

  useEffect(() => () => abortRef.current?.abort(), []);

  const updateProposal = (id: string, state: ProposalView['state']) =>
    setMessages((list) =>
      list.map((m) =>
        m.id === id && m.proposal ? { ...m, proposal: { ...m.proposal, state } } : m,
      ),
    );

  const send = async (text: string) => {
    const value = text.trim();
    if (!value || busy || !enabled) return;
    const target = withContext ? selected : undefined;
    const history = messages
      .filter((m) => !m.failed)
      .slice(-MAX_HISTORY)
      .map((m) => ({ role: m.role, text: historyText(m) }));
    setMessages((m) => [
      ...m,
      { id: randomId(), role: 'user', text: value, context: target?.title },
    ]);
    setDraft('');
    setBusy(true);
    const controller = new AbortController();
    abortRef.current = controller;
    const fail = (message: string) =>
      setMessages((m) => [
        ...m,
        { id: randomId(), role: 'assistant', text: message, failed: true },
      ]);
    try {
      const res = await fetch(AI_ROUTES.chat, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          funnelId,
          definition,
          selection: {
            screenId: target?.id ?? null,
            elementId: target ? selectedElementId : null,
          },
          history,
          message: value,
        }),
        signal: controller.signal,
      });
      const raw = await readJson(res);
      if (!res.ok) {
        const parsed = errorSchema.safeParse(raw);
        fail(
          parsed.success
            ? errorText(parsed.data.error, parsed.data.message)
            : `Request failed (HTTP ${res.status}).`,
        );
        return;
      }
      const parsed = responseSchema.safeParse(raw);
      if (!parsed.success) {
        fail('The assistant returned an unexpected answer.');
        return;
      }
      const cards = parsed.data.cards.flatMap((c) => {
        const card = assistantCardSchema.safeParse(c);
        return card.success ? [card.data] : [];
      });
      const proposal = parsed.data.proposal;
      setMessages((m) => [
        ...m,
        {
          id: randomId(),
          role: 'assistant',
          text: parsed.data.reply,
          cards,
          ...(proposal && proposal.patch.length > 0
            ? {
                proposal: {
                  patch: proposal.patch as FunnelPatch,
                  summary: proposal.summary,
                  warnings: proposal.warnings,
                  errors: proposal.errors,
                  state: 'open' as const,
                },
              }
            : {}),
        },
      ]);
    } catch (error) {
      if (!controller.signal.aborted) {
        fail(error instanceof Error ? error.message : 'Network error.');
      }
    } finally {
      if (abortRef.current === controller) {
        abortRef.current = null;
        setBusy(false);
      }
    }
  };

  const stop = () => {
    abortRef.current?.abort();
    abortRef.current = null;
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
    void send(draft);
  };

  const onKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault();
      void send(draft);
    }
  };

  return (
    <div className={styles.panel} hidden={hidden}>
      <div className={styles.head}>
        <span className={styles.headIcon}>
          <MagicIcon size={15} />
        </span>
        <h2 className={shell.panelTitle}>Assistant</h2>
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
        {!enabled ? (
          <p className={styles.notice}>
            The assistant is not configured on this server (set AI_TEXT_MODEL or
            AI_TEXT_MODEL_CHAT).
          </p>
        ) : null}
        {messages.length === 0 ? (
          <div className={styles.empty}>
            <span className={styles.emptyIcon}>
              <MagicIcon size={22} />
            </span>
            <p className={styles.emptyTitle}>What should we build?</p>
            <p className={styles.emptyText}>
              Describe a funnel or ask for a change. The assistant reads your draft (
              {definition.screens.length} screens) and proposes edits you approve before anything
              changes.
            </p>
            <div className={styles.suggestions}>
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  type="button"
                  className={styles.suggestion}
                  disabled={!enabled}
                  onClick={() => void send(s)}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((message) =>
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
                  <p className={styles.assistantText} data-failed={message.failed || undefined}>
                    {message.text}
                  </p>
                  {message.cards?.map((card, i) => {
                    const key = `${message.id}-${i}`;
                    return (
                      <AssistantCardView
                        key={key}
                        card={card}
                        ctx={{
                          definition,
                          busy,
                          picked: picked[key],
                          issues,
                          issueScreenId,
                          colorFor,
                          onPick: (value) => setPicked((p) => ({ ...p, [key]: value })),
                          onSend: (text) => void send(text),
                          onSelectScreen,
                          onTheme: (theme) => onApply([{ op: 'set_theme', theme }]),
                        }}
                      />
                    );
                  })}
                  {message.proposal ? (
                    <ProposalCard
                      proposal={message.proposal}
                      onApply={() => {
                        onApply(message.proposal!.patch);
                        updateProposal(message.id, 'applied');
                      }}
                      onDiscard={() => updateProposal(message.id, 'discarded')}
                    />
                  ) : null}
                </div>
              </div>
            ),
          )
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
            placeholder={enabled ? 'Ask the assistant…' : 'Assistant is not configured'}
            aria-label="Message the assistant"
            disabled={!enabled}
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
              disabled={draft.trim() === '' || !enabled}
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
