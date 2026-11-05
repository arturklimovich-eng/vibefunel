'use client';

import { memo, useMemo } from 'react';
import { applyPatch } from '@funnel/schema';
import type { FunnelDefinition, FunnelPatch } from '@funnel/schema';
import { depthFromStart, longestPathFrom, previewStep } from '@/lib/progress';
import { StaticScreen } from '../ScreenCanvas';
import styles from './AssistantPanel.module.css';

const MAX_PREVIEWS = 4;

function touchedScreens(patch: FunnelPatch): string[] {
  const ids = patch.flatMap((op) => {
    if (op.op === 'add_screen' || op.op === 'replace_screen') return [op.screen.id];
    if (op.op === 'insert_elements') return [op.screenId];
    return [];
  });
  return [...new Set(ids)].slice(0, MAX_PREVIEWS);
}

export const ProposalPreview = memo(function ProposalPreview({
  base,
  patch,
}: {
  base: FunnelDefinition;
  patch: FunnelPatch;
}) {
  const previews = useMemo(() => {
    const ids = touchedScreens(patch);
    if (ids.length === 0) return null;
    const next = applyPatch(base, patch);
    const depths = depthFromStart(next);
    const lengths = longestPathFrom(next);
    return {
      next,
      items: ids.flatMap((id) => {
        const screen = next.screens.find((s) => s.id === id);
        return screen ? [{ screen, position: previewStep(next, id, depths, lengths) }] : [];
      }),
    };
  }, [base, patch]);

  if (!previews || previews.items.length === 0) return null;
  return (
    <div className={styles.previewStrip}>
      {previews.items.map(({ screen, position }) => (
        <figure key={screen.id} className={styles.previewPhone}>
          <div className={styles.previewFrame}>
            <div className={styles.previewScaled}>
              <StaticScreen
                screen={screen}
                definition={previews.next}
                position={position}
                groupsKey=""
              />
            </div>
          </div>
          <figcaption>{screen.title}</figcaption>
        </figure>
      ))}
    </div>
  );
});
