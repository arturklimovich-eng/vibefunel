'use client';

import { useId, useState } from 'react';
import { z } from 'zod';
import { boxStyle, textStyle } from '@/lib/styles';
import { blockKey, framed, isEditingRender } from '../frame';
import type { BlockProps } from '../frame';
import { useRuntime } from '../runtime-context';
import { EmailInputBlock } from './email';
import {
  checkboxProps,
  datePickerProps,
  ratingProps,
  sliderProps,
  textInputProps,
} from '@funnel/schema';
import { boxCss, number, parse, radio, select, text, textarea } from './shared';
import type { Components } from './shared';
import styles from './elements.module.css';

const EMOJI_SCALE = ['😞', '🙁', '😐', '🙂', '😄'];

function Rating(props: BlockProps) {
  const runtime = useRuntime();
  const p = parse(ratingProps, props);
  if (!p) return null;
  const key = blockKey(runtime.screenId, props);
  const value = key ? Number(runtime.values[key] ?? 0) : 0;
  const max = p.variant === 'emoji' ? 5 : p.max;
  const { accentColor, ...rest } = props.blockStyle;
  const accent = accentColor ?? 'var(--funnel-primary, #4f46e5)';
  return (
    <div className={styles.rating}>
      {p.label ? <p className={styles.fieldLabel}>{p.label}</p> : null}
      <div className={styles.ratingRow} role="radiogroup" aria-label={p.label || 'Rating'}>
        {Array.from({ length: max }, (_, i) => i + 1).map((n) => {
          const active = p.variant === 'stars' ? n <= value : n === value;
          return (
            <button
              key={n}
              type="button"
              role="radio"
              aria-checked={n === value}
              aria-label={`${n} of ${max}`}
              className={styles.ratingItem}
              data-variant={p.variant}
              data-active={active}
              style={{
                ...(p.variant === 'stars' ? {} : boxCss(rest)),
                ...(active && p.variant !== 'stars'
                  ? { borderColor: accent, background: accent, color: '#fff' }
                  : {}),
                ...(p.variant === 'stars' ? { color: active ? '#f5b301' : '#d1d5db' } : {}),
              }}
              onClick={() => key && runtime.setValue(key, String(n))}
            >
              {p.variant === 'stars' ? '★' : p.variant === 'emoji' ? EMOJI_SCALE[n - 1] : n}
            </button>
          );
        })}
      </div>
      {p.minLabel || p.maxLabel ? (
        <div className={styles.scaleLabels}>
          <span>{p.minLabel}</span>
          <span>{p.maxLabel}</span>
        </div>
      ) : null}
    </div>
  );
}

function Slider(props: BlockProps) {
  const runtime = useRuntime();
  const p = parse(sliderProps, props);
  const id = useId();
  if (!p) return null;
  const key = blockKey(runtime.screenId, props);
  const stored = key ? runtime.values[key] : undefined;
  const value = stored === undefined ? p.initial : Number(stored);
  const accent = props.blockStyle.accentColor ?? 'var(--funnel-primary, #4f46e5)';
  return (
    <div className={styles.slider} style={boxCss(props.blockStyle)}>
      {p.label ? (
        <label htmlFor={id} className={styles.fieldLabel}>
          {p.label}
        </label>
      ) : null}
      <output htmlFor={id} className={styles.sliderValue}>
        {value}
        {p.unit}
      </output>
      <input
        id={id}
        type="range"
        min={p.min}
        max={p.max}
        step={p.step}
        value={value}
        style={{ accentColor: accent }}
        onChange={(e) => key && runtime.setValue(key, e.target.value)}
      />
      {p.minLabel || p.maxLabel ? (
        <div className={styles.scaleLabels}>
          <span>{p.minLabel}</span>
          <span>{p.maxLabel}</span>
        </div>
      ) : null}
    </div>
  );
}

function fieldCss(props: BlockProps) {
  const s = props.blockStyle;
  return boxStyle({
    background: s.background,
    borderColor: s.borderColor,
    borderWidth: s.borderWidth,
    radius: s.radius,
    paddingX: s.paddingX,
    paddingY: s.paddingY,
  });
}

