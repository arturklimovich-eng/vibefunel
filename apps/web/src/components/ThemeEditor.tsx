'use client';

import { useState } from 'react';
import { MAX_FONT_SCALE, MIN_FONT_SCALE, colorSchema } from '@funnel/schema';
import type { Theme } from '@funnel/schema';
import styles from './FunnelEditor.module.css';

type ColorKey = 'primaryColor' | 'backgroundColor' | 'textColor';

const COLOR_FIELDS: { key: ColorKey; label: string }[] = [
  { key: 'primaryColor', label: 'Primary color' },
  { key: 'backgroundColor', label: 'Background color' },
  { key: 'textColor', label: 'Text color' },
];

const SIX_DIGIT_HEX = /^#[0-9a-fA-F]{6}$/;

function ColorField({
  label,
  value,
  onCommit,
}: {
  label: string;
  value: string;
  onCommit: (value: string) => void;
}) {
  const [draft, setDraft] = useState(value);
  const valid = colorSchema.safeParse(draft).success;
  const update = (next: string) => {
    setDraft(next);
    if (colorSchema.safeParse(next).success) onCommit(next);
  };
  return (
    <div className={styles.field}>
      <label>
        {label}
        <span className={styles.colorRow}>
          <input
            type="color"
            aria-label={`${label} picker`}
            value={SIX_DIGIT_HEX.test(draft) ? draft : '#000000'}
            onChange={(e) => update(e.target.value)}
          />
          <input
            value={draft}
            aria-invalid={!valid}
            onChange={(e) => update(e.target.value)}
            maxLength={80}
          />
        </span>
      </label>
      {valid ? null : (
        <span className={styles.fieldError} role="alert">
          Use a hex, rgb(), rgba(), hsl() or hsla() color.
        </span>
      )}
    </div>
  );
}

function FontScaleField({ value, onCommit }: { value: number; onCommit: (value: number) => void }) {
  const [draft, setDraft] = useState(String(value));
  const parsed = Number(draft);
  const valid = draft.trim() !== '' && parsed >= MIN_FONT_SCALE && parsed <= MAX_FONT_SCALE;
  return (
    <div className={styles.field}>
      <label>
        Font size scale
        <input
          type="number"
          min={MIN_FONT_SCALE}
          max={MAX_FONT_SCALE}
          step={0.05}
          value={draft}
          aria-invalid={!valid}
          onChange={(e) => {
            setDraft(e.target.value);
            const next = Number(e.target.value);
            if (e.target.value.trim() !== '' && next >= MIN_FONT_SCALE && next <= MAX_FONT_SCALE) {
              onCommit(next);
            }
          }}
        />
      </label>
      {valid ? null : (
        <span className={styles.fieldError} role="alert">
          Enter a number from {MIN_FONT_SCALE} to {MAX_FONT_SCALE}.
        </span>
      )}
    </div>
  );
}

export function ThemeEditor({
  theme,
  onChange,
}: {
  theme: Theme;
  onChange: (theme: Theme) => void;
}) {
  return (
    <fieldset className={styles.fieldset}>
      <legend>Theme</legend>
      <div className={styles.row}>
        {COLOR_FIELDS.map(({ key, label }) => (
          <ColorField
            key={key}
            label={label}
            value={theme[key]}
            onCommit={(value) => onChange({ ...theme, [key]: value })}
          />
        ))}
        <FontScaleField
          value={theme.fontScale ?? 1}
          onCommit={(fontScale) => onChange({ ...theme, fontScale })}
        />
      </div>
    </fieldset>
  );
}
