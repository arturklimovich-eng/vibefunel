export type ConsentDecision = 'granted' | 'denied';
export type ConsentState = ConsentDecision | 'unknown';

const STORAGE_KEY = 'funnel-analytics-consent';

function warn(action: string, error: unknown): void {
  console.warn(`Consent ${action} failed:`, error instanceof Error ? error.message : error);
}

export function readConsent(): ConsentState {
  try {
    const value = window.localStorage.getItem(STORAGE_KEY);
    return value === 'granted' || value === 'denied' ? value : 'unknown';
  } catch (error) {
    warn('read', error);
    return 'unknown';
  }
}

export function writeConsent(decision: ConsentDecision): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, decision);
  } catch (error) {
    warn('write', error);
  }
}
