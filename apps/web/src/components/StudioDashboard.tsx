'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import type { CSSProperties } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { StorageMode } from '@/lib/storage-mode';
import type { FunnelRow, Metric, OverviewRange, StudioOverview } from '@/server/studio-overview';
import { DeleteFunnelButton } from './DeleteFunnelButton';
import { StudioShell, firstName, useStudioShell } from './StudioShell';
import { DotsIcon, FlowIcon, PenIcon, PlusIcon, SearchIcon } from './EditorIcons';
import styles from './StudioDashboard.module.css';

const RANGE_LABEL: Record<OverviewRange, string> = {
  '7d': 'Last 7 days',
  '30d': 'Last 30 days',
  year: 'This year',
};

const PREVIOUS_LABEL: Record<OverviewRange, string> = {
  '7d': 'previous 7 days',
  '30d': 'previous 30 days',
  year: 'last year',
};

const ROW_COLORS = ['#ef4f37', '#7968f2', '#1c9b70', '#e89a2a', '#0ea5e9', '#db2777'];

const NUMBER = new Intl.NumberFormat('en');

function formatMoney(amount: number, currency: string | null): string {
  if (!currency) return '—';
  try {
    const formatter = new Intl.NumberFormat('en', { style: 'currency', currency });
    const digits = formatter.resolvedOptions().maximumFractionDigits ?? 2;
    return new Intl.NumberFormat('en', {
      style: 'currency',
      currency,
      maximumFractionDigits: amount % 10 ** digits === 0 ? 0 : digits,
    }).format(amount / 10 ** digits);
  } catch {
    return `${amount} ${currency}`;
  }
}

function formatPercent(value: number): string {
  return `${value.toFixed(1)}%`;
}

function trend(metric: { value: number; previous: number }): { text: string; up: boolean } | null {
  if (metric.previous === 0) return metric.value > 0 ? { text: 'New', up: true } : null;
  const change = ((metric.value - metric.previous) / metric.previous) * 100;
  return { text: `${change >= 0 ? '+' : ''}${change.toFixed(1)}%`, up: change >= 0 };
}

function compress(series: number[], size: number, average: boolean): number[] {
  if (series.length <= size) return series;
  const out: number[] = [];
  for (let i = 0; i < size; i++) {
    const from = Math.floor((i * series.length) / size);
    const to = Math.floor(((i + 1) * series.length) / size);
    const slice = series.slice(from, to);
    const sum = slice.reduce((a, b) => a + b, 0);
    out.push(average ? sum / Math.max(1, slice.length) : sum);
  }
  return out;
}

function greetingFor(hour: number): string {
  if (hour < 5) return 'Good evening';
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}

function smoothPath(points: [number, number][]): string {
  if (points.length === 0) return '';
  const [first] = points;
  if (!first) return '';
  let d = `M${first[0]},${first[1]}`;
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i - 1] ?? points[i];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[i + 2] ?? p2;
    if (!p0 || !p1 || !p2 || !p3) continue;
    const low = Math.min(p1[1], p2[1]);
    const high = Math.max(p1[1], p2[1]);
    const clamp = (v: number) => Math.min(high, Math.max(low, v));
    const c1x = p1[0] + (p2[0] - p0[0]) / 6;
    const c1y = clamp(p1[1] + (p2[1] - p0[1]) / 6);
    const c2x = p2[0] - (p3[0] - p1[0]) / 6;
    const c2y = clamp(p2[1] - (p3[1] - p1[1]) / 6);
    d += ` C${c1x},${c1y} ${c2x},${c2y} ${p2[0]},${p2[1]}`;
  }
  return d;
}

function Sparkbars({ series, average }: { series: number[]; average?: boolean }) {
  const bars = compress(series, 10, average === true);
  const max = Math.max(...bars, 0);
  return (
    <div className={styles.sparkbars} aria-hidden="true">
      {bars.map((v, i) => (
        <span key={i} style={{ height: `${max > 0 ? 18 + (v / max) * 82 : 18}%` }} />
      ))}
    </div>
  );
}

function KpiCard({
  label,
  value,
  metric,
  range,
  average,
  note,
}: {
  label: string;
  value: string;
  metric: Metric | { value: number; previous: number; series: number[] };
  range: OverviewRange;
  average?: boolean;
  note?: string;
}) {
  const change = trend(metric);
  return (
    <div className={styles.card + ' ' + styles.kpi}>
      <div className={styles.kpiHead}>
        <span className={styles.kpiLabel}>{label}</span>
        {change ? (
          <span
            className={styles.trend}
            data-up={change.up}
            title={`Compared with the ${PREVIOUS_LABEL[range]}`}
          >
            {change.text}
          </span>
        ) : null}
      </div>
      <p className={styles.kpiValue}>{value}</p>
      {note ? <p className={styles.kpiNote}>{note}</p> : null}
      <Sparkbars series={metric.series} average={average} />
    </div>
  );
}

