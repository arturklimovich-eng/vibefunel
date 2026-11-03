'use client';

import { useEffect, useRef, useState } from 'react';
import { z } from 'zod';
import { textStyle } from '@/lib/styles';
import { framed, isEditingRender } from '../frame';
import type { BlockProps } from '../frame';
import { boxCss, isHttps, number, parse, radio, select, text, textarea } from './shared';
import type { Components } from './shared';
import styles from './elements.module.css';

const listProps = z.object({
  marker: z.enum(['bullet', 'number', 'check', 'cross', 'emoji']).default('check'),
  emoji: z.string().max(8).default('✨'),
  items: z.array(z.object({ text: z.string() })).default([]),
});

const MARKERS: Record<string, string> = { bullet: '•', check: '✓', cross: '✕' };

function List(props: BlockProps) {
  const p = parse(listProps, props);
  if (!p) return null;
  const Tag = p.marker === 'number' ? 'ol' : 'ul';
  return (
    <Tag className={styles.list} data-marker={p.marker} style={textStyle(props.blockStyle)}>
      {p.items.map((item, i) => (
        <li key={i}>
          <span className={styles.listMarker} aria-hidden="true">
            {p.marker === 'number'
              ? `${i + 1}.`
              : p.marker === 'emoji'
                ? p.emoji
                : MARKERS[p.marker]}
          </span>
          <span>{item.text}</span>
        </li>
      ))}
    </Tag>
  );
}

const faqProps = z.object({
  items: z.array(z.object({ question: z.string(), answer: z.string() })).default([]),
  openFirst: z.boolean().default(false),
});

function Faq(props: BlockProps) {
  const p = parse(faqProps, props);
  if (!p) return null;
  return (
    <div className={styles.faq} style={boxCss(props.blockStyle)}>
      {p.items.map((item, i) => (
        <details key={i} className={styles.faqItem} open={p.openFirst && i === 0}>
          <summary>{item.question}</summary>
          <p>{item.answer}</p>
        </details>
      ))}
    </div>
  );
}

const dividerProps = z.object({
  variant: z.enum(['line', 'space']).default('line'),
  thickness: z.number().min(1).max(12).default(1),
  color: z.string().max(40).default(''),
  space: z.number().min(0).max(120).default(16),
});

function Divider(props: BlockProps) {
  const p = parse(dividerProps, props);
  if (!p) return null;
  if (p.variant === 'space') return <div aria-hidden="true" style={{ height: p.space }} />;
  return (
    <hr
      className={styles.divider}
      style={{
        borderTopWidth: p.thickness,
        borderTopColor: p.color || undefined,
        marginBlock: p.space / 2,
      }}
    />
  );
}

const rawHtmlProps = z.object({
  html: z.string().default(''),
  height: z.number().min(20).max(2000).default(160),
});

function RawHtml(props: BlockProps) {
  const p = parse(rawHtmlProps, props);
  if (!p) return null;
  const doc = `<!doctype html><html><head><meta charset="utf-8"><style>html,body{margin:0;font-family:system-ui,sans-serif;}</style></head><body>${p.html}</body></html>`;
  return (
    <iframe
      className={styles.rawHtml}
      title="Custom content"
      sandbox=""
      srcDoc={doc}
      style={{ height: p.height }}
    />
  );
}

const videoProps = z.object({
  src: z.string().default(''),
  poster: z.string().default(''),
  autoplay: z.boolean().default(true),
  controls: z.boolean().default(false),
  loop: z.boolean().default(true),
});

function Video(props: BlockProps) {
  const p = parse(videoProps, props);
  if (!p) return null;
  if (!isHttps(p.src)) return <p className={styles.placeholder}>Video needs an https:// URL.</p>;
  const { radius, width } = props.blockStyle;
  return (
    <video
      className={styles.video}
      src={p.src}
      poster={isHttps(p.poster) ? p.poster : undefined}
      autoPlay={p.autoplay}
      muted={p.autoplay}
      loop={p.loop}
      controls={p.controls}
      playsInline
      style={{
        borderRadius: radius,
        width: width === undefined ? undefined : `${width}%`,
        marginInline: width === undefined ? undefined : 'auto',
      }}
    />
  );
}

const lottieProps = z.object({
  src: z.string().default(''),
  loop: z.boolean().default(true),
  height: z.number().min(40).max(800).default(220),
});

