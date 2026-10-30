'use client';

import { z } from 'zod';
import { ANIMATION_PRESETS, MAX_ANIMATION_MS } from '@funnel/schema';
import type { AnimationPreset, ScreenAnimation } from '@funnel/schema';
import styles from './FunnelEditor.module.css';

export function AnimationSettings({
  value,
  onChange,
}: {
  value: ScreenAnimation;
  onChange: (value: ScreenAnimation) => void;
}) {
  return (
    <>
      <label className={styles.field}>
        Transition
        <select
          value={value.preset}
          onChange={(e) => {
            const preset: AnimationPreset = z
              .enum(ANIMATION_PRESETS)
              .catch(value.preset)
              .parse(e.target.value);
            onChange({ ...value, preset });
          }}
        >
          {ANIMATION_PRESETS.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </select>
      </label>
      <label className={styles.field}>
        Duration (ms, 0 to {MAX_ANIMATION_MS})
        <input
          type="number"
          min={0}
          max={MAX_ANIMATION_MS}
          step={50}
          placeholder="300"
          value={value.durationMs ?? ''}
          disabled={value.preset === 'none'}
          onChange={(e) => {
            if (e.target.value === '') {
              onChange({ preset: value.preset });
              return;
            }
            const n = Number(e.target.value);
            if (!Number.isFinite(n)) return;
            const durationMs = Math.min(MAX_ANIMATION_MS, Math.max(0, Math.round(n)));
            onChange({ ...value, durationMs });
          }}
        />
      </label>
    </>
  );
}
