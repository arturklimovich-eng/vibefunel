'use client';

import { useState } from 'react';
import type { CSSProperties } from 'react';
import Image from 'next/image';
import { z } from 'zod';
import type { Config } from '@puckeditor/core';
import type { ScreenType } from '@funnel/schema';
import { randomId } from '@/lib/ids';
import { boxStyle, textStyle } from '@/lib/styles';
import { framed, isEditingRender } from './frame';
import { SELECTED_PLAN_KEY } from './element-schemas';
import { allowedTypesFor } from './catalog';
import { contentComponents } from './elements/content';
import { flowComponents } from './elements/flow';
import { inputComponents } from './elements/inputs';
import { layoutComponents } from './elements/layout';
import { paywallComponents } from './elements/paywall';
import { buttonComponents } from './elements/button';
import { textComponents } from './elements/text';
import { EmailInputBlock } from './elements/email';
import type { BlockProps } from './frame';
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
export const optionListProps = z.object({
  mode: z.enum(['single', 'multi']).default('single'),
  layout: z.enum(['list', 'grid', 'cards', 'cover', 'popup']).default('list'),
  question: z.string().default(''),
  options: z
    .array(
      z.object({
        id: z.string(),
        label: z.string(),
        emoji: z.string().max(8).optional(),
        image: z.string().max(2000).optional(),
      }),
    )
    .default([]),
});
const priceCardProps = z.object({
  title: z.string(),
  price: z.string(),
  period: z.string().default(''),
  features: z.array(z.object({ text: z.string() })).default([]),
  highlighted: z.boolean().default(false),
});
const checkoutBlockProps = z.object({
  planKey: z.string().default(''),
  source: z.enum(['fixed', 'picker']).default('fixed'),
});
const resultSummaryProps = z.object({
  title: z.string().default('Your answers'),
  showAnswers: z.boolean().default(false),
});

function newOptionId(): string {
  return `opt_${randomId(8)}`;
}

function Heading(props: BlockProps) {
  const parsed = headingProps.safeParse(props);
  if (!parsed.success) return null;
  const { text, level } = parsed.data;
  const style = textStyle(props.blockStyle);
  if (level === '2')
    return (
      <h2 className={styles.heading} data-level="2" style={style}>
        {text}
      </h2>
    );
  if (level === '3')
    return (
      <h3 className={styles.heading} data-level="3" style={style}>
        {text}
      </h3>
    );
  return (
    <h1 className={styles.heading} style={style}>
      {text}
    </h1>
  );
}

function Paragraph(props: BlockProps) {
  const parsed = paragraphProps.safeParse(props);
  if (!parsed.success) return null;
  return (
    <p className={styles.paragraph} style={textStyle(props.blockStyle)}>
      {parsed.data.text}
    </p>
  );
}

function ImageBlock(props: BlockProps) {
  const parsed = imageProps.safeParse(props);
  if (!parsed.success) return null;
  const { src, alt } = parsed.data;
  if (!isHttpsUrl(src)) {
    return <p className={styles.placeholder}>Image needs an https:// URL.</p>;
  }
  const { radius, width } = props.blockStyle;
  return (
    <Image
      className={styles.image}
      src={src}
      alt={alt}
      width={800}
      height={600}
      unoptimized
      style={boxStyle({ radius, width })}
    />
  );
}

