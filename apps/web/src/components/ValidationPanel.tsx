'use client';

import type { UiIssue } from '@/lib/use-draft-saver';
import styles from './FunnelEditor.module.css';

interface ValidationPanelProps {
  issues: UiIssue[];
  checked: boolean;
  canSelect: (issue: UiIssue) => boolean;
  onSelect: (issue: UiIssue) => void;
}

function IssueList({
  title,
  tone,
  items,
  canSelect,
  onSelect,
}: {
  title: string;
  tone: string | undefined;
  items: UiIssue[];
  canSelect: (issue: UiIssue) => boolean;
  onSelect: (issue: UiIssue) => void;
}) {
  if (items.length === 0) return null;
  return (
    <div>
      <h3 className={styles.issueHeading}>
        {title} ({items.length})
      </h3>
      <ul className={tone}>
        {items.map((issue, index) => (
          <li key={`${issue.code}-${issue.screenId ?? issue.edgeId ?? ''}-${index}`}>
            {canSelect(issue) ? (
              <button type="button" className={styles.issueButton} onClick={() => onSelect(issue)}>
                <strong>{issue.code}</strong>: {issue.message}
              </button>
            ) : (
              <span>
                <strong>{issue.code}</strong>: {issue.message}
              </span>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

export function ValidationPanel({ issues, checked, canSelect, onSelect }: ValidationPanelProps) {
  const errors = issues.filter((i) => i.severity === 'error');
  const warnings = issues.filter((i) => i.severity === 'warning');
  return (
    <section className={styles.panel} aria-labelledby="validation-heading">
      <h2 id="validation-heading" className={styles.panelHeading}>
        Validation
      </h2>
      {issues.length === 0 ? (
        <p className={styles.status} role="status">
          {checked ? 'No issues found by the last save.' : 'Issues appear here after saving.'}
        </p>
      ) : null}
      <div role={errors.length > 0 ? 'alert' : undefined}>
        <IssueList
          title="Errors"
          tone={styles.issueError}
          items={errors}
          canSelect={canSelect}
          onSelect={onSelect}
        />
      </div>
      <IssueList
        title="Warnings"
        tone={styles.issueWarning}
        items={warnings}
        canSelect={canSelect}
        onSelect={onSelect}
      />
    </section>
  );
}
