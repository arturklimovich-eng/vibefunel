'use client';

import { useEffect, useRef, useState } from 'react';
import type { CSSProperties } from 'react';
import { FieldLabel, createUsePuck } from '@puckeditor/core';
import { z } from 'zod';
import { isSkipType, isPaymentType } from '@funnel/schema';
import { boxStyle, readElementMeta, textStyle } from '@/lib/styles';
import type { ElementStyle } from '@/lib/styles';
import { CheckoutPanel } from '../CheckoutPanel';
import { PlanField } from '../PlanField';
import { useEditorData } from '../editor-context';
import { SELECTED_PLAN_KEY } from '../element-schemas';
import { framed, isEditingRender } from '../frame';
import type { BlockProps } from '../frame';
import { useRuntime } from '../runtime-context';
import { formatCountdown, useCountdown } from './flow';
import { isHttps } from './shared';
import type { Components } from './shared';
import styles from '../blocks.module.css';
import el from './elements.module.css';

export const BUTTON_ACTIONS = [
  'none',
  'next',
  'skip',
  'toggle',
  'purchase',
  'url',
  'scroll',
] as const;

export const buttonProps = z.object({
  label: z.string().default('Continue'),
  action: z.enum(BUTTON_ACTIONS).default('next'),
  destination: z.string().default(''),
  target: z.string().default(''),
  url: z.string().default(''),
  source: z.enum(['fixed', 'picker']).default('picker'),
  planKey: z.string().default(''),
  countdown: z.number().min(0).max(240).default(0),
});

const ACTION_LABELS: Record<(typeof BUTTON_ACTIONS)[number], string> = {
  none: 'Do Nothing',
  next: 'Navigate',
  skip: 'Navigate (decline path)',
  toggle: 'Show/Hide element',
  purchase: 'Purchase',
  url: 'Go to external link',
  scroll: 'Scroll to',
};

const usePuck = createUsePuck();

function css(style: ElementStyle): CSSProperties {
  return { ...boxStyle(style), ...textStyle(style) };
}

function ButtonView(props: BlockProps) {
  const runtime = useRuntime();
  const editing = isEditingRender(props);
  const live = !editing && runtime.screenId !== null;
  const [waiting, setWaiting] = useState(false);
  const [buying, setBuying] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const p = buttonProps.safeParse(props);
  const id = typeof props.id === 'string' ? props.id : 'button';
  const left = useCountdown(
    id,
    p.success ? p.data.countdown || 1 : 1,
    live && p.success && p.data.countdown > 0,
  );
  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );
  if (!p.success) return null;
  const { label, action, destination, target, url, source, planKey, countdown } = p.data;
  const style = css(props.blockStyle);
  const content = (
    <>
      <span>{label}</span>
      {countdown > 0 ? (
        <span className={el.countdownPill}>
          {formatCountdown(live ? left : countdown * 60_000)}
        </span>
      ) : null}
    </>
  );

  if (action === 'url') {
    if (!isHttps(url)) return <p className={styles.placeholder}>Button needs an https:// URL.</p>;
    return (
      <a
        className={styles.button}
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        style={style}
      >
        {content}
      </a>
    );
  }

  if (action === 'purchase' && buying) {
    const key =
      source === 'picker' ? runtime.values[SELECTED_PLAN_KEY] || runtime.defaultPlan : planKey;
    return <CheckoutPanel planKey={key} />;
  }

  const run = () => {
    if (!live) return;
    if (action === 'none') return;
    if (action === 'toggle') {
      if (target) runtime.toggle(target);
      return;
    }
    if (action === 'scroll') {
      if (!target) return;
      document
        .querySelector(`[data-element-id="${CSS.escape(target)}"]`)
        ?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }
    if (action === 'purchase') {
      setBuying(true);
      return;
    }
    if (action === 'skip') {
      runtime.next({ fallbackOnly: true });
      return;
    }
    runtime.next(destination ? { target: destination } : undefined);
  };

  const delay = readElementMeta(props).delay ?? 0;
  return (
    <button
      type="button"
      className={styles.button}
      style={style}
      disabled={waiting}
      data-countdown={countdown > 0 ? 'true' : undefined}
      onClick={() => {
        if (delay <= 0 || action === 'none') {
          run();
          return;
        }
        setWaiting(true);
        timer.current = setTimeout(() => {
          setWaiting(false);
          run();
        }, delay * 1000);
      }}
    >
      {content}
    </button>
  );
}