function OptionListBlock(props: BlockProps) {
  const runtime = useRuntime();
  const parsed = optionListProps.safeParse(props);
  if (!parsed.success) return null;
  const { mode, layout, options } = parsed.data;
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

  const { accentColor, ...rest } = props.blockStyle;
  const optionCss = { ...boxStyle({ ...rest, width: undefined }), ...textStyle(rest) };
  if (layout === 'popup') {
    return (
      <OptionPopup
        question={parsed.data.question}
        options={options}
        editing={isEditingRender(props)}
        answered={selected.length > 0}
        optionCss={optionCss}
        onChoose={choose}
      />
    );
  }
  return (
    <fieldset className={styles.options} data-layout={layout}>
      {options.map((option) => {
        const isSelected = selected.includes(option.id);
        const image = option.image && isHttpsUrl(option.image) ? option.image : null;
        return (
          <button
            key={option.id}
            type="button"
            aria-pressed={isSelected}
            className={isSelected ? `${styles.option} ${styles.optionSelected}` : styles.option}
            data-layout={layout}
            style={
              isSelected && accentColor ? { ...optionCss, borderColor: accentColor } : optionCss
            }
            onClick={() => choose(option.id)}
          >
            {image ? (
              <Image
                className={styles.optionImage}
                src={image}
                alt=""
                width={240}
                height={180}
                unoptimized
              />
            ) : option.emoji ? (
              <span className={styles.optionEmoji} aria-hidden="true">
                {option.emoji}
              </span>
            ) : null}
            <span className={styles.optionLabel}>{option.label}</span>
            {mode === 'multi' ? (
              <span className={styles.optionCheck} data-checked={isSelected} aria-hidden="true" />
            ) : null}
          </button>
        );
      })}
    </fieldset>
  );
}

function OptionPopup({
  question,
  options,
  editing,
  answered,
  optionCss,
  onChoose,
}: {
  question: string;
  options: { id: string; label: string; emoji?: string }[];
  editing: boolean;
  answered: boolean;
  optionCss: CSSProperties;
  onChoose: (id: string) => void;
}) {
  const [dismissed, setDismissed] = useState(false);
  const card = (
    <div className={styles.questionCard}>
      <p className={styles.questionText}>{question}</p>
      <div className={styles.questionActions}>
        {options.map((o) => (
          <button
            key={o.id}
            type="button"
            className={styles.option}
            style={optionCss}
            onClick={() => {
              onChoose(o.id);
              setDismissed(true);
            }}
          >
            {o.emoji ? `${o.emoji} ` : ''}
            {o.label}
          </button>
        ))}
      </div>
    </div>
  );
  if (editing) {
    return (
      <div>
        <span className={styles.editorTag}>Popup question · opens over the screen</span>
        {card}
      </div>
    );
  }
  if (dismissed || answered) return null;
  return (
    <div className={styles.questionOverlay} role="dialog" aria-modal="true" aria-label={question}>
      {card}
    </div>
  );
}