function TextInput(props: BlockProps) {
  const runtime = useRuntime();
  const p = parse(textInputProps, props);
  const id = useId();
  if (!p) return null;
  const key = blockKey(runtime.screenId, props);
  const value = key ? (runtime.values[key] ?? '') : '';
  return (
    <div className={styles.field}>
      {p.label ? (
        <label htmlFor={id} className={styles.fieldLabel} style={textStyle(props.blockStyle)}>
          {p.label}
          {p.required ? ' *' : ''}
        </label>
      ) : null}
      <div className={styles.inputWrap}>
        <input
          id={id}
          className={styles.input}
          style={fieldCss(props)}
          type={p.inputType === 'name' ? 'text' : p.inputType}
          inputMode={
            p.inputType === 'number' ? 'decimal' : p.inputType === 'tel' ? 'tel' : undefined
          }
          autoComplete={
            p.inputType === 'name'
              ? 'name'
              : p.inputType === 'tel'
                ? 'tel'
                : p.inputType === 'password'
                  ? 'new-password'
                  : 'off'
          }
          placeholder={p.placeholder}
          min={p.min}
          max={p.max}
          maxLength={200}
          required={p.required}
          value={value}
          onChange={(e) => key && runtime.setValue(key, e.target.value)}
        />
        {p.unit ? <span className={styles.inputUnit}>{p.unit}</span> : null}
      </div>
    </div>
  );
}

function DatePicker(props: BlockProps) {
  const runtime = useRuntime();
  const p = parse(datePickerProps, props);
  const id = useId();
  if (!p) return null;
  const key = blockKey(runtime.screenId, props);
  const value = key ? (runtime.values[key] ?? '') : '';
  const today = new Date().toISOString().slice(0, 10);
  return (
    <div className={styles.field}>
      {p.label ? (
        <label htmlFor={id} className={styles.fieldLabel} style={textStyle(props.blockStyle)}>
          {p.label}
          {p.required ? ' *' : ''}
        </label>
      ) : null}
      <input
        id={id}
        className={styles.input}
        style={fieldCss(props)}
        type="date"
        autoComplete={p.mode === 'birthday' ? 'bday' : 'off'}
        max={p.mode === 'birthday' ? today : undefined}
        min={p.mode === 'birthday' ? '1900-01-01' : undefined}
        required={p.required}
        value={value}
        onChange={(e) => key && runtime.setValue(key, e.target.value)}
      />
    </div>
  );
}

function Checkbox(props: BlockProps) {
  const runtime = useRuntime();
  const p = parse(checkboxProps, props);
  if (!p) return null;
  const key = blockKey(runtime.screenId, props);
  const checked = key ? runtime.values[key] === '1' : false;
  const safeLink = /^https:\/\//.test(p.linkUrl) ? p.linkUrl : '';
  return (
    <label className={styles.checkbox} style={boxCss(props.blockStyle)}>
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => key && runtime.setValue(key, e.target.checked ? '1' : '')}
        style={{ accentColor: props.blockStyle.accentColor ?? 'var(--funnel-primary, #4f46e5)' }}
      />
      <span>
        {p.label}
        {safeLink && p.linkLabel ? (
          <>
            {' '}
            <a href={safeLink} target="_blank" rel="noopener noreferrer">
              {p.linkLabel}
            </a>
          </>
        ) : null}
      </span>
    </label>
  );
}

const PROVIDERS = ['google', 'apple', 'facebook'] as const;
type Provider = (typeof PROVIDERS)[number];
const PROVIDER_NAMES: Record<Provider, string> = {
  google: 'Google',
  apple: 'Apple',
  facebook: 'Facebook',
};