function Lottie(props: BlockProps) {
  const p = parse(lottieProps, props);
  const host = useRef<HTMLDivElement>(null);
  const src = p?.src ?? '';
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const failed = failedSrc === src;
  const loop = p?.loop ?? true;
  useEffect(() => {
    const el = host.current;
    if (!el || !isHttps(src)) return;
    let cancelled = false;
    let destroy: (() => void) | null = null;
    const load = async () => {
      try {
        const [lib, res] = await Promise.all([
          import('lottie-web/build/player/lottie_light'),
          fetch(src),
        ]);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const animationData: unknown = await res.json();
        if (cancelled) return;
        const anim = lib.default.loadAnimation({
          container: el,
          renderer: 'svg',
          loop,
          autoplay: true,
          animationData,
        });
        destroy = () => anim.destroy();
      } catch (error) {
        console.warn('Lottie failed to load:', error instanceof Error ? error.message : error);
        if (!cancelled) setFailedSrc(src);
      }
    };
    void load();
    return () => {
      cancelled = true;
      destroy?.();
    };
  }, [src, loop]);
  if (!p) return null;
  if (!isHttps(p.src)) {
    return <p className={styles.placeholder}>Lottie needs an https:// link to a JSON file.</p>;
  }
  if (failed) return <p className={styles.placeholder}>The Lottie file could not be loaded.</p>;
  return (
    <div
      ref={host}
      className={styles.lottie}
      style={{
        height: p.height,
        width: props.blockStyle.width ? `${props.blockStyle.width}%` : undefined,
      }}
      aria-hidden="true"
    />
  );
}

const chartProps = z.object({
  variant: z.enum(['line', 'bars']).default('line'),
  title: z.string().default(''),
  unit: z.string().max(12).default(''),
  color: z.string().max(40).default(''),
  points: z.array(z.object({ label: z.string(), value: z.number() })).default([]),
});

function Chart(props: BlockProps) {
  const p = parse(chartProps, props);
  if (!p) return null;
  const points = p.points.slice(0, 12);
  if (points.length < 2) return <p className={styles.placeholder}>Add at least two points.</p>;
  const W = 320;
  const H = 160;
  const pad = 24;
  const values = points.map((pt) => pt.value);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || 1;
  const x = (i: number) => pad + (i * (W - pad * 2)) / (points.length - 1);
  const y = (v: number) => H - pad - ((v - min) / span) * (H - pad * 2.2);
  const color = p.color || 'var(--funnel-primary, #4f46e5)';
  const last = points[points.length - 1];
  const path = points
    .map((pt, i) => {
      if (i === 0) return `M ${x(0)} ${y(pt.value)}`;
      const prev = points[i - 1];
      if (!prev) return '';
      const cx = (x(i - 1) + x(i)) / 2;
      return `C ${cx} ${y(prev.value)}, ${cx} ${y(pt.value)}, ${x(i)} ${y(pt.value)}`;
    })
    .join(' ');
  return (
    <figure className={styles.chart} style={boxCss(props.blockStyle)}>
      {p.title ? <figcaption className={styles.chartTitle}>{p.title}</figcaption> : null}
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={p.title || 'Chart'}>
        {p.variant === 'line' ? (
          <>
            <path
              d={`${path} L ${x(points.length - 1)} ${H - pad} L ${x(0)} ${H - pad} Z`}
              fill={color}
              opacity="0.12"
            />
            <path d={path} fill="none" stroke={color} strokeWidth="3" strokeLinecap="round" />
            {points.map((pt, i) => (
              <circle
                key={i}
                cx={x(i)}
                cy={y(pt.value)}
                r={i === points.length - 1 ? 5 : 3}
                fill={color}
              />
            ))}
            {last ? (
              <text
                x={x(points.length - 1)}
                y={y(last.value) - 10}
                textAnchor="end"
                className={styles.chartValue}
              >
                {last.value}
                {p.unit}
              </text>
            ) : null}
          </>
        ) : (
          points.map((pt, i) => {
            const bw = ((W - pad * 2) / points.length) * 0.6;
            const bx = pad + (i * (W - pad * 2)) / points.length + bw / 3;
            const by = y(pt.value);
            return (
              <g key={i}>
                <rect
                  x={bx}
                  y={by}
                  width={bw}
                  height={H - pad - by}
                  rx="4"
                  fill={color}
                  opacity={i === points.length - 1 ? 1 : 0.45}
                />
                <text x={bx + bw / 2} y={by - 4} textAnchor="middle" className={styles.chartValue}>
                  {pt.value}
                  {p.unit}
                </text>
              </g>
            );
          })
        )}
        {points.map((pt, i) => (
          <text
            key={`l${i}`}
            x={p.variant === 'line' ? x(i) : pad + (i + 0.5) * ((W - pad * 2) / points.length)}
            y={H - 6}
            textAnchor="middle"
            className={styles.chartLabel}
          >
            {pt.label}
          </text>
        ))}
      </svg>
    </figure>
  );
}

const badgeProps = z.object({
  text: z.string().default('Most popular'),
  align: z.enum(['left', 'center', 'right']).default('center'),
});

function Badge(props: BlockProps) {
  const p = parse(badgeProps, props);
  if (!p) return null;
  return (
    <div style={{ textAlign: p.align }}>
      <span className={styles.badge} style={boxCss(props.blockStyle)}>
        {p.text}
      </span>
    </div>
  );
}

