'use client';

import type { ReactNode } from 'react';
import { z } from 'zod';
import { textStyle } from '@/lib/styles';
import { framed } from '../frame';
import type { BlockProps } from '../frame';
import { parse, radio, textarea } from './shared';
import type { Components } from './shared';
import styles from '../blocks.module.css';

export const textProps = z.object({
  text: z.string().default(''),
  variant: z.enum(['title', 'subtitle', 'paragraph']).default('paragraph'),
});

const TOKEN = /\*\*([^*]+)\*\*|\*([^*]+)\*|\[([^\]]+)\]\((https:\/\/[^\s)]+)\)/g;

export function renderInline(text: string): ReactNode[] {
  const out: ReactNode[] = [];
  let last = 0;
  let key = 0;
  for (const m of text.matchAll(TOKEN)) {
    const index = m.index ?? 0;
    if (index > last) out.push(text.slice(last, index));
    if (m[1] !== undefined) out.push(<strong key={key++}>{m[1]}</strong>);
    else if (m[2] !== undefined) out.push(<em key={key++}>{m[2]}</em>);
    else if (m[3] !== undefined && m[4] !== undefined) {
      out.push(
        <a key={key++} href={m[4]} target="_blank" rel="noopener noreferrer">
          {m[3]}
        </a>,
      );
    }
    last = index + m[0].length;
  }
  if (last < text.length) out.push(text.slice(last));
  return out;
}

function Text(props: BlockProps) {
  const p = parse(textProps, props);
  if (!p) return null;
  const style = textStyle(props.blockStyle);
  const content = renderInline(p.text);
  if (p.variant === 'title') {
    return (
      <h1 className={styles.heading} style={style}>
        {content}
      </h1>
    );
  }
  if (p.variant === 'subtitle') {
    return (
      <h2 className={styles.heading} style={style}>
        {content}
      </h2>
    );
  }
  return (
    <p className={styles.paragraph} style={style}>
      {content}
    </p>
  );
}

export const textComponents: Components = {
  Text: {
    label: 'Text',
    fields: {
      variant: radio('Type', [
        ['title', 'Title'],
        ['subtitle', 'Subtitle'],
        ['paragraph', 'Paragraph'],
      ]),
      text: textarea('Text · **bold**  *italic*  [link](https://…)'),
    },
    defaultProps: { variant: 'paragraph', text: 'Some text' },
    render: framed('Text', Text),
  },
};