function ProviderGlyph({ provider }: { provider: Provider }) {
  if (provider === 'google') {
    return (
      <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
        <path
          fill="#FFC107"
          d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z"
        />
        <path
          fill="#FF3D00"
          d="m6.3 14.7 6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"
        />
        <path
          fill="#4CAF50"
          d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z"
        />
        <path
          fill="#1976D2"
          d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z"
        />
      </svg>
    );
  }
  if (provider === 'apple') {
    return (
      <svg width="16" height="18" viewBox="0 0 384 512" aria-hidden="true">
        <path
          fill="currentColor"
          d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z"
        />
      </svg>
    );
  }
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="currentColor"
        d="M24 12a12 12 0 1 0-13.9 11.9v-8.4H7.1V12h3V9.4c0-3 1.8-4.7 4.5-4.7 1.3 0 2.7.2 2.7.2v3h-1.5c-1.5 0-2 .9-2 1.9V12h3.4l-.5 3.5h-2.9v8.4A12 12 0 0 0 24 12z"
      />
    </svg>
  );
}

function ProviderButton({
  provider,
  label,
  props,
}: {
  provider: Provider;
  label: string;
  props: BlockProps;
}) {
  const runtime = useRuntime();
  const editing = isEditingRender(props);
  const [note, setNote] = useState<string | null>(null);
  return (
    <>
      <button
        type="button"
        className={styles.oauthButton}
        data-provider={provider}
        style={boxCss(props.blockStyle)}
        onClick={() => {
          if (editing || runtime.screenId === null) return;
          setNote(`Sign in with ${PROVIDER_NAMES[provider]} is not connected for this funnel yet.`);
        }}
      >
        <ProviderGlyph provider={provider} />
        <span>{label.replace('{provider}', PROVIDER_NAMES[provider])}</span>
      </button>
      {note ? (
        <p className={styles.inlineNote} role="status">
          {note}
        </p>
      ) : null}
    </>
  );
}

const oauthButtonProps = z.object({
  provider: z.enum(PROVIDERS).default('google'),
  label: z.string().default('Continue with {provider}'),
});

function OAuthButton(props: BlockProps) {
  const p = parse(oauthButtonProps, props);
  if (!p) return null;
  return (
    <div className={styles.oauthList}>
      {isEditingRender(props) ? (
        <span className={styles.editorTag}>Provider not connected yet</span>
      ) : null}
      <ProviderButton provider={p.provider} label={p.label} props={props} />
    </div>
  );
}

const oauthButtonsProps = z.object({
  google: z.boolean().default(true),
  apple: z.boolean().default(true),
  facebook: z.boolean().default(false),
  label: z.string().default('Continue with {provider}'),
});

function OAuthButtons(props: BlockProps) {
  const p = parse(oauthButtonsProps, props);
  if (!p) return null;
  const list = PROVIDERS.filter((pr) => p[pr]);
  return (
    <div className={styles.oauthList}>
      {isEditingRender(props) ? (
        <span className={styles.editorTag}>Providers not connected yet</span>
      ) : null}
      {list.map((pr) => (
        <ProviderButton key={pr} provider={pr} label={p.label} props={props} />
      ))}
    </div>
  );
}

const emailOAuthProps = oauthButtonsProps.extend({ separator: z.string().default('or') });

function EmailOAuth(props: BlockProps) {
  const p = parse(emailOAuthProps, props);
  if (!p) return null;
  const list = PROVIDERS.filter((pr) => p[pr]);
  return (
    <div className={styles.emailOauth}>
      <EmailInputBlock {...props} />
      {list.length > 0 ? (
        <>
          <div className={styles.separator}>
            <span>{p.separator}</span>
          </div>
          <div className={styles.oauthList}>
            {list.map((pr) => (
              <ProviderButton
                key={pr}
                provider={pr}
                label="Continue with {provider}"
                props={props}
              />
            ))}
          </div>
        </>
      ) : null}
    </div>
  );
}

const required = radio('Required', [
  [true, 'Required'],
  [false, 'Optional'],
]);

const providerToggles = {
  google: radio('Google', [
    [true, 'Shown'],
    [false, 'Hidden'],
  ]),
  apple: radio('Apple', [
    [true, 'Shown'],
    [false, 'Hidden'],
  ]),
  facebook: radio('Facebook', [
    [true, 'Shown'],
    [false, 'Hidden'],
  ]),
};

