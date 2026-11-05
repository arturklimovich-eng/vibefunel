import 'server-only';
import type { Funnel } from '@funnel/schema';
import type { FunnelRepository } from './funnel-repository';
import { getLeadStore } from './leads/registry';
import type { FunnelLead } from './leads/store';
import { getPaymentStore } from './payments/registry';
import type { FunnelPayment } from './payments/store';
import { revocationOf } from './payments/types';

export const OVERVIEW_RANGES = ['7d', '30d', 'year'] as const;
export type OverviewRange = (typeof OVERVIEW_RANGES)[number];

const PAYMENT_LIMIT = 5000;
const DAY_MS = 86_400_000;

export interface SeriesPoint {
  label: string;
  leads: number;
  paid: number;
}

export interface Metric {
  value: number;
  previous: number;
  series: number[];
}

export interface RevenueMetric {
  currency: string | null;
  value: number;
  previous: number;
  series: number[];
  otherCurrencies: number;
}

export interface FunnelRow {
  id: string;
  groupId: string | null;
  name: string;
  slug: string;
  live: boolean;
  aiDraftExpiresAt: string | null;
  screens: number | null;
  leads: number;
  paid: number;
  revenue: number;
  currency: string | null;
}

export interface StudioOverview {
  range: OverviewRange;
  leads: Metric;
  paid: Metric;
  conversion: Metric;
  revenue: RevenueMetric;
  consented: number;
  series: SeriesPoint[];
  funnels: FunnelRow[];
  liveCount: number;
  leadsAvailable: boolean;
  paymentsAvailable: boolean;
}

interface Window {
  start: number;
  end: number;
  previousStart: number;
  buckets: { start: number; label: string }[];
}

const DAY_FORMAT = new Intl.DateTimeFormat('en', {
  month: 'short',
  day: 'numeric',
  timeZone: 'UTC',
});
const MONTH_FORMAT = new Intl.DateTimeFormat('en', { month: 'short', timeZone: 'UTC' });

function startOfUtcDay(time: number): number {
  return Math.floor(time / DAY_MS) * DAY_MS;
}

function buildWindow(range: OverviewRange, now: number): Window {
  const end = now;
  if (range === 'year') {
    const year = new Date(now).getUTCFullYear();
    const start = Date.UTC(year, 0, 1);
    const month = new Date(now).getUTCMonth();
    const buckets = Array.from({ length: month + 1 }, (_, m) => {
      const bucketStart = Date.UTC(year, m, 1);
      return { start: bucketStart, label: MONTH_FORMAT.format(bucketStart) };
    });
    return { start, end, previousStart: Date.UTC(year - 1, 0, 1), buckets };
  }
  const days = range === '7d' ? 7 : 30;
  const start = startOfUtcDay(now) - (days - 1) * DAY_MS;
  const buckets = Array.from({ length: days }, (_, i) => {
    const bucketStart = start + i * DAY_MS;
    return { start: bucketStart, label: DAY_FORMAT.format(bucketStart) };
  });
  return { start, end, previousStart: start - days * DAY_MS, buckets };
}

function bucketIndex(window: Window, time: number): number {
  for (let i = window.buckets.length - 1; i >= 0; i--) {
    const bucket = window.buckets[i];
    if (bucket && time >= bucket.start) return i;
  }
  return -1;
}

function netAmount(payment: FunnelPayment): number {
  if (payment.status !== 'succeeded') return 0;
  if (revocationOf(payment) !== null) return 0;
  return Math.max(0, payment.amount - payment.amountRefunded);
}

function isPaid(payment: FunnelPayment): boolean {
  return payment.status === 'succeeded' && revocationOf(payment) === null;
}

async function safeLeads(
  funnel: Pick<Funnel, 'id' | 'projectId'>,
  since: string,
): Promise<FunnelLead[] | null> {
  try {
    return await getLeadStore().listFunnelLeads(funnel.projectId, funnel.id, null, since);
  } catch {
    return null;
  }
}

async function safePayments(
  funnel: Pick<Funnel, 'id' | 'projectId'>,
  since: string,
): Promise<FunnelPayment[] | null> {
  try {
    return await getPaymentStore().listFunnelPayments(
      funnel.projectId,
      funnel.id,
      PAYMENT_LIMIT,
      since,
    );
  } catch {
    return null;
  }
}

async function safeScreens(repo: FunnelRepository, funnel: Funnel): Promise<number | null> {
  try {
    const draft = await repo.getDraft(funnel.id);
    return draft ? draft.definition.screens.length : null;
  } catch {
    return null;
  }
}

export function parseRange(value: string | string[] | undefined): OverviewRange {
  const raw = Array.isArray(value) ? value[0] : value;
  return OVERVIEW_RANGES.find((r) => r === raw) ?? '30d';
}