function editorOnly(props: BlockProps, note: string) {
  return isEditingRender(props) ? <span className={styles.editorTag}>{note}</span> : null;
}

export const contentComponents: Components = {
  List: {
    label: 'List',
    fields: {
      marker: select('Marker', [
        ['check', 'Check'],
        ['bullet', 'Bullet'],
        ['number', 'Number'],
        ['cross', 'Cross'],
        ['emoji', 'Emoji'],
      ]),
      emoji: text('Emoji'),
      items: {
        type: 'array',
        arrayFields: { text: text() },
        defaultItemProps: { text: 'List item' },
        getItemSummary: (item) => item.text || 'Item',
      },
    },
    defaultProps: {
      marker: 'check',
      emoji: '✨',
      items: [{ text: 'Personal plan' }, { text: 'Daily guidance' }, { text: 'Cancel anytime' }],
    },
    render: framed('List', List),
  },
  Faq: {
    label: 'FAQ',
    fields: {
      items: {
        type: 'array',
        arrayFields: { question: text('Question'), answer: textarea('Answer') },
        defaultItemProps: { question: 'Question?', answer: 'Answer.' },
        getItemSummary: (item) => item.question || 'Question',
      },
      openFirst: radio('First item', [
        [false, 'Collapsed'],
        [true, 'Open'],
      ]),
    },
    defaultProps: {
      items: [
        {
          question: 'Can I cancel anytime?',
          answer: 'Yes, cancel in one click from your account.',
        },
        { question: 'When will I see results?', answer: 'Most people notice a change in 2 weeks.' },
      ],
      openFirst: false,
    },
    render: framed('Faq', Faq),
  },
  Divider: {
    label: 'Divider',
    fields: {
      variant: radio('Type', [
        ['line', 'Line'],
        ['space', 'Space'],
      ]),
      thickness: number('Thickness (px)', 1, 12),
      color: text('Color (hex, empty = text color)'),
      space: number('Space (px)', 0, 120),
    },
    defaultProps: { variant: 'line', thickness: 1, color: '', space: 16 },
    render: framed('Divider', Divider),
  },
  RawHtml: {
    label: 'Raw HTML',
    fields: {
      html: textarea('HTML (scripts do not run)'),
      height: number('Height (px)', 20, 2000),
    },
    defaultProps: { html: '<p style="text-align:center">Custom HTML</p>', height: 120 },
    render: framed('RawHtml', (props: BlockProps) => (
      <>
        {editorOnly(props, 'Sandboxed: no scripts, forms or links that open the page')}
        <RawHtml {...props} />
      </>
    )),
  },
  Video: {
    label: 'Video',
    fields: {
      src: text('Video URL (https, mp4 or webm)'),
      poster: text('Poster image URL'),
      autoplay: radio('Autoplay (muted)', [
        [true, 'On'],
        [false, 'Off'],
      ]),
      controls: radio('Controls', [
        [false, 'Hidden'],
        [true, 'Shown'],
      ]),
      loop: radio('Loop', [
        [true, 'On'],
        [false, 'Off'],
      ]),
    },
    defaultProps: { src: '', poster: '', autoplay: true, controls: false, loop: true },
    render: framed('Video', Video),
  },
  Lottie: {
    label: 'Lottie',
    fields: {
      src: text('Lottie JSON URL (https)'),
      loop: radio('Loop', [
        [true, 'On'],
        [false, 'Off'],
      ]),
      height: number('Height (px)', 40, 800),
    },
    defaultProps: { src: '', loop: true, height: 220 },
    render: framed('Lottie', Lottie),
  },
  Chart: {
    label: 'Chart',
    fields: {
      variant: radio('Type', [
        ['line', 'Line'],
        ['bars', 'Bars'],
      ]),
      title: text('Title'),
      unit: text('Unit'),
      color: text('Color (hex, empty = primary)'),
      points: {
        type: 'array',
        arrayFields: { label: text('Label'), value: number('Value') },
        defaultItemProps: { label: 'Week', value: 0 },
        getItemSummary: (item) => `${item.label}: ${item.value}`,
      },
    },
    defaultProps: {
      variant: 'line',
      title: 'Your projected progress',
      unit: ' kg',
      color: '',
      points: [
        { label: 'Now', value: 82 },
        { label: 'Week 2', value: 80 },
        { label: 'Week 4', value: 77 },
        { label: 'Week 8', value: 73 },
      ],
    },
    render: framed('Chart', Chart),
  },
  Badge: {
    label: 'Badge',
    fields: {
      text: text('Text'),
      align: radio('Align', [
        ['left', 'Left'],
        ['center', 'Center'],
        ['right', 'Right'],
      ]),
    },
    defaultProps: { text: 'Most popular', align: 'center' },
    render: framed('Badge', Badge),
  },
};
