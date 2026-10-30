import 'server-only';
import type { AnalyticsEmitter } from '@/lib/analytics/events';
import { posthogServerAnalytics } from '@/server/analytics/posthog';

export const serverAnalytics: AnalyticsEmitter = posthogServerAnalytics;
