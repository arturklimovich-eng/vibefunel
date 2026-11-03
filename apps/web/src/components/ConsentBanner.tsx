'use client';

import { useLayoutEffect, useRef, useState } from 'react';
import type { ConsentDecision } from '@/lib/analytics/consent';
import styles from './FunnelRuntime.module.css';

export function ConsentBanner({
  onDecide,
  compact = false,
}: {
  onDecide: (decision: ConsentDecision) => void;
  compact?: boolean;
}) {
  const bannerRef = useRef<HTMLDivElement>(null);
  const [reserve, setReserve] = useState(0);

  useLayoutEffect(() => {
    const el = bannerRef.current;
    if (!el) return;
    const update = () => setReserve(el.offsetHeight + 24);
    update();
    const observer = new ResizeObserver(update);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <>
      <div className={styles.consentSpacer} style={{ height: reserve }} aria-hidden="true" />
      <div
        ref={bannerRef}
        className={styles.consent}
        data-compact={compact || undefined}
        role="region"
        aria-label="Analytics consent"
      >
        <p className={styles.consentText}>
          {compact
            ? 'Allow anonymous analytics? No cookies, no personal details.'
            : 'This funnel uses analytics to measure how it is used. No cookies are stored, and email addresses and other personal details are never sent.'}
        </p>
        <div className={styles.consentActions}>
          <button
            type="button"
            className={styles.consentDecline}
            onClick={() => onDecide('denied')}
          >
            Decline
          </button>
          <button
            type="button"
            className={styles.consentAccept}
            onClick={() => onDecide('granted')}
          >
            Accept
          </button>
        </div>
      </div>
    </>
  );
}
