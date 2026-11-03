'use client';

import type { CSSProperties, ReactNode } from 'react';
import type { Config } from '@puckeditor/core';
import type { z } from 'zod';
import { boxStyle, textStyle } from '@/lib/styles';
import type { ElementStyle } from '@/lib/styles';

export type Components = Config['components'];

export type SlotRender = (props?: {
  className?: string;
  style?: CSSProperties;
  minEmptyHeight?: number;
}) => ReactNode;

export function slotOf(value: unknown): SlotRender | null {
  return typeof value === 'function' ? (value as SlotRender) : null;
}

export function parse<T extends z.ZodType>(schema: T, props: unknown): z.infer<T> | null {
  const parsed = schema.safeParse(props);
  return parsed.success ? parsed.data : null;
}

export function boxCss(style: ElementStyle): CSSProperties {
  return { ...boxStyle({ ...style, width: undefined }), ...textStyle(style) };
}

export function isHttps(value: string): boolean {
  try {
    return new URL(value).protocol === 'https:';
  } catch {
    return false;
  }
}

export const text = (label?: string) => ({ type: 'text' as const, ...(label ? { label } : {}) });
export const textarea = (label?: string) => ({
  type: 'textarea' as const,
  ...(label ? { label } : {}),
});
export const number = (label: string, min?: number, max?: number) => ({
  type: 'number' as const,
  label,
  ...(min !== undefined ? { min } : {}),
  ...(max !== undefined ? { max } : {}),
});
export function radio<T extends string | boolean>(label: string, options: [T, string][]) {
  return {
    type: 'radio' as const,
    label,
    options: options.map(([value, l]) => ({ value, label: l })),
  };
}
export function select<T extends string>(label: string, options: [T, string][]) {
  return {
    type: 'select' as const,
    label,
    options: options.map(([value, l]) => ({ value, label: l })),
  };
}

export const Stars = ({ value, size = 16 }: { value: number; size?: number }) => (
  <span aria-label={`${value} out of 5`} role="img" style={{ display: 'inline-flex', gap: 2 }}>
    {[1, 2, 3, 4, 5].map((i) => (
      <svg key={i} width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
        <path
          d="M12 2.8l2.8 5.9 6.4.8-4.7 4.4 1.2 6.4L12 17.2l-5.7 3.1 1.2-6.4-4.7-4.4 6.4-.8z"
          fill={i <= Math.round(value) ? '#f5b301' : 'none'}
          stroke="#f5b301"
          strokeWidth="1.5"
        />
      </svg>
    ))}
  </span>
);
