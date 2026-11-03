import { randomId } from '@/lib/ids';

export interface PendingPreset {
  type: string;
  props: Record<string, unknown>;
}

export const insertTracker: { lastAction: string; pending: PendingPreset | null } = {
  lastAction: '',
  pending: null,
};

export function newElementId(): string {
  return `el_${randomId(5)}`;
}
