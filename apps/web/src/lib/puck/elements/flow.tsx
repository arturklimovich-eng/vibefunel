'use client';

import { imageField } from '../image-field';
import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import { z } from 'zod';
import { textStyle } from '@/lib/styles';
import { blockKey, framed, isEditingRender } from '../frame';
import type { BlockProps } from '../frame';
import { useRuntime } from '../runtime-context';
import { Stars, boxCss, isHttps, number, parse, radio, text, textarea } from './shared';
import type { Components } from './shared';
import styles from './elements.module.css';

function useProgress(seconds: number, active: boolean, onDone: () => void): number {
  const [progress, setProgress] = useState(0);
  const done = useRef(onDone);
  useEffect(() => {
    done.current = onDone;
  });
  useEffect(() => {
    if (!active) return;
    let frame = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / Math.max(200, seconds * 1000));
      setProgress(t);
      if (t < 1) frame = requestAnimationFrame(tick);
      else done.current();
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [seconds, active]);
  return progress;
}

function useAutoNext(props: BlockProps, enabled: boolean) {
  const runtime = useRuntime();
  const live = !isEditingRender(props) && runtime.screenId !== null;
  const fired = useRef(false);
  return {
    live,
    finish: () => {
      if (!live || !enabled || fired.current) return;
      fired.current = true;
      runtime.next();
    },
  };
}

const loaderProps = z.object({
  variant: z.enum(['bar', 'circle']).default('bar'),
  title: z.string().default('Creating your plan'),
  steps: z.array(z.object({ text: z.string() })).default([]),
  seconds: z.number().min(1).max(60).default(5),
  autoNext: z.boolean().default(true),
});

function Loader(props: BlockProps) {
  const p = parse(loaderProps, props);
  const auto = useAutoNext(props, p?.autoNext ?? false);
  const progress = useProgress(p?.seconds ?? 5, auto.live, auto.finish);
  if (!p) return null;
  const shown = auto.live ? progress : 0.62;
  const stepIndex = Math.min(p.steps.length - 1, Math.floor(shown * p.steps.length));
  const accent = props.blockStyle.accentColor ?? 'var(--funnel-primary, #4f46e5)';
  const step =
    p.steps.length > 0 && stepIndex >= 0 ? (
      <p className={styles.loaderStep} aria-live="polite">
        {p.steps[stepIndex]?.text}
      </p>
    ) : null;
  if (p.variant === 'circle') {
    const r = 52;
    const c = 2 * Math.PI * r;
    return (
      <div className={styles.loaderCircle} style={boxCss(props.blockStyle)}>
        <svg viewBox="0 0 120 120" role="img" aria-label={`${Math.round(shown * 100)}%`}>
          <circle
            cx="60"
            cy="60"
            r={r}
            fill="none"
            stroke="currentColor"
            strokeOpacity="0.1"
            strokeWidth="8"
          />
          <circle
            cx="60"
            cy="60"
            r={r}
            fill="none"
            stroke={accent}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={c}
            strokeDashoffset={c * (1 - shown)}
            transform="rotate(-90 60 60)"
          />
          <text x="60" y="68" textAnchor="middle" className={styles.loaderCircleValue}>
            {Math.round(shown * 100)}%
          </text>
        </svg>
        {p.title ? <strong>{p.title}</strong> : null}
        {step}
      </div>
    );
  }
  return (
    <div className={styles.loader} style={boxCss(props.blockStyle)}>
      <div className={styles.loaderHead}>
        <span>{p.title}</span>
        <strong>{Math.round(shown * 100)}%</strong>
      </div>
      <div className={styles.loaderTrack}>
        <span style={{ width: `${shown * 100}%`, background: accent }} />
      </div>
      {step}
    </div>
  );
}

const spinnerProps = z.object({
  variant: z.enum(['spinner', 'dots']).default('spinner'),
  text: z.string().default('Analyzing your answers...'),
  seconds: z.number().min(0).max(60).default(3),
  autoNext: z.boolean().default(false),
});

