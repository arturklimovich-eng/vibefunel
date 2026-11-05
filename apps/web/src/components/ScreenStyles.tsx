'use client';

import type { FontWeight, ScreenStyle, Theme } from '@funnel/schema';
import {
  ColorRow,
  NumberInput,
  NumberRow,
  Row,
  Section,
  Segmented,
  SelectRow,
  SpacingRow,
  ImageRow,
  UrlRow,
} from './ParamControls';
import { FONT_OPTIONS, WEIGHT_OPTIONS, cleanObject } from './StyleFields';
import shell from './EditorShell.module.css';

const MEDIA_OPTIONS = [
  { value: 'image', label: 'Image' },
  { value: 'video', label: 'Video' },
] as const;

type Key = keyof ScreenStyle;

export function ScreenStyles({
  style,
  inherited,
  theme,
  saveLabel,
  onChange,
  onSave,
}: {
  style: ScreenStyle | undefined;
  inherited: ScreenStyle;
  theme: Theme;
  saveLabel?: string;
  onChange: (style: ScreenStyle | undefined) => void;
  onSave?: () => void;
}) {
  const s = style ?? {};
  const set = (patch: Partial<ScreenStyle>) => onChange(cleanObject({ ...s, ...patch }));
  const reset = (...keys: Key[]) =>
    keys.some((k) => s[k] !== undefined)
      ? () => set(Object.fromEntries(keys.map((k) => [k, undefined])))
      : undefined;
  const media = s.backgroundMedia ?? inherited.backgroundMedia ?? 'image';

  const color = (label: string, key: Key, fallback: string | undefined) => (
    <ColorRow
      label={label}
      value={typeof s[key] === 'string' ? (s[key] as string) : undefined}
      fallback={
        (typeof inherited[key] === 'string' ? (inherited[key] as string) : undefined) ?? fallback
      }
      onChange={(v) => set({ [key]: v })}
      onReset={reset(key)}
    />
  );

  return (
    <div className={shell.paramBody}>
      <div className={shell.paramGroup}>
        <SpacingRow
          label="Padding"
          value={{ top: s.paddingTop, bottom: s.paddingBottom, x: s.paddingX }}
          placeholders={{
            top: inherited.paddingTop,
            bottom: inherited.paddingBottom,
            x: inherited.paddingX,
          }}
          onChange={(v) => set({ paddingTop: v.top, paddingBottom: v.bottom, paddingX: v.x })}
          onReset={reset('paddingTop', 'paddingBottom', 'paddingX')}
        />
      </div>

      <Section title="Text">
        <SelectRow
          label="Font"
          value={s.fontFamily ?? inherited.fontFamily ?? 'inherit'}
          options={FONT_OPTIONS}
          onChange={(fontFamily) => set({ fontFamily })}
          onReset={reset('fontFamily')}
        />
      </Section>

      <Section title="Background">
        {color('Color', 'backgroundColor', theme.backgroundColor)}
        <Segmented
          inline
          label="Media"
          options={MEDIA_OPTIONS}
          value={media}
          onChange={(backgroundMedia) => set({ backgroundMedia })}
          onReset={reset('backgroundMedia')}
        />
        {media === 'image' ? (
          <ImageRow
            label="Image"
            aspect="9:16"
            value={s.backgroundImageUrl}
            inherited={inherited.backgroundImageUrl}
            onChange={(backgroundImageUrl) => set({ backgroundImageUrl })}
            onReset={reset('backgroundImageUrl')}
          />
        ) : (
          <UrlRow
            label="Video"
            value={s.backgroundVideoUrl}
            inherited={inherited.backgroundVideoUrl}
            onChange={(backgroundVideoUrl) => set({ backgroundVideoUrl })}
            onReset={reset('backgroundVideoUrl')}
          />
        )}
      </Section>

      <Section title="Header & Progress Bar">
        {color('Back Button Color', 'backButtonColor', theme.textColor)}
        {color('Title Color', 'titleColor', theme.textColor)}
        <SelectRow
          label="Font"
          value={s.headerFontFamily ?? inherited.headerFontFamily ?? 'inherit'}
          options={FONT_OPTIONS}
          onChange={(headerFontFamily) => set({ headerFontFamily })}
          onReset={reset('headerFontFamily')}
        />
        <Row label="" onReset={reset('headerFontSize', 'headerFontWeight')}>
          <div className={shell.pairGrid}>
            <NumberInput
              label="Header font size"
              unit="px"
              min={8}
              max={48}
              value={s.headerFontSize}
              placeholder={inherited.headerFontSize}
              onChange={(headerFontSize) => set({ headerFontSize })}
            />
            <select
              className={shell.input}
              aria-label="Header font weight"
              value={s.headerFontWeight ?? inherited.headerFontWeight ?? 'medium'}
              onChange={(e) => {
                const next = WEIGHT_OPTIONS.find((o) => o.value === e.target.value);
                if (next) set({ headerFontWeight: next.value as FontWeight });
              }}
            >
              {WEIGHT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>
        </Row>
        {color('Line Color', 'lineColor', theme.primaryColor)}
        {color('Line Background', 'lineBackground', '#F5F6F8')}
        <NumberRow
          label="Line Height"
          unit="px"
          min={1}
          max={16}
          value={s.lineHeight}
          placeholder={inherited.lineHeight}
          onChange={(lineHeight) => set({ lineHeight })}
          onReset={reset('lineHeight')}
        />
        <NumberRow
          label="Logo Size"
          unit="px"
          min={12}
          max={96}
          value={s.logoSize}
          placeholder={inherited.logoSize}
          onChange={(logoSize) => set({ logoSize })}
          onReset={reset('logoSize')}
        />
      </Section>

      {onSave ? (
        <div className={shell.paramGroup}>
          <button
            type="button"
            className={shell.ghostBtn}
            disabled={Object.keys(s).length === 0}
            onClick={onSave}
          >
            {saveLabel ?? 'Save as theme default'}
          </button>
        </div>
      ) : null}
    </div>
  );
}
