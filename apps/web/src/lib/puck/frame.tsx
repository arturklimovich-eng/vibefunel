'use client';

import type { ComponentType, ReactNode } from 'react';
import {
  containerStyle,
  isItemShown,
  readElementMeta,
  readElementStyle,
  resolveStyle,
} from '@/lib/styles';
import type { ElementStyle } from '@/lib/styles';
import { useRuntime } from './runtime-context';
import { useFunnelTheme } from './theme-context';
import styles from './blocks.module.css';

export type BlockProps = Record<string, unknown> & { blockStyle: ElementStyle };

export const SLOT_CLASS = 'funnel-slot';

export function isEditingRender(props: Record<string, unknown>): boolean {
  const puck = props.puck;
  return (
    typeof puck === 'object' && puck !== null && 'isEditing' in puck && puck.isEditing === true
  );
}

export function blockKey(screenId: string | null, props: Record<string, unknown>): string | null {
  return screenId !== null && typeof props.id === 'string' ? `${screenId}:${props.id}` : null;
}

function Frame({
  type,
  props,
  style,
  children,
}: {
  type: string;
  props: Record<string, unknown>;
  style: ElementStyle;
  children: ReactNode;
}) {
  const runtime = useRuntime();
  const meta = readElementMeta(props);
  const editing = isEditingRender(props);
  const id = typeof props.id === 'string' ? props.id : null;
  const visible = isItemShown(props, runtime.answers, runtime.toggles);
  if (!visible && !editing) return null;
  const animation = meta.animation && meta.animation !== 'off' ? meta.animation : undefined;
  const position = style.position ?? 'content';
  return (
    <div
      className={styles.frame}
      data-kind={type}
      data-element-id={id ?? undefined}
      data-animation={animation}
      data-position={position === 'content' ? undefined : position}
      data-effect={style.effect && style.effect !== 'none' ? style.effect : undefined}
      data-hidden={visible ? undefined : 'true'}
      style={containerStyle(style, readElementStyle(props))}
    >
      {children}
    </div>
  );
}

export function framed(type: string, Inner: ComponentType<BlockProps>) {
  function FramedBlock(props: Record<string, unknown>) {
    const theme = useFunnelTheme();
    const style = resolveStyle(type, props, theme);
    return (
      <Frame type={type} props={props} style={style}>
        <Inner {...props} blockStyle={style} />
      </Frame>
    );
  }
  return FramedBlock;
}
