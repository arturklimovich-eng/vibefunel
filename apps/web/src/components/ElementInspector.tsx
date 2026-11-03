'use client';

import { useState } from 'react';
import type { Screen, Theme } from '@funnel/schema';
import { getScreenOptions } from '@/lib/puck/adapters';
import { CATALOG_BY_TYPE } from '@/lib/puck/catalog';
import {
  ELEMENT_ANIMATIONS,
  TOKEN_LABELS,
  VISIBILITY,
  inheritedStyle,
  readElementMeta,
  readElementStyle,
  tokenKeyFor,
} from '@/lib/styles';
import type { ElementMeta, ElementStyle, TokenKey } from '@/lib/styles';
import { NumberRow, SelectRow } from './ParamControls';
import { StyleFields, cleanObject } from './StyleFields';
import { ChevronLeft, CopyIcon, DuplicateIcon, EyeIcon, TrashIcon } from './EditorIcons';
import shell from './EditorShell.module.css';

export interface InspectedElement {
  id: string;
  type: string;
  label: string;
  props: Record<string, unknown>;
}

type Tab = 'parameters' | 'styles';

const VISIBILITY_OPTIONS = VISIBILITY.map((value) => ({
  value,
  label: value === 'yes' ? 'Yes' : value === 'no' ? 'No' : 'Conditional',
}));

const ANIMATION_OPTIONS = ELEMENT_ANIMATIONS.map((value) => ({
  value,
  label: { off: 'Off', slow: 'Slow', medium: 'Medium', fast: 'Fast', rapid: 'Rapid' }[value],
}));

const EFFECT_TYPES = new Set(['Button', 'Badge', 'WalletButton']);

