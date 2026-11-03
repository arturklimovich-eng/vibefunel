'use client';

import { useState } from 'react';
import type { ReactNode } from 'react';
import { ChevronDown } from './EditorIcons';
import shell from './EditorShell.module.css';

export function Label({ label, onReset }: { label: ReactNode; onReset?: () => void }) {
  return (
    <span className={shell.paramLabel}>
      {label}
      {onReset ? (
        <button
          type="button"
          className={shell.resetMark}
          title="Modified from theme default. Click to reset."
          aria-label="Reset to theme default"
          onClick={(e) => {
            e.preventDefault();
            onReset();
          }}
        >
          ⚡
        </button>
      ) : null}
    </span>
  );
}

export function ToggleRow({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label className={shell.toggleRow}>
      <span className={shell.paramLabel}>{label}</span>
      <input
        type="checkbox"
        role="switch"
        className={shell.switch}
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
      />
    </label>
  );
}

export function Segmented<T extends string>({
  label,
  options,
  value,
  onChange,
  onReset,
  inline = true,
}: {
  label: string;
  options: readonly { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
  onReset?: () => void;
  inline?: boolean;
}) {
  return (
    <div className={inline ? shell.paramRow : shell.segmentedField}>
      <Label label={label} onReset={onReset} />
      <div className={shell.segmented} role="radiogroup" aria-label={label}>
        {options.map((o) => (
          <button
            key={o.value}
            type="button"
            role="radio"
            aria-checked={value === o.value}
            className={shell.segment}
            data-active={value === o.value}
            onClick={() => onChange(o.value)}
          >
            {o.label}
          </button>
        ))}
      </div>
    </div>
  );
}

export function Section({
  title,
  children,
  plain = false,
}: {
  title: string;
  children: ReactNode;
  plain?: boolean;
}) {
  if (plain) {
    return (
      <section className={shell.paramGroup} aria-label={title}>
        <h3 className={shell.sectionCaps}>{title}</h3>
        {children}
      </section>
    );
  }
  return (
    <details className={shell.paramSection} open>
      <summary className={shell.paramSummary}>
        {title} <ChevronDown size={14} />
      </summary>
      {children}
    </details>
  );
}

export function Row({
  label,
  onReset,
  children,
}: {
  label: string;
  onReset?: () => void;
  children: ReactNode;
}) {
  return (
    <div className={shell.paramRow}>
      <Label label={label} onReset={onReset} />
      {children}
    </div>
  );
}

interface NumberInputProps {
  label: string;
  icon?: ReactNode;
  unit?: string;
  value: number | undefined;
  placeholder?: number;
  min: number;
  max: number;
  step?: number;
  onChange: (value: number | undefined) => void;
}

export function NumberInput({
  label,
  icon,
  unit,
  value,
  placeholder,
  min,
  max,
  step = 1,
  onChange,
}: NumberInputProps) {
  const [draft, setDraft] = useState<string | null>(null);
  const shown = draft ?? (value === undefined ? '' : String(value));
  return (
    <label className={shell.numField}>
      {icon ? (
        <span className={shell.numIcon} aria-hidden="true">
          {icon}
        </span>
      ) : null}
      <input
        type="number"
        inputMode="decimal"
        aria-label={label}
        min={min}
        max={max}
        step={step}
        placeholder={placeholder === undefined ? '' : String(placeholder)}
        value={shown}
        onChange={(e) => {
          const text = e.target.value;
          setDraft(text);
          if (text.trim() === '') {
            onChange(undefined);
            return;
          }
          const n = Number(text);
          if (Number.isFinite(n) && n >= min && n <= max) {
            onChange(step < 1 ? Math.round(n * 10) / 10 : Math.round(n));
          }
        }}
        onBlur={() => setDraft(null)}
      />
      {unit ? <span className={shell.numUnit}>{unit}</span> : null}
    </label>
  );
}

export function NumberRow(props: NumberInputProps & { onReset?: () => void }) {
  return (
    <Row label={props.label} onReset={props.onReset}>
      <NumberInput {...props} />
    </Row>
  );
}

export interface Spacing {
  top?: number;
  bottom?: number;
  x?: number;
}

export function SpacingRow({
  label,
  value,
  placeholders,
  onChange,
  onReset,
}: {
  label: string;
  value: Spacing;
  placeholders: Spacing;
  onChange: (value: Spacing) => void;
  onReset?: () => void;
}) {
  return (
    <div className={shell.paramRow}>
      <Label label={label} onReset={onReset} />
      <div className={shell.spacingGrid}>
        <NumberInput
          label={`${label} top`}
          icon="↑"
          unit="px"
          min={0}
          max={200}
          value={value.top}
          placeholder={placeholders.top}
          onChange={(top) => onChange({ ...value, top })}
        />
        <NumberInput
          label={`${label} bottom`}
          icon="↓"
          unit="px"
          min={0}
          max={200}
          value={value.bottom}
          placeholder={placeholders.bottom}
          onChange={(bottom) => onChange({ ...value, bottom })}
        />
        <NumberInput
          label={`${label} horizontal`}
          icon="↔"
          unit="px"
          min={0}
          max={200}
          value={value.x}
          placeholder={placeholders.x}
          onChange={(x) => onChange({ ...value, x })}
        />
      </div>
    </div>
  );
}

export function SelectRow<T extends string>({
  label,
  value,
  options,
  onChange,
  onReset,
}: {
  label: string;
  value: T;
  options: readonly { value: T; label: string }[];
  onChange: (value: T) => void;
  onReset?: () => void;
}) {
  return (
    <div className={shell.paramRow}>
      <Label label={label} onReset={onReset} />
      <select
        className={shell.input}
        aria-label={label}
        value={value}
        onChange={(e) => {
          const next = options.find((o) => o.value === e.target.value);
          if (next) onChange(next.value);
        }}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}

const HEX = /^#?([0-9a-f]{3}|[0-9a-f]{6}|[0-9a-f]{8})$/i;

const FUNCTIONAL = /^(rgba?|hsla?)\(\s*([^)]*)\)$/i;

function channel(part: string, scale: number): number {
  const n = parseFloat(part);
  if (!Number.isFinite(n)) return Number.NaN;
  return part.trim().endsWith('%') ? (n / 100) * scale : n;
}

function hexOf(r: number, g: number, b: number): string {
  return [r, g, b]
    .map((c) =>
      Math.round(Math.min(255, Math.max(0, c)))
        .toString(16)
        .padStart(2, '0'),
    )
    .join('')
    .toUpperCase();
}

function hslToRgb(h: number, s: number, l: number): [number, number, number] {
  const k = (n: number) => (n + h / 30) % 12;
  const a = s * Math.min(l, 1 - l);
  const f = (n: number) => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
  return [f(0) * 255, f(8) * 255, f(4) * 255];
}

function splitFunctional(value: string): { hex: string; alpha: number } | null {
  const m = FUNCTIONAL.exec(value);
  if (!m?.[1] || m[2] === undefined) return null;
  const parts = m[2].split(/[\s,/]+/).filter((p) => p !== '');
  if (parts.length < 3) return null;
  const [p0 = '', p1 = '', p2 = '', p3] = parts;
  const alpha = p3 === undefined ? 100 : Math.round(channel(p3, 1) * 100);
  let rgb: [number, number, number];
  if (m[1].toLowerCase().startsWith('rgb')) {
    rgb = [channel(p0, 255), channel(p1, 255), channel(p2, 255)];
  } else {
    rgb = hslToRgb(parseFloat(p0), channel(p1, 1), channel(p2, 1));
  }
  if (rgb.some((c) => !Number.isFinite(c)) || !Number.isFinite(alpha)) return null;
  return { hex: hexOf(...rgb), alpha: Math.min(100, Math.max(0, alpha)) };
}

function splitColor(value: string | undefined): { hex: string; alpha: number } | null {
  if (!value) return null;
  const m = HEX.exec(value.trim());
  if (!m?.[1]) return splitFunctional(value.trim());
  let body = m[1];
  if (body.length === 3) body = [...body].map((c) => c + c).join('');
  const alpha = body.length === 8 ? Math.round((parseInt(body.slice(6), 16) / 255) * 100) : 100;
  return { hex: body.slice(0, 6).toUpperCase(), alpha };
}

function joinColor(hex: string, alpha: number): string {
  if (alpha >= 100) return `#${hex}`;
  const a = Math.round((Math.max(0, alpha) / 100) * 255)
    .toString(16)
    .padStart(2, '0')
    .toUpperCase();
  return `#${hex}${a}`;
}

export function ColorRow({
  label,
  value,
  fallback,
  onChange,
  onReset,
}: {
  label: string;
  value: string | undefined;
  fallback: string | undefined;
  onChange: (value: string | undefined) => void;
  onReset?: () => void;
}) {
  const [draft, setDraft] = useState<string | null>(null);
  const current = splitColor(value);
  const inherited = splitColor(fallback);
  const base = current ?? inherited ?? { hex: '000000', alpha: 100 };
  const shownHex = draft ?? (current ? current.hex : '');
  return (
    <div className={shell.paramRow}>
      <Label label={label} onReset={onReset} />
      <div className={shell.colorGrid}>
        <label
          className={shell.swatch}
          data-empty={!current && !inherited}
          style={{ background: current || inherited ? `#${base.hex}` : undefined }}
        >
          <input
            type="color"
            aria-label={`${label} picker`}
            value={`#${base.hex.toLowerCase()}`}
            onChange={(e) => onChange(joinColor(e.target.value.slice(1).toUpperCase(), base.alpha))}
          />
        </label>
        <label className={shell.numField}>
          <span className={shell.numIcon} aria-hidden="true">
            #
          </span>
          <input
            aria-label={`${label} hex`}
            className={shell.mono}
            maxLength={7}
            placeholder={inherited?.hex ?? ''}
            value={shownHex}
            onChange={(e) => {
              const text = e.target.value.replace(/^#/, '');
              setDraft(text);
              if (text === '') {
                onChange(undefined);
                return;
              }
              const parsed = splitColor(text);
              if (parsed && (text.length === 3 || text.length === 6)) {
                onChange(joinColor(parsed.hex, base.alpha));
              }
            }}
            onBlur={() => setDraft(null)}
          />
        </label>
        <NumberInput
          label={`${label} opacity`}
          unit="%"
          min={0}
          max={100}
          value={current ? current.alpha : undefined}
          placeholder={base.alpha}
          onChange={(alpha) => onChange(joinColor(base.hex, alpha ?? 100))}
        />
      </div>
    </div>
  );
}

export function UrlRow({
  label,
  value,
  inherited,
  onChange,
  onReset,
}: {
  label: string;
  value: string | undefined;
  inherited?: string;
  onChange: (value: string | undefined) => void;
  onReset?: () => void;
}) {
  return (
    <div className={shell.paramRow}>
      <Label label={label} onReset={onReset} />
      <input
        className={shell.input}
        type="url"
        aria-label={label}
        placeholder={inherited || 'https://…'}
        maxLength={2000}
        value={value ?? ''}
        onChange={(e) => onChange(e.target.value === '' ? undefined : e.target.value)}
      />
    </div>
  );
}
