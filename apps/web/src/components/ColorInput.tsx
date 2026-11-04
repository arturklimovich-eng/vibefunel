'use client';

import { startTransition, useEffect, useLayoutEffect, useRef, useState } from 'react';
import type { InputHTMLAttributes } from 'react';

const COMMIT_EVERY_MS = 80;

type Props = Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'value' | 'onChange'> & {
  value: string;
  onCommit: (value: string) => void;
};

export function ColorInput({ value, onCommit, ...rest }: Props) {
  const [live, setLive] = useState<string | null>(null);
  const commitRef = useRef(onCommit);
  const pendingRef = useRef<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useLayoutEffect(() => {
    commitRef.current = onCommit;
  });

  useEffect(
    () => () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (pendingRef.current !== null) commitRef.current(pendingRef.current);
    },
    [],
  );

  const tick = () => {
    const next = pendingRef.current;
    if (next === null) {
      timerRef.current = null;
      setLive(null);
      return;
    }
    pendingRef.current = null;
    startTransition(() => commitRef.current(next));
    timerRef.current = setTimeout(tick, COMMIT_EVERY_MS);
  };

  return (
    <input
      {...rest}
      type="color"
      value={live ?? value}
      onChange={(e) => {
        const next = e.target.value;
        setLive(next);
        pendingRef.current = next;
        if (timerRef.current === null) tick();
      }}
    />
  );
}
