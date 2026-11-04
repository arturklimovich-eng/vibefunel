'use client';

import { useCallback, useEffect, useTransition } from 'react';
import type { ComponentProps } from 'react';
import Link, { useLinkStatus } from 'next/link';
import { useRouter } from 'next/navigation';

let pendingCount = 0;

function syncAttribute() {
  document.documentElement.toggleAttribute('data-nav-pending', pendingCount > 0);
}

function useMarkPending(pending: boolean) {
  useEffect(() => {
    if (!pending) return;
    pendingCount += 1;
    syncAttribute();
    return () => {
      pendingCount -= 1;
      syncAttribute();
    };
  }, [pending]);
}

function PendingMark() {
  const { pending } = useLinkStatus();
  useMarkPending(pending);
  return null;
}

export function NavLink({ children, ...props }: ComponentProps<typeof Link>) {
  return (
    <Link {...props}>
      {children}
      <PendingMark />
    </Link>
  );
}

export function usePendingPush() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  useMarkPending(pending);
  return useCallback((href: string) => startTransition(() => router.push(href)), [router]);
}

export function NavOverlay() {
  return (
    <div className="nav-overlay" aria-hidden="true">
      <span className="nav-spinner" />
    </div>
  );
}