function PerformanceChart({ overview }: { overview: StudioOverview }) {
  const points = overview.series;
  const width = 600;
  const height = 180;
  const max = Math.max(1, ...points.map((p) => Math.max(p.leads, p.paid)));
  const x = (i: number) => (points.length <= 1 ? width / 2 : (i / (points.length - 1)) * width);
  const y = (v: number) => height - 8 - (v / max) * (height - 24);
  const leadPts = points.map((p, i): [number, number] => [x(i), y(p.leads)]);
  const paidPts = points.map((p, i): [number, number] => [x(i), y(p.paid)]);
  const leadLine = smoothPath(leadPts);
  const area = leadLine ? `${leadLine} L${width},${height} L0,${height} Z` : '';
  const tickCount = Math.min(6, points.length);
  const ticks = Array.from({ length: tickCount }, (_, i) =>
    tickCount <= 1 ? 0 : Math.round((i * (points.length - 1)) / (tickCount - 1)),
  );
  const totalLeads = points.reduce((a, p) => a + p.leads, 0);
  const totalPaid = points.reduce((a, p) => a + p.paid, 0);

  return (
    <div className={styles.chartBox}>
      <div className={styles.gridLines} aria-hidden="true">
        {Array.from({ length: 5 }, (_, i) => (
          <span key={i} />
        ))}
      </div>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        preserveAspectRatio="none"
        className={styles.chart}
        role="img"
        aria-label={`${totalLeads} leads and ${totalPaid} paid orders, ${RANGE_LABEL[overview.range].toLowerCase()}`}
      >
        <defs>
          <linearGradient id="leadFill" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#7968f2" stopOpacity="0.22" />
            <stop offset="100%" stopColor="#7968f2" stopOpacity="0" />
          </linearGradient>
        </defs>
        {area ? <path d={area} fill="url(#leadFill)" /> : null}
        <path
          d={leadLine}
          fill="none"
          stroke="#7968f2"
          strokeWidth="2.5"
          vectorEffect="non-scaling-stroke"
          strokeLinecap="round"
        />
        <path
          d={smoothPath(paidPts)}
          fill="none"
          stroke="#ef4f37"
          strokeWidth="2"
          strokeDasharray="5 5"
          vectorEffect="non-scaling-stroke"
          strokeLinecap="round"
        />
      </svg>
      <div className={styles.ticks} aria-hidden="true">
        {ticks.map((t) => (
          <span key={t}>{points[t]?.label}</span>
        ))}
      </div>
    </div>
  );
}

