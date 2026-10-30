'use client';

import { useId, useState } from 'react';
import Image from 'next/image';
import { z } from 'zod';
import type { Config } from '@puckeditor/core';
import type { ScreenType } from '@funnel/schema';
import { emailKey, isValidEmail } from '@/lib/email';
import { randomId } from '@/lib/ids';
import { CheckoutPanel } from './CheckoutPanel';
import { PlanField } from './PlanField';
import { useRuntime } from './runtime-context';
import styles from './blocks.module.css';

export function isHttpsUrl(value: string): boolean {
  try {
    return new URL(value).protocol === 'https:';
  } catch {
    return false;
  }
}

const headingProps = z.object({ text: z.string(), level: z.enum(['1', '2', '3']).default('1') });
const paragraphProps = z.object({ text: z.string() });
const imageProps = z.object({ src: z.string(), alt: z.string().default('') });
const buttonProps = z.object({
  label: z.string(),
  action: z.enum(['next', 'skip', 'url']).default('next'),
  url: z.string().default(''),
});
export const optionListProps = z.object({
  mode: z.enum(['single', 'multi']).default('single'),
  options: z.array(z.object({ id: z.string(), label: z.string() })).default([]),
});
export const emailInputProps = z.object({
  label: z.string().default('Email'),
  placeholder: z.string().default(''),
  required: z.boolean().default(true),
});
const priceCardProps = z.object({
  title: z.string(),
  price: z.string(),
  period: z.string().default(''),
  features: z.array(z.object({ text: z.string() })).default([]),
  highlighted: z.boolean().default(false),
});
const checkoutBlockProps = z.object({ planKey: z.string().default('') });
const resultSummaryProps = z.object({
  title: z.string().default('Your answers'),
  showAnswers: z.boolean().default(false),
});

function newOptionId(): string {
  return `opt_${randomId(8)}`;
}

function Heading(props: Record<string, unknown>) {
  const parsed = headingProps.safeParse(props);
  if (!parsed.success) return null;
  const { text, level } = parsed.data;
  if (level === '2') return <h2 className={styles.heading}>{text}</h2>;
  if (level === '3') return <h3 className={styles.heading}>{text}</h3>;
  return <h1 className={styles.heading}>{text}</h1>;
}

function Paragraph(props: Record<string, unknown>) {
  const parsed = paragraphProps.safeParse(props);
  if (!parsed.success) return null;
  return <p className={styles.paragraph}>{parsed.data.text}</p>;
}

function ImageBlock(props: Record<string, unknown>) {
  const parsed = imageProps.safeParse(props);
  if (!parsed.success) return null;
  const { src, alt } = parsed.data;
  if (!isHttpsUrl(src)) {
    return <p className={styles.placeholder}>Image needs an https:// URL.</p>;
  }
  return (
    <Image className={styles.image} src={src} alt={alt} width={800} height={600} unoptimized />
  );
}

function ButtonBlock(props: Record<string, unknown>) {
  const runtime = useRuntime();
  const parsed = buttonProps.safeParse(props);
  if (!parsed.success) return null;
  const { label, action, url } = parsed.data;
  if (action === 'url') {
    if (!isHttpsUrl(url)) {
      return <p className={styles.placeholder}>Button needs an https:// URL.</p>;
    }
    return (
      <a className={styles.button} href={url} target="_blank" rel="noopener noreferrer">
        {label}
      </a>
    );
  }
  return (
    <button
      type="button"
      className={styles.button}
      onClick={() => runtime.next(action === 'skip' ? { fallbackOnly: true } : undefined)}
    >
      {label}
    </button>
  );
}

function OptionListBlock(props: Record<string, unknown>) {
  const runtime = useRuntime();
  const parsed = optionListProps.safeParse(props);
  if (!parsed.success) return null;
  const { mode, options } = parsed.data;
  const screenId = runtime.screenId;
  const current = screenId === null ? undefined : runtime.answers[screenId];
  const selected = current === undefined ? [] : typeof current === 'string' ? [current] : current;

  const choose = (optionId: string) => {
    if (screenId === null) return;
    if (mode === 'single') {
      runtime.setAnswer(screenId, optionId);
      return;
    }
    const next = selected.includes(optionId)
      ? selected.filter((id) => id !== optionId)
      : [...selected, optionId];
    runtime.setAnswer(screenId, next);
  };

  return (
    <fieldset className={styles.options}>
      {options.map((option) => {
        const isSelected = selected.includes(option.id);
        return (
          <button
            key={option.id}
            type="button"
            aria-pressed={isSelected}
            className={isSelected ? `${styles.option} ${styles.optionSelected}` : styles.option}
            onClick={() => choose(option.id)}
          >
            {option.label}
          </button>
        );
      })}
    </fieldset>
  );
}

