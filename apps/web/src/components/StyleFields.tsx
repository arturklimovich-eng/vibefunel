'use client';

import { useState } from 'react';
import { FONT_FAMILIES, FONT_WEIGHTS } from '@funnel/schema';
import type { FontWeight } from '@funnel/schema';
import type { StyleKind } from '@/lib/puck/catalog';
import {
  ALIGNS,
  DECORATIONS,
  EFFECTS,
  FONT_LABELS,
  POSITIONS,
  SHADOWS,
  WEIGHT_LABELS,
} from '@/lib/styles';
import type { ElementStyle, StyleKey } from '@/lib/styles';
import {
  ColorRow,
  NumberInput,
  NumberRow,
  Row,
  Section,
  Segmented,
  SelectRow,
  SpacingRow,
} from './ParamControls';
import { ChevronDown } from './EditorIcons';
import shell from './EditorShell.module.css';

export const FONT_OPTIONS = FONT_FAMILIES.map((value) => ({ value, label: FONT_LABELS[value] }));
export const WEIGHT_OPTIONS = FONT_WEIGHTS.map((value) => ({ value, label: WEIGHT_LABELS[value] }));

const POSITION_LABELS = {
  content: 'In content',
  attached: 'Attached',
  attached_scroll: 'Attached on scroll',
} as const;
const POSITION_OPTIONS = POSITIONS.map((value) => ({ value, label: POSITION_LABELS[value] }));
const SHADOW_OPTIONS = SHADOWS.map((value) => ({
  value,
  label: value === 'none' ? 'No shadow' : value[0]?.toUpperCase() + value.slice(1),
}));
const EFFECT_OPTIONS = EFFECTS.map((value) => ({
  value,
  label: value === 'none' ? 'No effect' : value[0]?.toUpperCase() + value.slice(1),
}));
const ALIGN_OPTIONS = ALIGNS.map((value) => ({
  value,
  label: value[0]?.toUpperCase() + value.slice(1),
}));
const DECORATION_OPTIONS = DECORATIONS.map((value) => ({ value, label: value }));

export function cleanObject<T extends object>(value: T): T | undefined {
  const entries = Object.entries(value).filter(([, v]) => v !== undefined);
  return entries.length === 0 ? undefined : (Object.fromEntries(entries) as T);
}

export interface StyleFieldsProps {
  kind: StyleKind;
  value: ElementStyle;
  inherited: ElementStyle;
  onChange: (patch: Partial<ElementStyle>) => void;
  allowPosition?: boolean;
  allowEffects?: boolean;
  labels?: { box?: string; text?: string };
}

