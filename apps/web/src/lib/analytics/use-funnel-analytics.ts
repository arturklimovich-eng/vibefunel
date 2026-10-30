import { useCallback, useEffect, useRef, useState } from 'react';
import { isBrowserAnalyticsConfigured, startBrowserAnalytics, trackBrowserEvent } from './browser';
import { readConsent, writeConsent } from './consent';
import type { ConsentDecision, ConsentState } from './consent';
import type { AnalyticsScope, BrowserAnalyticsEvent } from './events';

const BUFFER_LIMIT = 100;

interface Pending {
  scope: AnalyticsScope;
  event: BrowserAnalyticsEvent;
}

type Sdk = 'idle' | 'started' | 'failed';

interface State {
  consent: ConsentState;
  sdk: Sdk;
  buffer: Pending[];
}

export interface FunnelAnalytics {
  showBanner: boolean;
  decide: (decision: ConsentDecision) => void;
  track: (event: BrowserAnalyticsEvent) => void;
  hasConsent: () => boolean;
}

function settle(state: State, scope: AnalyticsScope): void {
  if (state.consent === 'denied' || state.sdk === 'failed') {
    state.buffer = [];
    return;
  }
  if (state.consent !== 'granted' || state.sdk === 'started' || scope.runId === null) return;
  if (!startBrowserAnalytics(scope.runId)) {
    state.sdk = 'failed';
    state.buffer = [];
    return;
  }
  state.sdk = 'started';
  const pending = state.buffer;
  state.buffer = [];
  for (const item of pending) {
    trackBrowserEvent({ ...item.scope, runId: item.scope.runId ?? scope.runId }, item.event);
  }
}

export function useFunnelAnalytics(scope: AnalyticsScope, enabled: boolean): FunnelAnalytics {
  const configured = enabled && isBrowserAnalyticsConfigured();
  const stateRef = useRef<State>({ consent: 'unknown', sdk: 'idle', buffer: [] });
  const scopeRef = useRef(scope);
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    if (!configured) return;
    const state = stateRef.current;
    state.consent = readConsent();
    if (state.consent === 'unknown') setShowBanner(true);
    settle(state, scopeRef.current);
  }, [configured]);

  useEffect(() => {
    scopeRef.current = scope;
    if (configured) settle(stateRef.current, scope);
  }, [scope, configured]);

  const track = useCallback(
    (event: BrowserAnalyticsEvent) => {
      if (!configured) return;
      const state = stateRef.current;
      if (state.consent === 'denied' || state.sdk === 'failed') return;
      const item: Pending = { scope: scopeRef.current, event };
      if (state.sdk === 'started') {
        trackBrowserEvent(item.scope, item.event);
        return;
      }
      if (state.buffer.length < BUFFER_LIMIT) state.buffer.push(item);
    },
    [configured],
  );

  const decide = useCallback((decision: ConsentDecision) => {
    const state = stateRef.current;
    writeConsent(decision);
    state.consent = decision;
    settle(state, scopeRef.current);
    setShowBanner(false);
  }, []);

  const hasConsent = useCallback(
    () => configured && stateRef.current.consent === 'granted',
    [configured],
  );

  return { showBanner, decide, track, hasConsent };
}