function EmailInputBlock(props: Record<string, unknown>) {
  const runtime = useRuntime();
  const parsed = emailInputProps.safeParse(props);
  const [touched, setTouched] = useState(false);
  const inputId = useId();
  if (!parsed.success || typeof props.id !== 'string') {
    return (
      <p className={styles.placeholder} role="alert">
        Invalid email block: its settings could not be read, so this screen cannot continue.
      </p>
    );
  }
  const { label, placeholder, required } = parsed.data;
  const screenId = runtime.screenId;
  const key = screenId === null ? null : emailKey(screenId, props.id);
  const value = key === null ? '' : (runtime.emails[key] ?? '');
  const invalid = touched && value.trim().length > 0 && !isValidEmail(value);
  const missing = touched && required && value.trim().length === 0;
  const errorId = `${inputId}-error`;
  return (
    <div className={styles.field}>
      <label htmlFor={inputId} className={styles.fieldLabel}>
        {label}
        {required ? ' *' : ''}
      </label>
      <input
        id={inputId}
        type="email"
        autoComplete="email"
        inputMode="email"
        className={styles.input}
        placeholder={placeholder}
        value={value}
        required={required}
        maxLength={254}
        aria-invalid={invalid || missing}
        aria-describedby={invalid || missing ? errorId : undefined}
        onChange={(event) => {
          if (key !== null) runtime.setEmail(key, event.target.value);
        }}
        onBlur={() => setTouched(true)}
      />
      {invalid || missing ? (
        <p id={errorId} className={styles.fieldError}>
          {invalid ? 'Enter a valid email address.' : 'This field is required.'}
        </p>
      ) : null}
    </div>
  );
}

function PriceCardBlock(props: Record<string, unknown>) {
  const parsed = priceCardProps.safeParse(props);
  if (!parsed.success) return null;
  const { title, price, period, features, highlighted } = parsed.data;
  return (
    <section
      className={
        highlighted ? `${styles.priceCard} ${styles.priceCardHighlighted}` : styles.priceCard
      }
    >
      <h2 className={styles.priceTitle}>{title}</h2>
      <p className={styles.price}>
        <span>{price}</span>
        {period ? <span className={styles.pricePeriod}> {period}</span> : null}
      </p>
      {features.length > 0 ? (
        <ul className={styles.features}>
          {features.map((feature, index) => (
            <li key={`${index}-${feature.text}`}>{feature.text}</li>
          ))}
        </ul>
      ) : null}
    </section>
  );
}

function CheckoutBlockView(props: Record<string, unknown>) {
  const parsed = checkoutBlockProps.safeParse(props);
  if (!parsed.success) return null;
  return <CheckoutPanel planKey={parsed.data.planKey} />;
}