function PriceCardBlock(props: BlockProps) {
  const parsed = priceCardProps.safeParse(props);
  if (!parsed.success) return null;
  const { title, price, period, features, highlighted } = parsed.data;
  const { accentColor, ...rest } = props.blockStyle;
  const css = { ...boxStyle({ ...rest, width: undefined }), ...textStyle(rest) };
  return (
    <section
      className={
        highlighted ? `${styles.priceCard} ${styles.priceCardHighlighted}` : styles.priceCard
      }
      style={highlighted && accentColor ? { ...css, borderColor: accentColor } : css}
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

function CheckoutBlockView(props: BlockProps) {
  const runtime = useRuntime();
  const parsed = checkoutBlockProps.safeParse(props);
  if (!parsed.success) return null;
  const planKey =
    parsed.data.source === 'picker'
      ? runtime.values[SELECTED_PLAN_KEY] || runtime.defaultPlan
      : parsed.data.planKey;
  return <CheckoutPanel planKey={planKey} />;
}

function ResultSummaryBlock(props: BlockProps) {
  const runtime = useRuntime();
  const parsed = resultSummaryProps.safeParse(props);
  if (!parsed.success) return null;
  const { title, showAnswers } = parsed.data;
  if (!showAnswers || runtime.answerSummary.length === 0) return null;
  return (
    <section className={styles.summary} style={textStyle(props.blockStyle)}>
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
    ...layoutComponents,
    ...contentComponents,
    ...inputComponents,
    ...flowComponents,
    ...paywallComponents,
    ...buttonComponents,
    ...textComponents,
    Heading: {
      label: 'Title',
      fields: {
        text: { type: 'text' },
        level: {
          type: 'radio',
          label: 'Type',
          options: [
            { label: 'Title', value: '1' },
            { label: 'Subtitle', value: '2' },
            { label: 'Small title', value: '3' },
          ],
        },
      },
      defaultProps: { text: 'Heading', level: '1' },
      render: framed('Heading', Heading),
    },
    Paragraph: {
      label: 'Text',
      fields: { text: { type: 'textarea' } },
      defaultProps: { text: 'Some text' },
      render: framed('Paragraph', Paragraph),
    },
    Image: {
      label: 'Image',
      fields: { src: { type: 'text', label: 'Image URL (https only)' }, alt: { type: 'text' } },
      defaultProps: { src: '', alt: '' },
      render: framed('Image', ImageBlock),
    },
    OptionList: {
      label: 'Options',
      fields: {
        mode: {
          type: 'radio',
          label: 'Selection',
          options: [
            { label: 'Single choice', value: 'single' },
            { label: 'Multiple choice', value: 'multi' },
          ],
        },
        layout: {
          type: 'radio',
          label: 'Layout',
          options: [
            { label: 'List', value: 'list' },
            { label: 'Grid', value: 'grid' },
            { label: 'Cards', value: 'cards' },
            { label: 'Cover', value: 'cover' },
            { label: 'Popup', value: 'popup' },
          ],
        },
        question: { type: 'text', label: 'Popup question' },
        options: {
          type: 'array',
          arrayFields: {
            label: { type: 'text' },
            emoji: { type: 'text', label: 'Emoji' },
            image: { type: 'text', label: 'Image URL (https)' },
            id: { type: 'text', label: 'Option id (used by conditions)' },
          },
          defaultItemProps: () => ({ id: newOptionId(), label: 'New option' }),
          getItemSummary: (item) => item.label || 'Option',
        },
      },
      defaultProps: {
        mode: 'single',
        layout: 'list',
        options: [
          { id: 'option_a', label: 'Option A' },
          { id: 'option_b', label: 'Option B' },
        ],
      },
      render: framed('OptionList', OptionListBlock),
    },
    EmailInput: {
      label: 'Email Form',
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
        consentLabel: { type: 'textarea', label: 'Marketing consent label (empty hides it)' },
      },
      defaultProps: {
        label: 'Email address',
        placeholder: 'you@example.com',
        required: true,
        consentLabel: '',
      },
      render: framed('EmailInput', EmailInputBlock),
    },
    PriceCard: {
      label: 'Price Card',
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
      render: framed('PriceCard', PriceCardBlock),
    },
    CheckoutBlock: {
      label: 'Checkout',
      fields: {
        source: {
          type: 'radio',
          label: 'Plan',
          options: [
            { label: 'Fixed plan', value: 'fixed' },
            { label: 'Picked on the paywall', value: 'picker' },
          ],
        },
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
      defaultProps: { planKey: '', source: 'fixed' },
      render: framed('CheckoutBlock', CheckoutBlockView),
    },
    PaymentPlaceholder: {
      label: 'Checkout (legacy placeholder)',
      fields: {},
      defaultProps: {},
      render: framed('PaymentPlaceholder', CheckoutBlockView),
    },
    ResultSummary: {
      label: 'Result Summary',
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
      render: framed('ResultSummary', ResultSummaryBlock),
    },
  },
};

export const SKIP_SCREEN_TYPES: ReadonlySet<ScreenType> = new Set<ScreenType>([
  'paywall',
  'checkout',
  'upsell',
]);

export function allowedComponentsForScreenType(type: ScreenType): readonly string[] {
  return allowedTypesFor(type);
}

export function configForScreenType(type: ScreenType): Config {
  const allowed = new Set<string>(allowedTypesFor(type));
  const components = Object.fromEntries(
    Object.entries(puckConfig.components).filter(([name]) => allowed.has(name)),
  );
  return { ...puckConfig, components };
}
