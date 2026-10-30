import posthog from 'posthog-js';
import { toProperties } from './events';
import type { AnalyticsScope, BrowserAnalyticsEvent } from './events';

const PUBLIC_KEY = process.env.NEXT_PUBLIC_POSTHOG_KEY;
const PUBLIC_HOST = process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://us.i.posthog.com';
const INCLUDE_OPTION_IDS = process.env.NEXT_PUBLIC_ANALYTICS_ANSWER_IDS === 'true';

let started = false;

function warn(what: string, error: unknown): void {
  console.warn(`Analytics ${what}:`, error instanceof Error ? error.message : error);
}

export function isBrowserAnalyticsConfigured(): boolean {
  return typeof PUBLIC_KEY === 'string' && PUBLIC_KEY.length > 0;
}

export function startBrowserAnalytics(runId: string): boolean {
  if (started) return true;
  if (!PUBLIC_KEY) return false;
  try {
    posthog.init(PUBLIC_KEY, {
      api_host: PUBLIC_HOST,
      persistence: 'memory',
      bootstrap: { distinctID: runId, isIdentifiedID: false },
      person_profiles: 'never',
      autocapture: false,
      capture_pageview: false,
      capture_pageleave: false,
      capture_performance: false,
      capture_heatmaps: false,
      capture_dead_clicks: false,
      capture_exceptions: false,
      rageclick: false,
      disable_session_recording: true,
      disable_surveys: true,
      disable_external_dependency_loading: true,
      advanced_disable_flags: true,
      respect_dnt: true,
      ip: false,
      on_request_error: (response) => {
        console.warn('Analytics request failed with status', response.statusCode);
      },
    });
    started = true;
    return true;
  } catch (error) {
    warn('could not start', error);
    return false;
  }
}

export function trackBrowserEvent(scope: AnalyticsScope, event: BrowserAnalyticsEvent): void {
  if (!started) return;
  try {
    posthog.capture(
      event.name,
      toProperties(scope, event, { source: 'browser', includeOptionIds: INCLUDE_OPTION_IDS }),
    );
  } catch (error) {
    warn('capture failed', error);
  }
}