function ResultSummaryBlock(props: Record<string, unknown>) {
  const runtime = useRuntime();
  const parsed = resultSummaryProps.safeParse(props);
  if (!parsed.success) return null;
  const { title, showAnswers } = parsed.data;
  if (!showAnswers || runtime.answerSummary.length === 0) return null;
  return (
    <section className={styles.summary}>
      <h2 className={styles.priceTitle}>{title}</h2>
      <dl className={styles.summaryList}>
        {runtime.answerSummary.map((item) => (
          <div key={item.screenId} className={styles.summaryRow}>
            <dt>{item.title}</dt>
            <dd>{item.values.join(', ')}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

export const puckConfig: Config = {
  components: {
    Heading: {
      label: 'Heading',
      fields: {
        text: { type: 'text' },
        level: {
          type: 'select',
          options: [
            { label: 'H1', value: '1' },
            { label: 'H2', value: '2' },
            { label: 'H3', value: '3' },
          ],
        },
      },
      defaultProps: { text: 'Heading', level: '1' },
      render: (props) => <Heading {...props} />,
    },
    Paragraph: {
      label: 'Paragraph',
      fields: { text: { type: 'textarea' } },
      defaultProps: { text: 'Some text' },
      render: (props) => <Paragraph {...props} />,
    },
    Image: {
      label: 'Image',
      fields: { src: { type: 'text', label: 'Image URL (https only)' }, alt: { type: 'text' } },
      defaultProps: { src: '', alt: '' },
      render: (props) => <ImageBlock {...props} />,
    },
    Button: {
      label: 'Button',
      fields: {
        label: { type: 'text' },
        action: {
          type: 'radio',
          options: [
            { label: 'Next screen', value: 'next' },
            { label: 'Default path (skip or decline)', value: 'skip' },
            { label: 'Open URL', value: 'url' },
          ],
        },
        url: { type: 'text', label: 'URL (https only)' },
      },
      defaultProps: { label: 'Continue', action: 'next', url: '' },
      render: (props) => <ButtonBlock {...props} />,
    },
    OptionList: {
      label: 'Option list',
      fields: {
        mode: {
          type: 'radio',
          options: [
            { label: 'Single choice', value: 'single' },
            { label: 'Multiple choice', value: 'multi' },
          ],
        },
        options: {
          type: 'array',
          arrayFields: { id: { type: 'text', label: 'Option id' }, label: { type: 'text' } },
          defaultItemProps: () => ({ id: newOptionId(), label: 'New option' }),
          getItemSummary: (item) => item.label || 'Option',
        },
      },
      defaultProps: {
        mode: 'single',
        options: [
          { id: 'option_a', label: 'Option A' },
          { id: 'option_b', label: 'Option B' },
        ],
      },
      render: (props) => <OptionListBlock {...props} />,
    },
    EmailInput: {
      label: 'Email input',
      fields: {
        label: { type: 'text' },
        placeholder: { type: 'text' },
        required: {
          type: 'radio',
          options: [
            { label: 'Required', value: true },
            { label: 'Optional', value: false },
          ],
        },
      },
      defaultProps: { label: 'Email address', placeholder: 'you@example.com', required: true },
      render: (props) => <EmailInputBlock {...props} />,
    },
    PriceCard: {
      label: 'Price card',
      fields: {
        title: { type: 'text' },
        price: { type: 'text' },
        period: { type: 'text' },
        features: {
          type: 'array',
          arrayFields: { text: { type: 'text' } },
          defaultItemProps: { text: 'Feature' },
          getItemSummary: (item) => item.text || 'Feature',
        },
        highlighted: {
          type: 'radio',
          options: [
            { label: 'Highlighted', value: true },
            { label: 'Normal', value: false },
          ],
        },
      },
      defaultProps: {
        title: 'Plan',
        price: '$0',
        period: 'per month',
        features: [{ text: 'Feature' }],
        highlighted: false,
      },
      render: (props) => <PriceCardBlock {...props} />,
    },
    CheckoutBlock: {
      label: 'Checkout',
      fields: {
        planKey: {
          type: 'custom',
          label: 'Plan',
          render: ({ id, value, onChange, readOnly }) => (
            <PlanField
              id={id}
              value={typeof value === 'string' ? value : ''}
              onChange={onChange}
              readOnly={readOnly}
            />
          ),
        },
      },
      defaultProps: { planKey: '' },
      render: (props) => <CheckoutBlockView {...props} />,
    },
    PaymentPlaceholder: {
      label: 'Checkout (legacy placeholder)',
      fields: {},
      defaultProps: {},
      render: (props) => <CheckoutBlockView {...props} />,
    },
    ResultSummary: {
      label: 'Result summary',
      fields: {
        title: { type: 'text' },
        showAnswers: {
          type: 'radio',
          options: [
            { label: 'Show answers', value: true },
            { label: 'Hide answers', value: false },
          ],
        },
      },
      defaultProps: { title: 'Your answers', showAnswers: false },
      render: (props) => <ResultSummaryBlock {...props} />,
    },
  },
};

export const SKIP_SCREEN_TYPES: ReadonlySet<ScreenType> = new Set<ScreenType>([
  'paywall',
  'checkout',
  'upsell',
]);

const COMMON_BLOCKS = ['Heading', 'Paragraph', 'Image', 'Button'] as const;

const ALLOWED_COMPONENTS: Record<ScreenType, readonly string[]> = {
  welcome: COMMON_BLOCKS,
  quiz_single: [...COMMON_BLOCKS, 'OptionList'],
  quiz_multi: [...COMMON_BLOCKS, 'OptionList'],
  content: COMMON_BLOCKS,
  email_capture: [...COMMON_BLOCKS, 'EmailInput'],
  paywall: [...COMMON_BLOCKS, 'PriceCard'],
  checkout: [...COMMON_BLOCKS, 'PriceCard', 'CheckoutBlock'],
  upsell: [...COMMON_BLOCKS, 'PriceCard', 'CheckoutBlock'],
  success: [...COMMON_BLOCKS, 'ResultSummary'],
};

export function allowedComponentsForScreenType(type: ScreenType): readonly string[] {
  return ALLOWED_COMPONENTS[type];
}

export function optionModeForScreenType(type: ScreenType): 'single' | 'multi' | null {
  if (type === 'quiz_single') return 'single';
  if (type === 'quiz_multi') return 'multi';
  return null;
}

export function configForScreenType(type: ScreenType): Config {
  const allowed = new Set<string>(ALLOWED_COMPONENTS[type]);
  const components = Object.fromEntries(
    Object.entries(puckConfig.components).filter(([name]) => allowed.has(name)),
  );
  const buttonBase = components.Button;
  if (buttonBase && !SKIP_SCREEN_TYPES.has(type)) {
    components.Button = {
      ...buttonBase,
      fields: {
        ...buttonBase.fields,
        action: {
          type: 'radio',
          options: [
            { label: 'Next screen', value: 'next' },
            { label: 'Open URL', value: 'url' },
          ],
        },
      },
    };
  }
  const mode = optionModeForScreenType(type);
  const base = components.OptionList;
  const optionsField = base?.fields?.options;
  if (mode && base && optionsField) {
    components.OptionList = {
      ...base,
      fields: { options: optionsField },
      defaultProps: { ...base.defaultProps, mode },
    };
  }
  return { ...puckConfig, components };
}
