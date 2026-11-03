'use client';

import { useEffect, useState } from 'react';
import { z } from 'zod';
import { SLOT_CHILDREN } from '../catalog';
import { SLOT_CLASS, framed, isEditingRender } from '../frame';
import type { BlockProps } from '../frame';
import { useRuntime } from '../runtime-context';
import { boxCss, number, parse, radio, slotOf, text } from './shared';
import type { Components } from './shared';
import styles from './elements.module.css';

const slot = { type: 'slot' as const, allow: SLOT_CHILDREN };

const columnsProps = z.object({
  count: z.enum(['2', '3']).default('2'),
  gap: z.number().min(0).max(64).default(12),
  align: z.enum(['start', 'center', 'end']).default('start'),
});

function Columns(props: BlockProps) {
  const p = parse(columnsProps, props);
  if (!p) return null;
  const cols = p.count === '3' ? [props.col1, props.col2, props.col3] : [props.col1, props.col2];
  return (
    <div
      className={styles.columns}
      style={{
        ...boxCss(props.blockStyle),
        gap: p.gap,
        gridTemplateColumns: `repeat(${cols.length}, minmax(0, 1fr))`,
        alignItems: p.align,
      }}
    >
      {cols.map((value, i) => {
        const Slot = slotOf(value);
        return Slot ? (
          <Slot key={i} className={`${styles.slot} ${SLOT_CLASS}`} minEmptyHeight={48} />
        ) : null;
      })}
    </div>
  );
}

const rowsProps = z.object({ gap: z.number().min(0).max(64).default(8) });

function Rows(props: BlockProps) {
  const p = parse(rowsProps, props);
  const Slot = slotOf(props.items);
  if (!p || !Slot) return null;
  return (
    <div className={styles.rows} style={boxCss(props.blockStyle)}>
      <Slot className={`${styles.slot} ${SLOT_CLASS}`} style={{ gap: p.gap }} minEmptyHeight={48} />
    </div>
  );
}

const carouselProps = z.object({
  slideWidth: z.number().min(40).max(100).default(85),
  gap: z.number().min(0).max(48).default(12),
});

function Carousel(props: BlockProps) {
  const p = parse(carouselProps, props);
  const Slot = slotOf(props.slides);
  if (!p || !Slot) return null;
  return (
    <div className={styles.carousel} style={boxCss(props.blockStyle)}>
      <Slot
        className={`${styles.carouselTrack} ${SLOT_CLASS}`}
        style={{ gap: p.gap, ['--slide-w' as string]: `${p.slideWidth}%` }}
        minEmptyHeight={64}
      />
    </div>
  );
}

const popupProps = z.object({
  trigger: z.enum(['button', 'delay']).default('button'),
  buttonLabel: z.string().default('Learn more'),
  delay: z.number().min(0).max(120).default(3),
  title: z.string().default(''),
  closeLabel: z.string().default('Close'),
});

function Popup(props: BlockProps) {
  const runtime = useRuntime();
  const p = parse(popupProps, props);
  const editing = isEditingRender(props);
  const [open, setOpen] = useState(false);
  const delayed = p?.trigger === 'delay' && !editing && runtime.screenId !== null;
  const delay = p?.delay ?? 0;
  useEffect(() => {
    if (!delayed) return;
    const timer = window.setTimeout(() => setOpen(true), delay * 1000);
    return () => window.clearTimeout(timer);
  }, [delayed, delay]);
  const Slot = slotOf(props.content);
  if (!p || !Slot) return null;
  const card = (
    <div className={styles.popupCard} style={boxCss(props.blockStyle)}>
      {p.title ? <h2 className={styles.popupTitle}>{p.title}</h2> : null}
      <Slot className={`${styles.slot} ${SLOT_CLASS}`} minEmptyHeight={64} />
      {editing ? null : (
        <button type="button" className={styles.popupClose} onClick={() => setOpen(false)}>
          {p.closeLabel}
        </button>
      )}
    </div>
  );
  if (editing) {
    return (
      <div className={styles.popupPreview}>
        <span className={styles.editorTag}>
          Popup ·{' '}
          {p.trigger === 'button' ? `opens from "${p.buttonLabel}"` : `opens after ${p.delay}s`}
        </span>
        {card}
      </div>
    );
  }
  return (
    <>
      {p.trigger === 'button' ? (
        <button type="button" className={styles.linkButton} onClick={() => setOpen(true)}>
          {p.buttonLabel}
        </button>
      ) : null}
      {open ? (
        <div
          className={styles.popupOverlay}
          role="dialog"
          aria-modal="true"
          aria-label={p.title || 'Popup'}
          onClick={(e) => {
            if (e.target === e.currentTarget) setOpen(false);
          }}
        >
          {card}
        </div>
      ) : null}
    </>
  );
}

export const layoutComponents: Components = {
  Columns: {
    label: 'Columns',
    fields: {
      count: radio('Columns', [
        ['2', '2'],
        ['3', '3'],
      ]),
      gap: number('Gap (px)', 0, 64),
      align: radio('Vertical align', [
        ['start', 'Top'],
        ['center', 'Center'],
        ['end', 'Bottom'],
      ]),
      col1: slot,
      col2: slot,
      col3: slot,
    },
    defaultProps: { count: '2', gap: 12, align: 'start', col1: [], col2: [], col3: [] },
    render: framed('Columns', Columns),
  },
  Rows: {
    label: 'Rows',
    fields: { gap: number('Gap (px)', 0, 64), items: slot },
    defaultProps: { gap: 8, items: [] },
    render: framed('Rows', Rows),
  },
  Carousel: {
    label: 'Carousel',
    fields: {
      slideWidth: number('Slide width (%)', 40, 100),
      gap: number('Gap (px)', 0, 48),
      slides: slot,
    },
    defaultProps: { slideWidth: 85, gap: 12, slides: [] },
    render: framed('Carousel', Carousel),
  },
  Popup: {
    label: 'Popup',
    fields: {
      trigger: radio('Opens', [
        ['button', 'From a button'],
        ['delay', 'After a delay'],
      ]),
      buttonLabel: text('Button label'),
      delay: number('Delay (seconds)', 0, 120),
      title: text('Title'),
      closeLabel: text('Close label'),
      content: slot,
    },
    defaultProps: {
      trigger: 'button',
      buttonLabel: 'Learn more',
      delay: 3,
      title: 'Did you know?',
      closeLabel: 'Close',
      content: [],
    },
    render: framed('Popup', Popup),
  },
};
