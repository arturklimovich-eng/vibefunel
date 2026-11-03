'use client';

import { createContext, useContext } from 'react';
import type { ScreenType } from '@funnel/schema';

export interface EditorData {
  screens: { id: string; title: string }[];
  screenId: string | null;
  screenType: ScreenType | null;
}

export const EditorDataContext = createContext<EditorData>({
  screens: [],
  screenId: null,
  screenType: null,
});

export function useEditorData(): EditorData {
  return useContext(EditorDataContext);
}