function Spinner(props: BlockProps) {
  const p = parse(spinnerProps, props);
  const auto = useAutoNext(props, p?.autoNext ?? false);
  useProgress(p?.seconds ?? 3, auto.live && (p?.autoNext ?? false), auto.finish);
  if (!p) return null;
  if (p.variant === 'dots') {
    return (
      <p className={styles.loadingText} role="status" style={textStyle(props.blockStyle)}>
        {p.text.replace(/\.+$/, '')}
        <span className={styles.dots} aria-hidden="true">
          <span>.</span>
          <span>.</span>
          <span>.</span>
        </span>
      </p>
    );
  }
  return (
    <div className={styles.spinnerWrap} role="status" style={textStyle(props.blockStyle)}>
      <span
        className={styles.spinner}
        style={{ borderTopColor: props.blockStyle.accentColor ?? 'var(--funnel-primary, #4f46e5)' }}
        aria-hidden="true"
      />
      {p.text ? <span>{p.text}</span> : null}
    </div>
  );
}

const processingProps = z.object({
  variant: z.enum(['checklist', 'bars']).default('checklist'),
  steps: z.array(z.object({ text: z.string() })).default([]),
  seconds: z.number().min(1).max(60).default(6),
  question: z.string().default(''),
  yesLabel: z.string().default('Yes'),
  noLabel: z.string().default('No'),
  autoNext: z.boolean().default(true),
});

function Processing(props: BlockProps) {
  const runtime = useRuntime();
  const p = parse(processingProps, props);
  const auto = useAutoNext(props, p?.autoNext ?? false);
  const key = blockKey(runtime.screenId, props);
  const hasQuestion = (p?.question ?? '') !== '';
  const answered = key !== null && (runtime.values[key] ?? '') !== '';
  const half = (p?.seconds ?? 6) / 2;
  const first = useProgress(half, auto.live, () => undefined);
  const second = useProgress(
    half,
    auto.live && (!hasQuestion || answered) && first >= 1,
    auto.finish,
  );
  if (!p) return null;
  const raw = auto.live ? first / 2 + (first >= 1 ? second / 2 : 0) : 0.5;
  const shown = Math.min(1, raw);
  const paused = auto.live && hasQuestion && !answered && first >= 1;
  const accent = props.blockStyle.accentColor ?? 'var(--funnel-primary, #4f46e5)';
  const n = Math.max(1, p.steps.length);
  const question =
    hasQuestion && (paused || !auto.live) ? (
      <div
        className={auto.live ? styles.processingPopup : styles.processingPopupPreview}
        role="dialog"
        aria-label={p.question}
      >
        {auto.live ? null : <span className={styles.editorTag}>Pops up halfway</span>}
        <p>{p.question}</p>
        <div className={styles.cookieActions}>
          <button
            type="button"
            className={styles.ghostButton}
            onClick={() => key && runtime.setValue(key, 'no')}
          >
            {p.noLabel}
          </button>
          <button
            type="button"
            className={styles.solidButton}
            onClick={() => key && runtime.setValue(key, 'yes')}
          >
            {p.yesLabel}
          </button>
        </div>
      </div>
    ) : null;
  if (p.variant === 'bars') {
    return (
      <div className={styles.processingBars} style={boxCss(props.blockStyle)}>
        {p.steps.map((step, i) => {
          const local = Math.max(0, Math.min(1, shown * n - i));
          return (
            <div key={i} className={styles.barRow}>
              <div className={styles.loaderHead}>
                <span>{step.text}</span>
                <strong>{Math.round(local * 100)}%</strong>
              </div>
              <div className={styles.loaderTrack}>
                <span style={{ width: `${local * 100}%`, background: accent }} />
              </div>
            </div>
          );
        })}
        {question}
      </div>
    );
  }
  const doneCount = Math.floor(shown * p.steps.length + 0.0001);
  return (
    <div>
      <ol className={styles.processing} style={boxCss(props.blockStyle)}>
        {p.steps.map((step, i) => {
          const state = i < doneCount ? 'done' : i === doneCount ? 'active' : 'todo';
          return (
            <li key={i} data-state={state}>
              <span
                className={styles.processingMark}
                style={
                  state === 'done'
                    ? { background: accent, borderColor: accent }
                    : { borderTopColor: accent }
                }
                aria-hidden="true"
              >
                {state === 'done' ? '✓' : ''}
              </span>
              <span>{step.text}</span>
            </li>
          );
        })}
      </ol>
      {question}
    </div>
  );
}

