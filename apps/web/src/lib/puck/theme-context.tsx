'use client';

import { createContext, useContext } from 'react';
import type { Theme } from '@funnel/schema';

export const ThemeContext = createContext<Theme | null>(null);

export function useFunnelTheme(): Theme | null {
  return useContext(ThemeContext);
}