export async function loadStudioOverview(
  repo: FunnelRepository,
  funnels: Funnel[],
  range: OverviewRange,
  now = Date.now(),
): Promise<StudioOverview> {
  const window = buildWindow(range, now);
  const since = new Date(window.previousStart).toISOString();
  const size = window.buckets.length;
  const leadSeries = new Array<number>(size).fill(0);
  const paidSeries = new Array<number>(size).fill(0);
  const revenueByCurrency = new Map<
    string,
    { value: number; previous: number; series: number[] }
  >();
  let leads = 0;
  let previousLeads = 0;
  let paid = 0;
  let previousPaid = 0;
  let consented = 0;
  let leadsAvailable = true;
  let paymentsAvailable = true;

  const loaded = await Promise.all(
    funnels.map(async (funnel) => {
      const [funnelLeads, funnelPayments, screens] = await Promise.all([
        safeLeads(funnel, since),
        safePayments(funnel, since),
        safeScreens(repo, funnel),
      ]);
      return { funnel, funnelLeads, funnelPayments, screens };
    }),
  );

  const rows: FunnelRow[] = loaded.map(({ funnel, funnelLeads, funnelPayments, screens }) => {
    if (funnelLeads === null) leadsAvailable = false;
    if (funnelPayments === null) paymentsAvailable = false;
    let rowLeads = 0;
    let rowPaid = 0;
    const rowRevenue = new Map<string, number>();

    for (const lead of funnelLeads ?? []) {
      const time = Date.parse(lead.createdAt);
      if (Number.isNaN(time)) continue;
      if (time >= window.start && time <= window.end) {
        leads += 1;
        rowLeads += 1;
        if (lead.consent) consented += 1;
        const index = bucketIndex(window, time);
        if (index >= 0) leadSeries[index] = (leadSeries[index] ?? 0) + 1;
      } else if (time >= window.previousStart && time < window.start) {
        previousLeads += 1;
      }
    }

    for (const payment of funnelPayments ?? []) {
      const time = Date.parse(payment.createdAt);
      if (Number.isNaN(time) || !isPaid(payment)) continue;
      const currency = payment.currency.toUpperCase();
      const entry = revenueByCurrency.get(currency) ?? {
        value: 0,
        previous: 0,
        series: new Array<number>(size).fill(0),
      };
      const amount = netAmount(payment);
      if (time >= window.start && time <= window.end) {
        paid += 1;
        rowPaid += 1;
        entry.value += amount;
        rowRevenue.set(currency, (rowRevenue.get(currency) ?? 0) + amount);
        const index = bucketIndex(window, time);
        if (index >= 0) {
          paidSeries[index] = (paidSeries[index] ?? 0) + 1;
          entry.series[index] = (entry.series[index] ?? 0) + amount;
        }
      } else if (time >= window.previousStart && time < window.start) {
        previousPaid += 1;
        entry.previous += amount;
      }
      revenueByCurrency.set(currency, entry);
    }

    const topRowCurrency = [...rowRevenue.entries()].sort((a, b) => b[1] - a[1])[0];
    return {
      id: funnel.id,
      groupId: funnel.groupId,
      name: funnel.name,
      slug: funnel.slug,
      live: funnel.publishedVersionId !== null,
      aiDraftExpiresAt: funnel.aiDraftExpiresAt ?? null,
      screens,
      leads: rowLeads,
      paid: rowPaid,
      revenue: topRowCurrency?.[1] ?? 0,
      currency: topRowCurrency?.[0] ?? null,
    };
  });

  const currencies = [...revenueByCurrency.entries()].sort((a, b) => b[1].value - a[1].value);
  const top = currencies[0];
  const ratio = (a: number, b: number) => (b > 0 ? (a / b) * 100 : 0);

  return {
    range,
    leads: { value: leads, previous: previousLeads, series: leadSeries },
    paid: { value: paid, previous: previousPaid, series: paidSeries },
    conversion: {
      value: ratio(paid, leads),
      previous: ratio(previousPaid, previousLeads),
      series: leadSeries.map((l, i) => ratio(paidSeries[i] ?? 0, l)),
    },
    revenue: {
      currency: top?.[0] ?? null,
      value: top?.[1].value ?? 0,
      previous: top?.[1].previous ?? 0,
      series: top?.[1].series ?? new Array<number>(size).fill(0),
      otherCurrencies: Math.max(0, currencies.length - 1),
    },
    consented,
    series: window.buckets.map((b, i) => ({
      label: b.label,
      leads: leadSeries[i] ?? 0,
      paid: paidSeries[i] ?? 0,
    })),
    funnels: rows,
    liveCount: rows.filter((r) => r.live).length,
    leadsAvailable,
    paymentsAvailable,
  };
}

export interface FunnelMetrics {
  days: number;
  leads: number | null;
  purchases: number | null;
  revenue: { currency: string; amount: number }[];
}

export async function loadFunnelMetrics(
  projectId: string,
  funnelId: string,
  days: number,
): Promise<FunnelMetrics> {
  const since = new Date(Date.now() - days * DAY_MS).toISOString();
  const funnel = { id: funnelId, projectId };
  const [leads, payments] = await Promise.all([
    getLeadStore()
      .countFunnelLeads(projectId, funnelId, since)
      .catch(() => null),
    safePayments(funnel, since),
  ]);
  const revenue = new Map<string, number>();
  for (const payment of payments ?? []) {
    const amount = netAmount(payment);
    if (amount > 0) revenue.set(payment.currency, (revenue.get(payment.currency) ?? 0) + amount);
  }
  return {
    days,
    leads,
    purchases: payments ? payments.filter(isPaid).length : null,
    revenue: [...revenue].map(([currency, amount]) => ({ currency, amount })),
  };
}