export function StyleFields({
  kind,
  value,
  inherited,
  onChange,
  allowPosition = true,
  allowEffects = false,
  labels = {},
}: StyleFieldsProps) {
  const [more, setMore] = useState(() =>
    (
      [
        'position',
        'containerPaddingY',
        'containerPaddingX',
        'containerBackground',
        'containerRadius',
        'containerBorderWidth',
        'containerBorderColor',
        'containerShadow',
      ] as StyleKey[]
    ).some((k) => value[k] !== undefined),
  );
  const reset = (...keys: StyleKey[]) =>
    keys.some((k) => value[k] !== undefined)
      ? () => onChange(Object.fromEntries(keys.map((k) => [k, undefined])))
      : undefined;
  const num = (key: StyleKey): number | undefined => {
    const v = value[key];
    return typeof v === 'number' ? v : undefined;
  };
  const inh = (key: StyleKey): number | undefined => {
    const v = inherited[key];
    return typeof v === 'number' ? v : undefined;
  };
  const str = (key: StyleKey, src: ElementStyle = value): string | undefined => {
    const v = src[key];
    return typeof v === 'string' ? v : undefined;
  };

  const color = (label: string, key: StyleKey) => (
    <ColorRow
      label={label}
      value={str(key)}
      fallback={str(key, inherited)}
      onChange={(v) => onChange({ [key]: v })}
      onReset={reset(key)}
    />
  );

  const number = (
    label: string,
    key: StyleKey,
    unit: string,
    min: number,
    max: number,
    icon?: string,
  ) => (
    <NumberRow
      label={label}
      icon={icon}
      unit={unit}
      min={min}
      max={max}
      value={num(key)}
      placeholder={inh(key)}
      onChange={(v) => onChange({ [key]: v })}
      onReset={reset(key)}
    />
  );

  const pair = (label: string, y: StyleKey, x: StyleKey) => (
    <Row label={label} onReset={reset(y, x)}>
      <div className={shell.pairGrid}>
        <NumberInput
          label={`${label} vertical`}
          icon="↕"
          unit="px"
          min={0}
          max={200}
          value={num(y)}
          placeholder={inh(y)}
          onChange={(v) => onChange({ [y]: v })}
        />
        <NumberInput
          label={`${label} horizontal`}
          icon="↔"
          unit="px"
          min={0}
          max={200}
          value={num(x)}
          placeholder={inh(x)}
          onChange={(v) => onChange({ [x]: v })}
        />
      </div>
    </Row>
  );

  const shadow = (label: string, key: 'shadow' | 'containerShadow') => (
    <SelectRow
      label={label}
      value={value[key] ?? inherited[key] ?? 'none'}
      options={SHADOW_OPTIONS}
      onChange={(v) => onChange({ [key]: v })}
      onReset={reset(key)}
    />
  );

  const fontRows = () => (
    <>
      <SelectRow
        label="Font"
        value={value.fontFamily ?? inherited.fontFamily ?? 'inherit'}
        options={FONT_OPTIONS}
        onChange={(v) => onChange({ fontFamily: v })}
        onReset={reset('fontFamily')}
      />
      <Row label="" onReset={reset('fontSize', 'fontWeight')}>
        <div className={shell.pairGrid}>
          <NumberInput
            label="Font size"
            unit="px"
            min={8}
            max={96}
            value={value.fontSize}
            placeholder={inherited.fontSize}
            onChange={(v) => onChange({ fontSize: v })}
          />
          <select
            className={shell.input}
            aria-label="Font weight"
            value={value.fontWeight ?? inherited.fontWeight ?? 'regular'}
            onChange={(e) => {
              const next = WEIGHT_OPTIONS.find((o) => o.value === e.target.value);
              if (next) onChange({ fontWeight: next.value as FontWeight });
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
    </>
  );

  const lineHeight = () => {
    const unit = value.lineHeightUnit ?? inherited.lineHeightUnit ?? '%';
    return (
      <Row label="Line Height" onReset={reset('lineHeight', 'lineHeightUnit')}>
        <div className={shell.unitGrid}>
          <NumberInput
            label="Line height"
            min={0}
            max={300}
            value={value.lineHeight}
            placeholder={inherited.lineHeight}
            onChange={(v) => onChange({ lineHeight: v })}
          />
          <select
            className={shell.input}
            aria-label="Line height unit"
            value={unit}
            onChange={(e) => onChange({ lineHeightUnit: e.target.value === 'px' ? 'px' : '%' })}
          >
            <option value="%">%</option>
            <option value="px">px</option>
          </select>
        </div>
      </Row>
    );
  };

  const textSection = (title: string, withLinks: boolean) => (
    <>
      <Section title={title}>
        {color('Color', 'color')}
        {fontRows()}
        <Segmented
          inline
          label="Align"
          options={ALIGN_OPTIONS}
          value={value.align ?? inherited.align ?? 'left'}
          onChange={(align) => onChange({ align })}
          onReset={reset('align')}
        />
        {lineHeight()}
      </Section>
      {withLinks ? (
        <Section title="Links">
          {color('Color', 'linkColor')}
          <SelectRow
            label="Font Weight"
            value={value.linkWeight ?? inherited.linkWeight ?? 'regular'}
            options={WEIGHT_OPTIONS}
            onChange={(v) => onChange({ linkWeight: v })}
            onReset={reset('linkWeight')}
          />
          <SelectRow
            label="Decoration"
            value={value.linkDecoration ?? inherited.linkDecoration ?? 'inherit'}
            options={DECORATION_OPTIONS}
            onChange={(v) => onChange({ linkDecoration: v })}
            onReset={reset('linkDecoration')}
          />
        </Section>
      ) : null}
    </>
  );

  const boxRows = (withWidth: boolean, bgLabel = 'Background') => (
    <>
      {withWidth ? number('Width', 'width', '%', 10, 100) : null}
      {pair('Padding', 'paddingY', 'paddingX')}
      {color(bgLabel, 'background')}
      {number('Roundness', 'radius', 'px', 0, 400, '◜')}
      {number('Border', 'borderWidth', 'px', 0, 12, 'W')}
      {color('Border Color', 'borderColor')}
      {shadow('Shadow', 'shadow')}
    </>
  );

  const content = () => {
    if (kind === 'text') return textSection(labels.text ?? 'Text', true);
    if (kind === 'button') {
      return (
        <>
          <Section title={labels.box ?? 'Button'}>
            {boxRows(true)}
            {allowEffects ? (
              <SelectRow
                label="Visual Effect"
                value={value.effect ?? inherited.effect ?? 'none'}
                options={EFFECT_OPTIONS}
                onChange={(effect) => onChange({ effect })}
                onReset={reset('effect')}
              />
            ) : null}
          </Section>
          {textSection('Text', false)}
        </>
      );
    }
    if (kind === 'options') {
      return (
        <>
          <Section title={labels.box ?? 'Items'}>
            {boxRows(false)}
            {color('Selected Color', 'accentColor')}
          </Section>
          {textSection('Text', false)}
        </>
      );
    }
    if (kind === 'media') {
      return (
        <Section title={labels.box ?? 'Media'}>
          {number('Width', 'width', '%', 10, 100)}
          {number('Roundness', 'radius', 'px', 0, 400, '◜')}
          {shadow('Shadow', 'shadow')}
        </Section>
      );
    }
    if (kind === 'box') {
      return (
        <>
          <Section title={labels.box ?? 'Box'}>
            {boxRows(false)}
            {color('Accent Color', 'accentColor')}
          </Section>
          <Section title="Text">
            {color('Color', 'color')}
            {fontRows()}
          </Section>
        </>
      );
    }
    return null;
  };

  return (
    <>
      <Section title="Container" plain>
        <SpacingRow
          label="Offset"
          value={{ top: value.offsetTop, bottom: value.offsetBottom, x: value.offsetX }}
          placeholders={{
            top: inherited.offsetTop,
            bottom: inherited.offsetBottom,
            x: inherited.offsetX,
          }}
          onChange={(v) => onChange({ offsetTop: v.top, offsetBottom: v.bottom, offsetX: v.x })}
          onReset={reset('offsetTop', 'offsetBottom', 'offsetX')}
        />
        {more ? (
          <>
            {allowPosition ? (
              <SelectRow
                label="Position"
                value={value.position ?? inherited.position ?? 'content'}
                options={POSITION_OPTIONS}
                onChange={(position) => onChange({ position })}
                onReset={reset('position')}
              />
            ) : null}
            {pair('Padding', 'containerPaddingY', 'containerPaddingX')}
            {color('Background', 'containerBackground')}
            {number('Roundness', 'containerRadius', 'px', 0, 400, '◜')}
            {number('Border', 'containerBorderWidth', 'px', 0, 12, 'W')}
            {color('Border Color', 'containerBorderColor')}
            {shadow('Shadows', 'containerShadow')}
          </>
        ) : null}
        <button type="button" className={shell.showMore} onClick={() => setMore((m) => !m)}>
          {more ? 'show less' : 'show more'}
          <ChevronDown size={12} style={more ? { transform: 'rotate(180deg)' } : undefined} />
        </button>
      </Section>
      {content()}
    </>
  );
}