export const inputComponents: Components = {
  Rating: {
    label: 'Rating',
    fields: {
      label: text('Label'),
      variant: radio('Type', [
        ['stars', 'Stars'],
        ['numbers', 'Numbers'],
        ['emoji', 'Emoji'],
      ]),
      max: number('Scale size (numbers)', 3, 10),
      minLabel: text('Low end label'),
      maxLabel: text('High end label'),
      required,
    },
    defaultProps: {
      label: 'How would you rate your energy?',
      variant: 'stars',
      max: 5,
      minLabel: '',
      maxLabel: '',
      required: true,
    },
    render: framed('Rating', Rating),
  },
  Slider: {
    label: 'Slider',
    fields: {
      label: text('Label'),
      min: number('Min'),
      max: number('Max'),
      step: number('Step', 0.1),
      initial: number('Start value'),
      unit: text('Unit'),
      minLabel: text('Low end label'),
      maxLabel: text('High end label'),
    },
    defaultProps: {
      label: 'How many hours do you sleep?',
      min: 4,
      max: 12,
      step: 0.5,
      initial: 7,
      unit: ' h',
      minLabel: '',
      maxLabel: '',
    },
    render: framed('Slider', Slider),
  },
  TextInput: {
    label: 'Input',
    fields: {
      label: text('Label'),
      placeholder: text('Placeholder'),
      inputType: select('Type', [
        ['text', 'Text'],
        ['name', 'Name'],
        ['number', 'Number'],
        ['tel', 'Phone'],
        ['password', 'Password'],
      ]),
      unit: text('Unit (numbers)'),
      min: number('Min (numbers)'),
      max: number('Max (numbers)'),
      required,
    },
    defaultProps: {
      label: 'Your height',
      placeholder: '170',
      inputType: 'number',
      unit: 'cm',
      required: true,
    },
    render: framed('TextInput', TextInput),
  },
  DatePicker: {
    label: 'Date Picker',
    fields: {
      label: text('Label'),
      mode: radio('Mode', [
        ['birthday', 'Birthday (past dates)'],
        ['date', 'Any date'],
      ]),
      required,
    },
    defaultProps: { label: 'Date of birth', mode: 'birthday', required: true },
    render: framed('DatePicker', DatePicker),
  },
  Checkbox: {
    label: 'Checkbox',
    fields: {
      label: textarea('Label'),
      linkLabel: text('Link text'),
      linkUrl: text('Link URL (https)'),
      required,
    },
    defaultProps: {
      label: 'I agree to the Terms of Service and Privacy Policy',
      linkLabel: '',
      linkUrl: '',
      required: true,
    },
    render: framed('Checkbox', Checkbox),
  },
  OAuthButton: {
    label: 'OAuth Button',
    fields: {
      provider: radio('Provider', [
        ['google', 'Google'],
        ['apple', 'Apple'],
        ['facebook', 'Facebook'],
      ]),
      label: text('Label ({provider} = name)'),
    },
    defaultProps: { provider: 'google', label: 'Continue with {provider}' },
    render: framed('OAuthButton', OAuthButton),
  },
  OAuthButtons: {
    label: 'OAuth Buttons',
    fields: { ...providerToggles, label: text('Label ({provider} = name)') },
    defaultProps: { google: true, apple: true, facebook: false, label: 'Continue with {provider}' },
    render: framed('OAuthButtons', OAuthButtons),
  },
  EmailOAuth: {
    label: 'Email + OAuth',
    fields: {
      label: text('Email label'),
      placeholder: text('Email placeholder'),
      required,
      consentLabel: textarea('Marketing consent label (empty hides it)'),
      separator: text('Separator text'),
      ...providerToggles,
    },
    defaultProps: {
      label: 'Email address',
      placeholder: 'you@example.com',
      required: true,
      consentLabel: '',
      separator: 'or',
      google: true,
      apple: true,
      facebook: false,
    },
    render: framed('EmailOAuth', EmailOAuth),
  },
};
