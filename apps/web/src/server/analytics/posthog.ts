import 'server-only';
import { PostHog } from 'posthog-node';
import { toProperties } from '@/lib/analytics/events';
import type { AnalyticsEmitter } from '@/lib/analytics/events';

const DEFAULT_HOST = 'https://us.i.posthog.com';

let client: PostHog | null = null;
let resolved = false;

function warn(what: string, error: unknown): void {
  console.warn(`Analytics (server) ${what}:`, error instanceof Error ? error.message : error);
}

function getClient(): PostHog | null {
  if (resolved) return client;
  resolved = true;
  const key = process.env.POSTHOG_KEY || process.env.NEXT_PUBLIC_POSTHOG_KEY;
  if (!key) return null;
  const host = process.env.POSTHOG_HOST || process.env.NEXT_PUBLIC_POSTHOG_HOST || DEFAULT_HOST;
  try {
    const created = new PostHog(key, {
      host,
      flushAt: 1,
      flushInterval: 1000,
      requestTimeout: 5000,
      fetchRetryCount: 2,
      disableGeoip: true,
    });
    created.on('error', (error: unknown) => warn('request failed', error));
    client = created;
  } catch (error) {
    warn('could not start', error);
    client = null;
  }
  return client;
}

export const posthogServerAnalytics: AnalyticsEmitter = {
  emit(scope, event, options) {
    const instance = getClient();
    if (!instance) return;
    try {
      instance.capture({
        distinctId: scope.runId ?? `funnel:${scope.funnelId}`,
        event: event.name,
        properties: {
          ...toProperties(scope, event, { source: 'server', includeOptionIds: false }),
          $process_person_profile: false,
        },
        disableGeoip: true,
        ...(options?.uuid ? { uuid: options.uuid } : {}),
      });
    } catch (error) {
      warn('capture failed', error);
    }
  },
};
