'use client';

import { useState } from 'react';
import { Puck } from '@puckeditor/core';
import type { Overrides } from '@puckeditor/core';
import '@puckeditor/core/puck.css';
import type { PuckData, ScreenType } from '@funnel/schema';
import { applyOptionMode, fromPuckData, toPuckData } from '@/lib/puck/adapters';
import { configForScreenType } from '@/lib/puck/config';
import styles from './FunnelEditor.module.css';

interface ScreenEditorProps {
  screenId: string;
  screenType: ScreenType;
  content: PuckData;
  onChange: (content: PuckData) => void;
}

const PUCK_OVERRIDES: Partial<Overrides> = { headerActions: () => <></> };

export function ScreenEditor({ screenType, content, onChange }: ScreenEditorProps) {
  const [config] = useState(() => configForScreenType(screenType));
  const [initialData] = useState(() => toPuckData(applyOptionMode(content, screenType)));
  return (
    <div className={styles.puckHost}>
      <Puck
        config={config}
        data={initialData}
        iframe={{ enabled: false }}
        overrides={PUCK_OVERRIDES}
        onChange={(data) => {
          const parsed = fromPuckData(data);
          if (parsed) onChange(applyOptionMode(parsed, screenType));
        }}
      />
    </div>
  );
}