const timerProps = z.object({
  variant: z.enum(['row', 'pill', 'button']).default('row'),
  label: z.string().default('Discount reserved for'),
  minutes: z.number().min(1).max(240).default(10),
  expiredText: z.string().default('Offer expired'),
  buttonLabel: z.string().default('Get my plan'),
});

export function formatCountdown(ms: number): string {
  const total = Math.max(0, Math.ceil(ms / 1000));
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export function useCountdown(id: string, minutes: number, live: boolean): number {
  const runtime = useRuntime();
  const [left, setLeft] = useState(minutes * 60_000);
  useEffect(() => {
    if (!live) return;
    const key = `funnel-timer:${runtime.funnelId}:${id}`;
    let end = Number.NaN;
    try {
      end = Number(window.sessionStorage.getItem(key));
      if (!Number.isFinite(end) || end <= 0) {
        end = Date.now() + minutes * 60_000;
        window.sessionStorage.setItem(key, String(end));
      }
    } catch {
      end = Date.now() + minutes * 60_000;
    }
    const tick = () => setLeft(end - Date.now());
    tick();
    const timer = window.setInterval(tick, 1000);
    return () => window.clearInterval(timer);
  }, [live, minutes, id, runtime.funnelId]);
  return live ? left : minutes * 60_000;
}

function Timer(props: BlockProps) {
  const runtime = useRuntime();
  const p = parse(timerProps, props);
  const live = !isEditingRender(props) && runtime.screenId !== null;
  const id = typeof props.id === 'string' ? props.id : 'timer';
  const left = useCountdown(id, p?.minutes ?? 10, live);
  if (!p) return null;
  const expired = live && left <= 0;
  const value = expired ? null : (
    <strong className={styles.timerValue}>{formatCountdown(left)}</strong>
  );
  if (p.variant === 'pill') {
    return (
      <div className={styles.timerPillWrap} role="timer" aria-live="off">
        <span className={styles.timerPill} style={boxCss(props.blockStyle)}>
          {expired ? p.expiredText : p.label} {value}
        </span>
      </div>
    );
  }
  return (
    <div className={styles.timerBlock} role="timer" aria-live="off">
      <div className={styles.timer} style={boxCss(props.blockStyle)}>
        <span>{expired ? p.expiredText : p.label}</span>
        {value}
      </div>
      {p.variant === 'button' ? (
        <button
          type="button"
          className={styles.solidButton}
          onClick={() => {
            if (live) runtime.next();
          }}
        >
          {p.buttonLabel}
        </button>
      ) : null}
    </div>
  );
}

const reviewsProps = z.object({
  layout: z.enum(['list', 'carousel']).default('list'),
  items: z
    .array(
      z.object({
        name: z.string(),
        text: z.string(),
        rating: z.number().min(0).max(5).default(5),
        avatar: z.string().default(''),
      }),
    )
    .default([]),
});

function Reviews(props: BlockProps) {
  const p = parse(reviewsProps, props);
  if (!p) return null;
  return (
    <div className={styles.reviews} data-layout={p.layout}>
      {p.items.map((item, i) => (
        <article key={i} className={styles.review} style={boxCss(props.blockStyle)}>
          <header className={styles.reviewHead}>
            {isHttps(item.avatar) ? (
              <Image
                className={styles.avatar}
                src={item.avatar}
                alt=""
                width={36}
                height={36}
                unoptimized
              />
            ) : (
              <span className={styles.avatar} aria-hidden="true">
                {item.name.slice(0, 1).toUpperCase()}
              </span>
            )}
            <div>
              <strong>{item.name}</strong>
              <Stars value={item.rating} size={13} />
            </div>
          </header>
          <p>{item.text}</p>
        </article>
      ))}
    </div>
  );
}

const customerProps = z.object({
  items: z
    .array(z.object({ image: z.string(), title: z.string(), caption: z.string().default('') }))
    .default([]),
});

function CustomerCarousel(props: BlockProps) {
  const p = parse(customerProps, props);
  if (!p) return null;
  return (
    <div className={styles.customers}>
      {p.items.map((item, i) => (
        <figure key={i} className={styles.customer} style={boxCss(props.blockStyle)}>
          {isHttps(item.image) ? (
            <Image src={item.image} alt={item.title} width={400} height={300} unoptimized />
          ) : (
            <div className={styles.customerPlaceholder} aria-hidden="true" />
          )}
          <figcaption>
            <strong>{item.title}</strong>
            {item.caption ? <span>{item.caption}</span> : null}
          </figcaption>
        </figure>
      ))}
    </div>
  );
}

const cookieProps = z.object({
  text: z.string().default('We use cookies to measure how this page is used.'),
  acceptLabel: z.string().default('Accept'),
  declineLabel: z.string().default('Decline'),
  policyLabel: z.string().default(''),
  policyUrl: z.string().default(''),
});

function CookieConsent(props: BlockProps) {
  const runtime = useRuntime();
  const p = parse(cookieProps, props);
  const editing = isEditingRender(props);
  if (!p) return null;
  if (!editing && !runtime.consentPending) return null;
  const policy = /^https:\/\//.test(p.policyUrl) ? p.policyUrl : '';
  return (
    <div
      className={styles.cookie}
      style={boxCss(props.blockStyle)}
      role="region"
      aria-label="Cookie consent"
    >
      {editing ? (
        <span className={styles.editorTag}>Shown only until the visitor decides</span>
      ) : null}
      <p>
        {p.text}{' '}
        {policy && p.policyLabel ? (
          <a href={policy} target="_blank" rel="noopener noreferrer">
            {p.policyLabel}
          </a>
        ) : null}
      </p>
      <div className={styles.cookieActions}>
        <button
          type="button"
          className={styles.ghostButton}
          onClick={() => runtime.decideConsent('denied')}
        >
          {p.declineLabel}
        </button>
        <button
          type="button"
          className={styles.solidButton}
          onClick={() => runtime.decideConsent('granted')}
        >
          {p.acceptLabel}
        </button>
      </div>
    </div>
  );
}

const autoNext = radio('When finished', [
  [true, 'Go to the next screen'],
  [false, 'Stay'],
]);

const stepsField = {
  type: 'array' as const,
  arrayFields: { text: text() },
  defaultItemProps: { text: 'Step' },
  getItemSummary: (item: { text?: string }) => item.text || 'Step',
};

export const flowComponents: Components = {
  Loader: {
    label: 'Loader',
    fields: {
      variant: radio('Type', [
        ['bar', 'Bar'],
        ['circle', 'Circular'],
      ]),
      title: text('Title'),
      seconds: number('Duration (seconds)', 1, 60),
      steps: { ...stepsField, label: 'Rotating texts' },
      autoNext,
    },
    defaultProps: {
      variant: 'bar',
      title: 'Creating your plan',
      seconds: 5,
      steps: [
        { text: 'Analyzing your answers' },
        { text: 'Matching your goals' },
        { text: 'Finalizing your plan' },
      ],
      autoNext: true,
    },
    render: framed('Loader', Loader),
  },
  Spinner: {
    label: 'Spinner',
    fields: {
      variant: radio('Type', [
        ['spinner', 'Spinner'],
        ['dots', 'Loading text'],
      ]),
      text: text('Text'),
      seconds: number('Duration (seconds)', 0, 60),
      autoNext,
    },
    defaultProps: {
      variant: 'spinner',
      text: 'Analyzing your answers...',
      seconds: 3,
      autoNext: false,
    },
    render: framed('Spinner', Spinner),
  },
  Processing: {
    label: 'Processing',
    fields: {
      variant: radio('Type', [
        ['checklist', 'Checklist'],
        ['bars', 'Bars (loader set)'],
      ]),
      steps: { ...stepsField, label: 'Steps' },
      seconds: number('Duration (seconds)', 1, 60),
      question: text('Popup question halfway (empty = none)'),
      yesLabel: text('Yes label'),
      noLabel: text('No label'),
      autoNext,
    },
    defaultProps: {
      variant: 'checklist',
      question: '',
      yesLabel: 'Yes',
      noLabel: 'No',
      steps: [
        { text: 'Calculating your metabolism' },
        { text: 'Selecting meals you will love' },
        { text: 'Building your weekly schedule' },
      ],
      seconds: 6,
      autoNext: true,
    },
    render: framed('Processing', Processing),
  },
  Timer: {
    label: 'Timer',
    fields: {
      variant: radio('Type', [
        ['row', 'Row'],
        ['pill', 'Limited offer pill'],
        ['button', 'With button'],
      ]),
      label: text('Label'),
      minutes: number('Minutes', 1, 240),
      expiredText: text('Text after it ends'),
      buttonLabel: text('Button label'),
    },
    defaultProps: {
      variant: 'row',
      label: 'Discount reserved for',
      minutes: 10,
      expiredText: 'Offer expired',
      buttonLabel: 'Get my plan',
    },
    render: framed('Timer', Timer),
  },
  Reviews: {
    label: 'Reviews',
    fields: {
      layout: radio('Layout', [
        ['list', 'List'],
        ['carousel', 'Carousel'],
      ]),
      items: {
        type: 'array',
        arrayFields: {
          name: text('Name'),
          rating: number('Rating (0-5)', 0, 5),
          text: textarea('Review'),
          avatar: imageField('Avatar', '1:1'),
        },
        defaultItemProps: { name: 'Alex', rating: 5, text: 'Loved it!', avatar: '' },
        getItemSummary: (item) => item.name || 'Review',
      },
    },
    defaultProps: {
      layout: 'list',
      items: [
        {
          name: 'Emma',
          rating: 5,
          text: 'Down 6 kg in two months without feeling hungry.',
          avatar: '',
        },
        {
          name: 'James',
          rating: 5,
          text: 'The daily plan finally made it stick for me.',
          avatar: '',
        },
      ],
    },
    render: framed('Reviews', Reviews),
  },
  CustomerCarousel: {
    label: 'Customer Carousel',
    fields: {
      items: {
        type: 'array',
        arrayFields: {
          image: imageField('Image', '1:1'),
          title: text('Title'),
          caption: text('Caption'),
        },
        defaultItemProps: { image: '', title: 'Customer', caption: '' },
        getItemSummary: (item) => item.title || 'Customer',
      },
    },
    defaultProps: {
      items: [
        { image: '', title: 'Sarah, 34', caption: '-8 kg in 10 weeks' },
        { image: '', title: 'Mike, 41', caption: '-12 kg in 4 months' },
      ],
    },
    render: framed('CustomerCarousel', CustomerCarousel),
  },
  CookieConsent: {
    label: 'Cookie Consent',
    fields: {
      text: textarea('Text'),
      acceptLabel: text('Accept label'),
      declineLabel: text('Decline label'),
      policyLabel: text('Policy link text'),
      policyUrl: text('Policy URL (https)'),
    },
    defaultProps: {
      text: 'We use cookies to measure how this page is used.',
      acceptLabel: 'Accept',
      declineLabel: 'Decline',
      policyLabel: 'Privacy policy',
      policyUrl: '',
    },
    render: framed('CookieConsent', CookieConsent),
  },
};
