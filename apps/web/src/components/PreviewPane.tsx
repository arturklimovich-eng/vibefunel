'use client';

import { useCallback, useDeferredValue, useState } from 'react';
import type { FunnelDefinition } from '@funnel/schema';
import { FunnelRuntime } from './FunnelRuntime';
import styles from './FunnelEditor.module.css';

type Device = 'desktop' | 'mobile';

export function PreviewPane({
  funnelId,
  definition,
}: {
  funnelId: string;
  definition: FunnelDefinition;
}) {
  const [device, setDevice] = useState<Device>('mobile');
  const [runId, setRunId] = useState(0);
  const deferredDefinition = useDeferredValue(definition);
  const restart = useCallback(() => setRunId((n) => n + 1), []);
  return (
    <section className={styles.panel} aria-labelledby="preview-heading">
      <div className={styles.row}>
        <h2 id="preview-heading" className={styles.panelHeading}>
          Test run
        </h2>
        <div role="group" aria-label="Preview device" className={styles.segmented}>
          <button
            type="button"
            className={styles.segment}
            aria-pressed={device === 'desktop'}
            onClick={() => setDevice('desktop')}
          >
            Desktop
          </button>
          <button
            type="button"
            className={styles.segment}
            aria-pressed={device === 'mobile'}
            onClick={() => setDevice('mobile')}
          >
            Mobile 390x844
          </button>
        </div>
        <button type="button" className={styles.btn} onClick={restart}>
          Reset run
        </button>
      </div>
      <div className={styles.deviceStage}>
        <div className={device === 'mobile' ? styles.deviceMobile : styles.deviceDesktop}>
          <FunnelRuntime
            key={`${runId}-${deferredDefinition.startScreenId}`}
            onInvalid={restart}
            funnelId={funnelId}
            definition={deferredDefinition}
            label="Test run (unsaved draft)"
            embedded
          />
        </div>
      </div>
    </section>
  );
}
