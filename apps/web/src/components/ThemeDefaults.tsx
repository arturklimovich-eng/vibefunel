'use client';

import { useState } from 'react';
import type { Theme } from '@funnel/schema';
import type { StyleKind } from '@/lib/puck/catalog';
import { BUILTIN_SCREEN, TOKEN_KEYS, TOKEN_LABELS, builtinTokens, themeToken } from '@/lib/styles';
import type { TokenKey } from '@/lib/styles';
import { ScreenStyles } from './ScreenStyles';
import { StyleFields, cleanObject } from './StyleFields';
import shell from './EditorShell.module.css';

type Group = 'screen' | TokenKey;

const KIND: Record<TokenKey, StyleKind> = {
  title: 'text',
  subtitle: 'text',
  paragraph: 'text',
  button: 'button',
  options: 'options',
  input: 'box',
  other: 'none',
};

export function ThemeDefaults({
  theme,
  onChange,
}: {
  theme: Theme;
  onChange: (theme: Theme) => void;
}) {
  const [group, setGroup] = useState<Group>('title');
  const builtin = builtinTokens(theme);

  const setToken = (key: TokenKey, patch: Record<string, unknown>) => {
    const next = cleanObject({ ...themeToken(theme, key), ...patch });
    const elements = cleanObject({ ...theme.elements, [key]: next });
    onChange({ ...theme, elements: elements as Theme['elements'] });
  };

  return (
    <div className={shell.themeDefaults}>
      <label className={shell.paramRow}>
        <span className={shell.paramLabel}>Defaults for</span>
        <select
          className={shell.input}
          value={group}
          onChange={(e) => {
            const v = e.target.value;
            if (v === 'screen' || (TOKEN_KEYS as readonly string[]).includes(v))
              setGroup(v as Group);
          }}
        >
          <option value="screen">Screen</option>
          {TOKEN_KEYS.map((k) => (
            <option key={k} value={k}>
              {TOKEN_LABELS[k]}
            </option>
          ))}
        </select>
      </label>
      <p className={shell.muted}>
        Elements and screens use these values unless they change a field themselves (marked ⚡ in
        the inspector).
      </p>
      {group === 'screen' ? (
        <ScreenStyles
          style={theme.screen}
          inherited={BUILTIN_SCREEN}
          theme={theme}
          onChange={(screen) => onChange({ ...theme, screen })}
        />
      ) : (
        <StyleFields
          key={group}
          kind={KIND[group]}
          value={themeToken(theme, group)}
          inherited={builtin[group]}
          onChange={(patch) => setToken(group, patch)}
          allowPosition={false}
          allowEffects={group === 'button'}
        />
      )}
    </div>
  );
}
