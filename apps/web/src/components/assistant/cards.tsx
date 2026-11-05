'use client';

import type { ReactNode } from 'react';
import type { AssistantCard, FunnelDefinition, Screen, ThemePatch } from '@funnel/schema';
import type { UiIssue } from '@/lib/use-draft-saver';
import { formatMoney } from '../StudioDashboard';
import shell from '../EditorShell.module.css';
import styles from './AssistantPanel.module.css';

const KIND_TYPE: Record<string, Screen['type']> = {
  email: 'auth',
  paywall: 'paywall',
  checkout: 'checkout',
  finish: 'finish',
};

export interface MetricsView {
  days: number;
  leads: number | null;
  purchases: number | null;
  revenue: { currency: string; amount: number }[];
}

export interface CardContext {
  definition: FunnelDefinition;
  metrics: MetricsView | null;
  busy: boolean;
  picked: string | undefined;
  issues: UiIssue[];
  issueScreenId: (issue: UiIssue) => string | undefined;
  colorFor: (type: Screen['type']) => string;
  onPick: (value: string) => void;
  onSend: (text: string) => void;
  onSelectScreen: (id: string) => void;
  onTheme: (theme: ThemePatch) => void;
}

export function AssistantCardView({ card, ctx }: { card: AssistantCard; ctx: CardContext }) {
  switch (card.kind) {
    case 'plan':
      return (
        <div className={styles.card}>
          <div className={styles.cardHead}>
            <span className={styles.cardKicker}>Plan</span>
            <strong>{card.title}</strong>
            <span className={styles.cardMeta}>{card.steps.length} screens</span>
          </div>
          <ol className={styles.plan}>
            {card.steps.map((step, i) => (
              <li key={i} className={styles.planStep}>
                <span
                  className={styles.planDot}
                  style={{ background: ctx.colorFor(KIND_TYPE[step.kind] ?? 'default') }}
                />
                <span className={styles.planTitle}>{step.title}</span>
                <span className={styles.planType}>{step.kind}</span>
              </li>
            ))}
          </ol>
        </div>
      );
    case 'choice':
      return (
        <div className={styles.card}>
          <p className={styles.cardQuestion}>{card.question}</p>
          <div className={styles.choices}>
            {card.options.map((option) => (
              <button
                key={option}
                type="button"
                className={styles.choice}
                aria-pressed={ctx.picked === option}
                disabled={ctx.picked !== undefined || ctx.busy}
                onClick={() => {
                  ctx.onPick(option);
                  ctx.onSend(option);
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
        <div className={styles.card}>
          <div className={styles.swatches}>
            {card.palettes.map((p) => (
              <button
                key={p.name}
                type="button"
                className={styles.swatch}
                aria-pressed={ctx.picked === p.name}
                disabled={ctx.picked !== undefined}
                title="Apply this palette"
                onClick={() => {
                  ctx.onPick(p.name);
                  ctx.onTheme({
                    primaryColor: p.primaryColor,
                    backgroundColor: p.backgroundColor,
                    textColor: p.textColor,
                  });
                }}
              >
                <span className={styles.swatchPreview} style={{ background: p.backgroundColor }}>
                  <span className={styles.swatchLine} style={{ background: p.textColor }} />
                  <span
                    className={styles.swatchLine}
                    data-short
                    style={{ background: p.textColor }}
                  />
                  <span className={styles.swatchButton} style={{ background: p.primaryColor }} />
                </span>
                <span className={styles.swatchName}>{p.name}</span>
              </button>
            ))}
          </div>
          {ctx.picked ? <p className={styles.cardMeta}>Applied {ctx.picked}.</p> : null}
        </div>
      );
    case 'issues': {
      if (ctx.issues.length === 0) {
        return (
          <div className={styles.card}>
            <p className={styles.okLine}>No problems found in the draft.</p>
          </div>
        );
      }
      return (
        <div className={styles.card}>
          <ul className={styles.issues}>
            {ctx.issues.slice(0, 8).map((issue, i) => {
              const screenId = ctx.issueScreenId(issue);
              return (
                <li key={i}>
                  <button
                    type="button"
                    className={styles.issue}
                    data-severity={issue.severity}
                    disabled={!screenId}
                    onClick={() => screenId && ctx.onSelectScreen(screenId)}
                  >
                    <span className={styles.issueDot} />
                    <span>{issue.message}</span>
                  </button>
                </li>
              );
            })}
          </ul>
          {ctx.issues.length > 8 ? (
            <p className={styles.cardMeta}>+{ctx.issues.length - 8} more</p>
          ) : null}
        </div>
      );
    }
    case 'metrics': {
      const m = ctx.metrics;
      if (!m) return null;
      const conversion =
        m.leads && m.purchases !== null ? `${((m.purchases / m.leads) * 100).toFixed(1)}%` : '—';
      const revenue =
        m.revenue.length > 0
          ? m.revenue.map((r) => formatMoney(r.amount, r.currency)).join(' + ')
          : '—';
      const stats: [string, string][] = [
        ['Leads', m.leads === null ? '—' : String(m.leads)],
        ['Purchases', m.purchases === null ? '—' : String(m.purchases)],
        ['Lead → purchase', conversion],
        ['Revenue', revenue],
      ];
      return (
        <div className={styles.card}>
          <div className={styles.cardHead}>
            <span className={styles.cardKicker}>Last {m.days} days</span>
          </div>
          <dl className={styles.metrics}>
            {stats.map(([label, value]) => (
              <div key={label}>
                <dt>{label}</dt>
                <dd>{value}</dd>
              </div>
            ))}
          </dl>
        </div>
      );
    }
    case 'screens': {
      const screens = card.screenIds.flatMap((id) => {
        const screen = ctx.definition.screens.find((s) => s.id === id);
        return screen ? [screen] : [];
      });
      if (screens.length === 0) return null;
      return (
        <div className={styles.card}>
          <div className={styles.choices}>
            {screens.map((s) => (
              <button
                key={s.id}
                type="button"
                className={styles.choice}
                onClick={() => ctx.onSelectScreen(s.id)}
              >
                <span className={styles.planDot} style={{ background: ctx.colorFor(s.type) }} />{' '}
                {s.title}
              </button>
            ))}
          </div>
        </div>
      );
    }
  }
}

export interface ProposalView {
  summary: string[];
  warnings: string[];
  errors: string[];
  state: 'open' | 'applied' | 'discarded';
  stale?: boolean;
}

export function ProposalCard({
  proposal,
  preview,
  onApply,
  onDiscard,
}: {
  proposal: ProposalView;
  preview?: ReactNode;
  onApply: () => void;
  onDiscard: () => void;
}) {
  const blocked = proposal.errors.length > 0;
  let applyHint: string | undefined;
  if (blocked) applyHint = 'These changes do not fit the funnel; ask again';
  else if (proposal.stale) {
    applyHint = 'The screens this changes were edited after the proposal; ask again';
  }
  return (
    <div className={styles.card} data-kind="proposal">
      <div className={styles.cardHead}>
        <span className={styles.cardKicker}>Proposed changes</span>
        {proposal.state !== 'open' ? (
          <span className={styles.cardMeta}>
            {proposal.state === 'applied' ? 'Applied' : 'Discarded'}
          </span>
        ) : null}
        {proposal.state === 'open' && proposal.stale ? (
          <span className={styles.cardMeta}>Draft changed since; ask again</span>
        ) : null}
      </div>
      <ul className={styles.diff}>
        {proposal.summary.map((line) => (
          <li key={line}>{line}</li>
        ))}
      </ul>
      {proposal.state === 'open' ? preview : null}
      {blocked ? (
        <ul className={styles.issues}>
          {proposal.errors.slice(0, 5).map((e) => (
            <li key={e} className={styles.issue} data-severity="error">
              <span className={styles.issueDot} />
              <span>{e}</span>
            </li>
          ))}
        </ul>
      ) : null}
      {!blocked && proposal.warnings.length > 0 ? (
        <p className={styles.cardMeta}>
          {proposal.warnings.length} warning{proposal.warnings.length === 1 ? '' : 's'} after
          applying; see the checks panel.
        </p>
      ) : null}
      {proposal.state === 'open' ? (
        <div className={styles.cardActions}>
          <button type="button" className={shell.outlineBtn} onClick={onDiscard}>
            Discard
          </button>
          <button
            type="button"
            className={shell.primaryBtn}
            disabled={blocked || proposal.stale}
            title={applyHint}
            onClick={onApply}
          >
            Apply
          </button>
        </div>
      ) : null}
    </div>
  );
}
