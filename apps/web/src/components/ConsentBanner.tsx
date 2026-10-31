'use client';

import type { ConsentDecision } from '@/lib/analytics/consent';
import styles from './FunnelRuntime.module.css';

export function ConsentBanner({ onDecide }: { onDecide: (decision: ConsentDecision) => void }) {
  return (
    <div className={styles.consent} role="region" aria-label="Analytics consent">
      <p className={styles.consentText}>
        This funnel uses analytics to measure how it is used. No cookies are stored, and email
        addresses and other personal details are never sent.
      </p>
      <div className={styles.consentActions}>
        <button type="button" className={styles.consentDecline} onClick={() => onDecide('denied')}>
          Decline
        </button>
        <button type="button" className={styles.consentAccept} onClick={() => onDecide('granted')}>
          Accept
        </button>
      </div>
    </div>
  );
}