function ActionField({ value, onChange }: { value: unknown; onChange: (v: string) => void }) {
  const { screenType } = useEditorData();
  const allowed = BUTTON_ACTIONS.filter((a) => {
    if (a === 'skip') return screenType !== null && isSkipType(screenType);
    if (a === 'purchase') return screenType !== null && isPaymentType(screenType);
    return true;
  });
  const current = typeof value === 'string' ? value : 'next';
  return (
    <select className={el.fieldSelect} value={current} onChange={(e) => onChange(e.target.value)}>
      {allowed.map((a) => (
        <option key={a} value={a}>
          {ACTION_LABELS[a]}
        </option>
      ))}
      {!(allowed as readonly string[]).includes(current) ? (
        <option value={current}>
          {ACTION_LABELS[current as keyof typeof ACTION_LABELS] ?? current}
        </option>
      ) : null}
    </select>
  );
}

function DestinationField({ value, onChange }: { value: unknown; onChange: (v: string) => void }) {
  const { screens, screenId, screenType } = useEditorData();
  const current = typeof value === 'string' ? value : '';
  const locked = screenType !== null && isPaymentType(screenType);
  return (
    <>
      <select
        className={el.fieldSelect}
        value={current}
        disabled={locked}
        onChange={(e) => onChange(e.target.value)}
      >
        <option value="">Next screen (by connections)</option>
        {screens
          .filter((s) => s.id !== screenId)
          .map((s) => (
            <option key={s.id} value={s.id}>
              {s.title || s.id}
            </option>
          ))}
        {current && !screens.some((s) => s.id === current) ? (
          <option value={current}>Missing screen “{current}”</option>
        ) : null}
      </select>
      {locked ? (
        <p className={el.fieldNote}>
          Payment screens continue only through their payment connections.
        </p>
      ) : null}
    </>
  );
}

function TargetField({ value, onChange }: { value: unknown; onChange: (v: string) => void }) {
  const content = usePuck((s) => s.appState.data.content);
  const current = typeof value === 'string' ? value : '';
  return (
    <select className={el.fieldSelect} value={current} onChange={(e) => onChange(e.target.value)}>
      <option value="">Select an element</option>
      {content.map((item) => {
        const props = item.props as Record<string, unknown>;
        const id = String(props.id);
        const name = typeof props.name === 'string' && props.name ? props.name : item.type;
        const text =
          typeof props.text === 'string'
            ? props.text
            : typeof props.label === 'string'
              ? props.label
              : '';
        return (
          <option key={id} value={id}>
            {name}
            {text ? ` · ${text.slice(0, 30)}` : ''} ({id})
          </option>
        );
      })}
    </select>
  );
}

export const buttonComponents: Components = {
  Button: {
    label: 'Button',
    fields: {
      label: { type: 'text', label: 'Label' },
      action: {
        type: 'custom',
        label: 'Action',
        render: ({ value, onChange }) => (
          <FieldLabel label="Action" el="div">
            <ActionField value={value} onChange={onChange} />
          </FieldLabel>
        ),
      },
      destination: {
        type: 'custom',
        label: 'Destination',
        render: ({ value, onChange }) => (
          <FieldLabel label="Destination" el="div">
            <DestinationField value={value} onChange={onChange} />
          </FieldLabel>
        ),
      },
      target: {
        type: 'custom',
        label: 'Element',
        render: ({ value, onChange }) => (
          <FieldLabel label="Element" el="div">
            <TargetField value={value} onChange={onChange} />
          </FieldLabel>
        ),
      },
      url: { type: 'text', label: 'URL (https only)' },
      source: {
        type: 'radio',
        label: 'Plan',
        options: [
          { label: 'Picked on the paywall', value: 'picker' },
          { label: 'Fixed plan', value: 'fixed' },
        ],
      },
      planKey: {
        type: 'custom',
        label: 'Fixed plan',
        render: ({ id, value, onChange, readOnly }) => (
          <PlanField
            id={id}
            value={typeof value === 'string' ? value : ''}
            onChange={onChange}
            readOnly={readOnly}
          />
        ),
      },
      countdown: { type: 'number', label: 'Countdown (minutes, 0 = off)', min: 0, max: 240 },
    },
    resolveFields: (data, { fields }) => {
      const action = (data.props as Record<string, unknown>).action ?? 'next';
      const source = (data.props as Record<string, unknown>).source ?? 'picker';
      const keep = new Set(['label', 'action', 'countdown']);
      if (action === 'next') keep.add('destination');
      if (action === 'toggle' || action === 'scroll') keep.add('target');
      if (action === 'url') keep.add('url');
      if (action === 'purchase') {
        keep.add('source');
        if (source === 'fixed') keep.add('planKey');
      }
      return Object.fromEntries(Object.entries(fields).filter(([k]) => keep.has(k)));
    },
    defaultProps: {
      label: 'Continue',
      action: 'next',
      destination: '',
      target: '',
      url: '',
      source: 'picker',
      planKey: '',
      countdown: 0,
    },
    render: framed('Button', ButtonView),
  },
};