function FunnelActions({ row }: { row: FunnelRow }) {
  const [menuAt, setMenuAt] = useState<{ top: number; right: number } | null>(null);
  const open = menuAt !== null;
  const ref = useRef<HTMLDivElement>(null);
  const setOpen = (next: boolean) => {
    const rect = ref.current?.getBoundingClientRect();
    setMenuAt(
      next && rect ? { top: rect.bottom + 4, right: window.innerWidth - rect.right } : null,
    );
  };
  useEffect(() => {
    if (!open) return;
    const close = (event: MouseEvent | KeyboardEvent) => {
      if (
        event instanceof KeyboardEvent
          ? event.key === 'Escape'
          : !ref.current?.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    };
    const dismiss = () => setMenuAt(null);
    document.addEventListener('mousedown', close);
    document.addEventListener('keydown', close);
    window.addEventListener('resize', dismiss);
    document.addEventListener('scroll', dismiss, true);
    return () => {
      document.removeEventListener('mousedown', close);
      document.removeEventListener('keydown', close);
      window.removeEventListener('resize', dismiss);
      document.removeEventListener('scroll', dismiss, true);
    };
  }, [open]);
  return (
    <div className={styles.rowActions}>
      <Link
        href={`/studio/funnels/${row.id}?view=flow`}
        className={styles.iconBtn}
        aria-label={`Open the flow of ${row.name}`}
        title="Flow"
      >
        <FlowIcon size={15} />
      </Link>
      <Link
        href={`/studio/funnels/${row.id}`}
        className={styles.iconBtn}
        aria-label={`Edit ${row.name}`}
        title="Edit"
      >
        <PenIcon size={15} />
      </Link>
      <div className={styles.menuHost} ref={ref}>
        <button
          type="button"
          className={styles.iconBtn}
          aria-label={`More actions for ${row.name}`}
          aria-expanded={open}
          onClick={() => setOpen(!open)}
        >
          <DotsIcon size={15} />
        </button>
        {open ? (
          <div className={styles.menu} role="menu" style={menuAt ?? undefined}>
            <Link
              href={`/preview/${row.id}`}
              target="_blank"
              role="menuitem"
              className={styles.menuItem}
            >
              Preview draft
            </Link>
            {row.live ? (
              <Link
                href={`/f/${row.slug}`}
                target="_blank"
                role="menuitem"
                className={styles.menuItem}
              >
                Open live page
              </Link>
            ) : null}
            <DeleteFunnelButton
              funnelId={row.id}
              name={row.name}
              role="menuitem"
              className={styles.menuItemDanger}
            >
              Delete funnel
            </DeleteFunnelButton>
          </div>
        ) : null}
      </div>
    </div>
  );
}

function CreateAnotherButton({ empty }: { empty: boolean }) {
  const { openCreate } = useStudioShell();
  return (
    <button type="button" className={styles.createAnother} onClick={openCreate}>
      <PlusIcon size={14} /> {empty ? 'Create a funnel' : 'Create another funnel'}
    </button>
  );
}

export function StudioDashboard({
  overview,
  storage,
  userEmail,
}: {
  overview: StudioOverview;
  storage: StorageMode;
  userEmail: string | null;
}) {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [greeting, setGreeting] = useState<string | null>(null);
  const name = firstName(userEmail);

  useEffect(() => {
    setGreeting(greetingFor(new Date().getHours()));
  }, []);

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return overview.funnels;
    return overview.funnels.filter(
      (f) => f.name.toLowerCase().includes(q) || f.slug.toLowerCase().includes(q),
    );
  }, [overview.funnels, query]);

  const total = overview.funnels.length;
  const consentRate =
    overview.leads.value > 0 ? (overview.consented / overview.leads.value) * 100 : 0;
  const revenue = overview.revenue;
  const unavailable = !overview.leadsAvailable || !overview.paymentsAvailable;

  return (
    <StudioShell
      active="overview"
      storage={storage}
      userEmail={userEmail}
      funnelCount={total}
      liveCount={overview.liveCount}
      search={
        <label className={styles.search}>
          <SearchIcon size={15} />
          <span className={styles.srOnly}>Search funnels</span>
          <input
            type="search"
            placeholder="Search funnels..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter')
                document.getElementById('funnels')?.scrollIntoView({ behavior: 'smooth' });
            }}
          />
        </label>
      }
    >
      <div className={styles.inner}>
        <div className={styles.titleRow}>
          <div>
            <h1 className={styles.title}>
              {greeting ?? 'Welcome back'}
              {name ? `, ${name}` : ''}
            </h1>
            <p className={styles.subtitle}>Here’s what’s happening across your funnels.</p>
          </div>
          <select
            className={styles.rangeSelect}
            aria-label="Period"
            value={overview.range}
            onChange={(e) => router.push(`/studio?range=${e.target.value}`)}
          >
            {(Object.keys(RANGE_LABEL) as OverviewRange[]).map((r) => (
              <option key={r} value={r}>
                {RANGE_LABEL[r]}
              </option>
            ))}
          </select>
        </div>

        {unavailable ? (
          <p className={styles.warning} role="status">
            Some numbers are missing: {!overview.leadsAvailable ? 'leads' : ''}
            {!overview.leadsAvailable && !overview.paymentsAvailable ? ' and ' : ''}
            {!overview.paymentsAvailable ? 'payments' : ''} could not be loaded (is
            SUPABASE_SERVICE_ROLE_KEY set?).
          </p>
        ) : null}

        <div className={styles.kpis}>
          <KpiCard
            label="Leads captured"
            value={NUMBER.format(overview.leads.value)}
            metric={overview.leads}
            range={overview.range}
          />
          <KpiCard
            label="Paid orders"
            value={NUMBER.format(overview.paid.value)}
            metric={overview.paid}
            range={overview.range}
          />
          <KpiCard
            label="Lead to paid"
            value={formatPercent(overview.conversion.value)}
            metric={overview.conversion}
            range={overview.range}
            average
          />
          <KpiCard
            label="Revenue"
            value={formatMoney(revenue.value, revenue.currency ?? null)}
            metric={revenue}
            range={overview.range}
            note={
              revenue.otherCurrencies > 0
                ? `+ ${revenue.otherCurrencies} other currenc${revenue.otherCurrencies === 1 ? 'y' : 'ies'}`
                : undefined
            }
          />
        </div>

        <div className={styles.charts}>
          <section className={styles.card + ' ' + styles.padded} aria-labelledby="perf-title">
            <div className={styles.cardHead}>
              <div>
                <h2 id="perf-title" className={styles.cardTitle}>
                  Performance
                </h2>
                <p className={styles.cardSub}>Leads and paid orders over time</p>
              </div>
              <div className={styles.legend}>
                <span>
                  <i style={{ background: '#7968f2' }} /> Leads
                </span>
                <span>
                  <i style={{ background: '#ef4f37' }} /> Paid orders
                </span>
              </div>
            </div>
            <PerformanceChart overview={overview} />
          </section>

          <section className={styles.card + ' ' + styles.padded} aria-labelledby="aud-title">
            <div className={styles.cardHead}>
              <div>
                <h2 id="aud-title" className={styles.cardTitle}>
                  Email audience
                </h2>
                <p className={styles.cardSub}>{RANGE_LABEL[overview.range]}</p>
              </div>
            </div>
            <div
              className={styles.donut}
              style={{ '--share': `${consentRate}%` } as CSSProperties}
              role="img"
              aria-label={`${Math.round(consentRate)}% of leads opted in to marketing email`}
            >
              <span className={styles.donutInner}>
                <b>{Math.round(consentRate)}%</b>
                <small>opted in</small>
              </span>
            </div>
            <div className={styles.donutStats}>
              <div>
                <b>{NUMBER.format(overview.leads.value)}</b>
                <small>Leads</small>
              </div>
              <div>
                <b>{NUMBER.format(overview.consented)}</b>
                <small>Opted in</small>
              </div>
              <div>
                <b>{NUMBER.format(overview.paid.value)}</b>
                <small>Paid</small>
              </div>
            </div>
          </section>
        </div>

        <section
          id="funnels"
          className={styles.card + ' ' + styles.tableCard}
          aria-labelledby="funnels-title"
        >
          <div className={styles.tableHead}>
            <div>
              <h2 id="funnels-title" className={styles.cardTitle}>
                Your funnels
              </h2>
              <p className={styles.cardSub}>
                {total} funnel{total === 1 ? '' : 's'} in your workspace
                {query ? ` · ${rows.length} matching “${query}”` : ''}
              </p>
            </div>
          </div>
          <div className={styles.tableScroll}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th scope="col">Funnel</th>
                  <th scope="col">Status</th>
                  <th scope="col">Leads</th>
                  <th scope="col">Paid</th>
                  <th scope="col">Revenue</th>
                  <th scope="col">
                    <span className={styles.srOnly}>Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row, index) => {
                  const color =
                    ROW_COLORS[overview.funnels.indexOf(row) % ROW_COLORS.length] ?? ROW_COLORS[0];
                  return (
                    <tr
                      key={row.id}
                      style={{ '--row-color': color } as CSSProperties}
                      data-index={index}
                    >
                      <td>
                        <Link href={`/studio/funnels/${row.id}`} className={styles.funnelCell}>
                          <span className={styles.funnelIcon}>
                            <FlowIcon size={16} />
                          </span>
                          <span>
                            <b>{row.name}</b>
                            <small>
                              {row.screens === null
                                ? `/${row.slug}`
                                : `${row.screens} screen${row.screens === 1 ? '' : 's'} · /${row.slug}`}
                            </small>
                          </span>
                        </Link>
                      </td>
                      <td>
                        <span className={styles.status} data-live={row.live}>
                          <i /> {row.live ? 'Live' : 'Draft'}
                        </span>
                      </td>
                      <td>{NUMBER.format(row.leads)}</td>
                      <td>{NUMBER.format(row.paid)}</td>
                      <td>{row.currency ? formatMoney(row.revenue, row.currency) : '—'}</td>
                      <td>
                        <FunnelActions row={row} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {total === 0 ? (
              <p className={styles.empty}>No funnels yet. Create your first one to get started.</p>
            ) : rows.length === 0 ? (
              <p className={styles.empty}>No funnels match “{query}”.</p>
            ) : null}
          </div>
          <CreateAnotherButton empty={total === 0} />
        </section>
      </div>
    </StudioShell>
  );
}