export function ElementInspector({
  element,
  tab,
  screen,
  screens,
  theme,
  fieldsSlotRef,
  onBack,
  onUpdate,
  onSaveToTheme,
  onDuplicate,
  onDelete,
}: {
  element: InspectedElement;
  tab: Tab;
  screen: Screen;
  screens: Screen[];
  theme: Theme;
  fieldsSlotRef: (el: HTMLDivElement | null) => void;
  onBack: () => void;
  onUpdate: (patch: Record<string, unknown>) => void;
  onSaveToTheme: (key: TokenKey, style: ElementStyle) => void;
  onDuplicate: () => void;
  onDelete: () => void;
}) {
  const [copied, setCopied] = useState(false);
  const meta = readElementMeta(element.props);
  const style = readElementStyle(element.props);
  const inherited = inheritedStyle(element.type, element.props, theme);
  const entry = CATALOG_BY_TYPE.get(element.type);
  const tokenKey = tokenKeyFor(element.type, element.props);
  const setMeta = (patch: Partial<ElementMeta>) => onUpdate(patch);
  const setStyle = (patch: Partial<ElementStyle>) =>
    onUpdate({ style: cleanObject({ ...style, ...patch }) });

  const { position, ...themeable } = style;
  const canSaveToTheme = tokenKey !== 'other' && Object.keys(themeable).length > 0;

  const quizScreens = screens.filter((s) => s.id !== screen.id && getScreenOptions(s).length > 0);
  const whenScreen = quizScreens.find((s) => s.id === meta.visibleWhen?.screenId);
  const whenOptions = whenScreen ? getScreenOptions(whenScreen) : [];

  return (
    <div className={shell.elementInspector}>
      <div className={shell.elementHead}>
        <button type="button" className={shell.crumb} onClick={onBack}>
          <ChevronLeft size={12} /> {screen.title || screen.id}
        </button>
        <div className={shell.elementTitle}>
          <h2 className={shell.panelTitle}>{meta.name?.trim() || entry?.label || element.label}</h2>
          <span className={shell.typeChip}>{entry?.label ?? element.label}</span>
        </div>
      </div>

      <div hidden={tab !== 'parameters'}>
        <div className={shell.paramGroup}>
          <label className={shell.paramRow}>
            <span className={shell.paramLabel}>Name</span>
            <input
              className={shell.input}
              placeholder="Auto"
              maxLength={100}
              value={meta.name ?? ''}
              onChange={(e) =>
                setMeta({ name: e.target.value === '' ? undefined : e.target.value })
              }
            />
          </label>
          <div className={shell.paramRow}>
            <span className={shell.paramLabel}>ID</span>
            <div className={shell.idField}>
              <input className={shell.input} value={element.id} readOnly aria-label="Element ID" />
              <button
                type="button"
                className={shell.iconBtn}
                aria-label="Copy element ID"
                title={copied ? 'Copied' : 'Copy ID'}
                onClick={() => {
                  void navigator.clipboard?.writeText(element.id).then(() => {
                    setCopied(true);
                    window.setTimeout(() => setCopied(false), 1200);
                  });
                }}
              >
                <CopyIcon size={13} />
              </button>
            </div>
          </div>
          <div className={shell.paramRow}>
            <span className={shell.paramLabel}>
              <EyeIcon size={12} /> Visible
            </span>
            <div className={shell.segmented} role="radiogroup" aria-label="Visible">
              {VISIBILITY_OPTIONS.map((o) => {
                const active = (meta.visibility ?? 'yes') === o.value;
                return (
                  <button
                    key={o.value}
                    type="button"
                    role="radio"
                    aria-checked={active}
                    className={shell.segment}
                    data-active={active}
                    onClick={() => setMeta({ visibility: o.value === 'yes' ? undefined : o.value })}
                  >
                    {o.label}
                  </button>
                );
              })}
            </div>
          </div>
          {meta.visibility === 'conditional' ? (
            quizScreens.length === 0 ? (
              <p className={shell.muted}>Add a question screen to show this element by answer.</p>
            ) : (
              <>
                <SelectRow
                  label="When screen"
                  value={whenScreen?.id ?? ''}
                  options={[
                    { value: '', label: 'Select a screen' },
                    ...quizScreens.map((s) => ({ value: s.id, label: s.title || s.id })),
                  ]}
                  onChange={(screenId) => {
                    const first = quizScreens.find((s) => s.id === screenId);
                    const optionId = first ? getScreenOptions(first)[0]?.id : undefined;
                    setMeta({ visibleWhen: optionId ? { screenId, optionId } : undefined });
                  }}
                />
                {whenScreen ? (
                  <SelectRow
                    label="Answer is"
                    value={meta.visibleWhen?.optionId ?? ''}
                    options={whenOptions.map((o) => ({ value: o.id, label: o.label || o.id }))}
                    onChange={(optionId) =>
                      setMeta({ visibleWhen: { screenId: whenScreen.id, optionId } })
                    }
                  />
                ) : null}
                <p className={shell.muted}>Hidden until the visitor picks this answer.</p>
              </>
            )
          ) : null}
        </div>

        <div ref={fieldsSlotRef} className={shell.fieldsSlot} />

        <div className={shell.paramGroup}>
          <SelectRow
            label="Animation"
            value={meta.animation ?? 'off'}
            options={ANIMATION_OPTIONS}
            onChange={(animation) =>
              setMeta({ animation: animation === 'off' ? undefined : animation })
            }
          />
          {element.type === 'Button' ? (
            <NumberRow
              label="Delay"
              unit="s"
              min={0}
              max={30}
              step={0.1}
              value={meta.delay}
              placeholder={0}
              onChange={(delay) => setMeta({ delay: delay === 0 ? undefined : delay })}
            />
          ) : null}
        </div>

        <div className={shell.elementActions}>
          <button type="button" className={shell.plainAction} onClick={onDuplicate}>
            <DuplicateIcon size={15} /> Duplicate element
          </button>
          <button type="button" className={shell.dangerLink} onClick={onDelete}>
            <TrashIcon size={15} /> Delete element
          </button>
        </div>
      </div>

      <div hidden={tab !== 'styles'}>
        <StyleFields
          kind={entry?.styleKind ?? 'none'}
          value={style}
          inherited={inherited}
          onChange={setStyle}
          allowEffects={EFFECT_TYPES.has(element.type)}
          labels={{
            box: entry?.styleKind === 'button' && element.type === 'Badge' ? 'Badge' : undefined,
          }}
        />
        <div className={shell.themeActions}>
          <p className={shell.muted}>
            ⚡ marks values changed on this element. Empty fields use the theme (
            {TOKEN_LABELS[tokenKey]}).
          </p>
          <button
            type="button"
            className={shell.ghostBtn}
            disabled={!canSaveToTheme}
            title="Make these styles the default for every element of this kind"
            onClick={() => {
              onSaveToTheme(tokenKey, themeable);
              onUpdate({ style: position ? { position } : undefined });
            }}
          >
            Save as theme default for {TOKEN_LABELS[tokenKey]}
          </button>
        </div>
      </div>
    </div>
  );
}
