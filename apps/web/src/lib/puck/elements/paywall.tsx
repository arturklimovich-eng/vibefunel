'use client';

import { useEffect, useState } from 'react';
import { CheckoutPanel } from '../CheckoutPanel';
import { PlanField } from '../PlanField';
import { framed, isEditingRender } from '../frame';
import type { BlockProps } from '../frame';
import { useRuntime } from '../runtime-context';
import { boxCss, number, parse, radio, text, textarea } from './shared';
import {
  SELECTED_PLAN_KEY,
  planPickerProps,
  totalsProps,
  trialPickerProps,
  walletProps,
} from '@funnel/schema';
import type { PlanItem } from '@funnel/schema';
import type { Components } from './shared';
import styles from './elements.module.css';

function usePlanSelection(
  props: BlockProps,
  keys: string[],
  selected: number,
  ownKeys: string[] = keys,
) {
  const runtime = useRuntime();
  const live = !isEditingRender(props) && runtime.screenId !== null;
  const current = runtime.values[SELECTED_PLAN_KEY] ?? '';
  const fallback = keys[selected - 1] ?? keys[0] ?? '';
  const known = keys.includes(current);
  const otherPicker =
    !known && !ownKeys.includes(current) && runtime.screenPlanKeys.includes(current);
  const adopt = live && !known && !otherPicker && fallback !== '';
  const { setValue } = runtime;
  useEffect(() => {
    if (adopt) setValue(SELECTED_PLAN_KEY, fallback);
  }, [adopt, fallback, setValue]);
  const active = known ? current : otherPicker ? '' : fallback;
  return {
    active,
    choose: (key: string) => {
      if (key !== '') setValue(SELECTED_PLAN_KEY, key);
    },
  };
}

function PlanPickerView(props: BlockProps & { composite: boolean; billing?: boolean }) {
  const p = parse(planPickerProps, props);
  const [tab, setTab] = useState(0);
  const all = (p?.items ?? []).map((item, idx) => ({ item, key: item.planKey || `__${idx}` }));
  const groups = props.billing ? (p?.groups ?? []).map((g) => g.label).filter((g) => g !== '') : [];
  const activeGroup = groups.length > 0 ? (groups[Math.min(tab, groups.length - 1)] ?? null) : null;
  const visible = activeGroup === null ? all : all.filter((e) => e.item.group === activeGroup);
  const selection = usePlanSelection(
    props,
    visible.map((e) => e.key),
    p?.selected ?? 1,
    all.map((e) => e.key),
  );
  if (!p) return null;
  const { accentColor, ...rest } = props.blockStyle;
  const accent = accentColor ?? 'var(--funnel-primary, #4f46e5)';
  return (
    <div
      className={styles.plans}
      data-composite={props.composite}
      role="radiogroup"
      aria-label="Plans"
    >
      {groups.length > 0 ? (
        <div className={styles.billingTabs} role="tablist" aria-label="Billing period">
          {groups.map((g, i) => (
            <button
              key={g}
              type="button"
              role="tab"
              aria-selected={g === activeGroup}
              className={styles.billingTab}
              style={g === activeGroup ? { background: accent, color: '#fff' } : undefined}
              onClick={() => setTab(i)}
            >
              {g}
            </button>
          ))}
        </div>
      ) : null}
      {visible.map(({ item, key }: { item: PlanItem; key: string }) => {
        const active = key === selection.active;
        return (
          <button
            key={key}
            type="button"
            role="radio"
            aria-checked={active}
            className={styles.plan}
            data-active={active}
            style={{
              ...boxCss(rest),
              ...(active ? { borderColor: accent, boxShadow: `0 0 0 1px ${accent}` } : {}),
            }}
            onClick={() => selection.choose(key)}
          >
            {item.badge ? (
              <span className={styles.planBadge} style={{ background: accent }}>
                {item.badge}
              </span>
            ) : null}
            <span
              className={styles.planRadio}
              style={active ? { borderColor: accent, background: accent } : undefined}
              aria-hidden="true"
            />
            <span className={styles.planMain}>
              <strong>{item.title}</strong>
              <span className={styles.planPrices}>
                {item.oldPrice ? <s>{item.oldPrice}</s> : null}
                <span>{item.price}</span>
                {item.period ? <span className={styles.planPeriod}>{item.period}</span> : null}
              </span>
            </span>
            {item.perDay ? (
              <span
                className={styles.planPerDay}
                style={active ? { background: accent, color: '#fff' } : undefined}
              >
                {item.perDay}
              </span>
            ) : null}
          </button>
        );
      })}
      {p.note ? <p className={styles.planNote}>{p.note}</p> : null}
    </div>
  );
}

function BillingPlanPicker(props: BlockProps) {
  return <PlanPickerView {...props} composite billing />;
}

function Totals(props: BlockProps) {
  const p = parse(totalsProps, props);
  if (!p) return null;
  return (
    <div className={styles.totals} style={boxCss(props.blockStyle)}>
      {p.rows.map((row, i) => (
        <div key={i} className={styles.totalsRow}>
          <span>{row.label}</span>
          <span>{row.value}</span>
        </div>
      ))}
      <div className={styles.totalsRow} data-total="true">
        <span>{p.totalLabel}</span>
        <span>{p.totalValue}</span>
      </div>
      {p.note ? <p className={styles.planNote}>{p.note}</p> : null}
    </div>
  );
}

function PlanPicker(props: BlockProps) {
  return <PlanPickerView {...props} composite={false} />;
}

function PlanPickerComposite(props: BlockProps) {
  return <PlanPickerView {...props} composite />;
}

function TrialPicker(props: BlockProps) {
  const p = parse(trialPickerProps, props);
  const items = p?.items ?? [];
  const keys = items.map((i, idx) => i.planKey || `__${idx}`);
  const selection = usePlanSelection(props, keys, p?.selected ?? 1);
  if (!p) return null;
  const { accentColor, ...rest } = props.blockStyle;
  const accent = accentColor ?? 'var(--funnel-primary, #4f46e5)';
  return (
    <div className={styles.trial}>
      {p.title ? <p className={styles.fieldLabel}>{p.title}</p> : null}
      <div className={styles.trialGrid} role="radiogroup" aria-label={p.title || 'Trial price'}>
        {items.map((item, idx) => {
          const key = keys[idx] ?? '';
          const active = key === selection.active;
          return (
            <button
              key={key}
              type="button"
              role="radio"
              aria-checked={active}
              className={styles.trialItem}
              style={{
                ...boxCss(rest),
                ...(active ? { borderColor: accent, background: accent, color: '#fff' } : {}),
              }}
              onClick={() => selection.choose(key)}
            >
              {item.price}
            </button>
          );
        })}
      </div>
      {p.note ? <p className={styles.planNote}>{p.note}</p> : null}
    </div>
  );
}

function WalletButton(props: BlockProps) {
  const runtime = useRuntime();
  const p = parse(walletProps, props);
  const [open, setOpen] = useState(false);
  const editing = isEditingRender(props);
  if (!p) return null;
  const planKey =
    p.source === 'picker' ? runtime.values[SELECTED_PLAN_KEY] || runtime.defaultPlan : p.planKey;
  return (
    <div className={styles.wallet}>
      {editing ? (
        <span className={styles.editorTag}>
          Opens Stripe checkout; Apple Pay and Google Pay appear there on supported devices
        </span>
      ) : null}
      {open ? (
        <CheckoutPanel planKey={planKey} />
      ) : (
        <button
          type="button"
          className={styles.walletButton}
          style={boxCss(props.blockStyle)}
          onClick={() => {
            if (!editing) setOpen(true);
          }}
        >
          <span>{p.label}</span>
          <span className={styles.walletMarks} aria-hidden="true">
            Apple Pay · Google Pay
          </span>
        </button>
      )}
    </div>
  );
}

const planKeyField = {
  type: 'custom' as const,
  label: 'Plan',
  render: ({
    id,
    value,
    onChange,
    readOnly,
  }: {
    id: string;
    value: unknown;
    onChange: (v: string) => void;
    readOnly?: boolean;
  }) => (
    <PlanField
      id={id}
      value={typeof value === 'string' ? value : ''}
      onChange={onChange}
      readOnly={readOnly}
    />
  ),
};

const planItemsField = {
  type: 'array' as const,
  label: 'Plans',
  arrayFields: {
    planKey: planKeyField,
    title: text('Title'),
    price: text('Price'),
    oldPrice: text('Old price (crossed out)'),
    period: text('Period'),
    perDay: text('Per-day price'),
    badge: text('Badge'),
  },
  defaultItemProps: {
    planKey: '',
    title: '1-month plan',
    price: '$19.99',
    oldPrice: '',
    period: '',
    perDay: '$0.66/day',
    badge: '',
  },
  getItemSummary: (item: { title?: string }) => item.title || 'Plan',
};

const pickerDefaults = {
  items: [
    {
      planKey: '',
      title: '1-week trial',
      price: '$6.93',
      oldPrice: '$17.77',
      period: '',
      perDay: '$0.99/day',
      badge: '',
    },
    {
      planKey: '',
      title: '4-week plan',
      price: '$15.19',
      oldPrice: '$38.95',
      period: '',
      perDay: '$0.54/day',
      badge: 'Most popular',
    },
    {
      planKey: '',
      title: '12-week plan',
      price: '$25.99',
      oldPrice: '$66.65',
      period: '',
      perDay: '$0.31/day',
      badge: '',
    },
  ],
  selected: 2,
  note: 'Cancel anytime. Plans renew automatically.',
};

const pickerFields = {
  items: planItemsField,
  selected: number('Selected by default (position)', 1, 10),
  note: textarea('Note under the plans'),
};

export const paywallComponents: Components = {
  BillingPlanPicker: {
    label: 'Billing Plan Picker',
    fields: {
      groups: {
        type: 'array',
        label: 'Billing periods (tabs)',
        arrayFields: { label: text('Label') },
        defaultItemProps: { label: 'Monthly' },
        getItemSummary: (item) => item.label || 'Period',
      },
      items: {
        ...planItemsField,
        arrayFields: { ...planItemsField.arrayFields, group: text('Billing period (tab label)') },
      },
      selected: number('Selected by default (position in tab)', 1, 10),
      note: textarea('Note under the plans'),
    },
    defaultProps: {
      groups: [{ label: 'Monthly' }, { label: 'Yearly' }],
      items: [
        {
          planKey: '',
          title: 'Basic',
          price: '$9.99',
          oldPrice: '',
          period: '/month',
          perDay: '',
          badge: '',
          group: 'Monthly',
        },
        {
          planKey: '',
          title: 'Pro',
          price: '$19.99',
          oldPrice: '',
          period: '/month',
          perDay: '',
          badge: 'Most popular',
          group: 'Monthly',
        },
        {
          planKey: '',
          title: 'Basic',
          price: '$79.99',
          oldPrice: '$119.88',
          period: '/year',
          perDay: '',
          badge: 'Save 33%',
          group: 'Yearly',
        },
        {
          planKey: '',
          title: 'Pro',
          price: '$149.99',
          oldPrice: '$239.88',
          period: '/year',
          perDay: '',
          badge: 'Best value',
          group: 'Yearly',
        },
      ],
      selected: 2,
      note: 'Cancel anytime.',
    },
    render: framed('BillingPlanPicker', BillingPlanPicker),
  },
  Totals: {
    label: 'Totals',
    fields: {
      rows: {
        type: 'array',
        label: 'Rows',
        arrayFields: { label: text('Label'), value: text('Value') },
        defaultItemProps: { label: 'Item', value: '$0.00' },
        getItemSummary: (item) => item.label || 'Row',
      },
      totalLabel: text('Total label'),
      totalValue: text('Total value'),
      note: textarea('Note'),
    },
    defaultProps: {
      rows: [
        { label: '4-week plan', value: '$38.95' },
        { label: 'Introductory discount', value: '-$23.76' },
      ],
      totalLabel: 'Total today',
      totalValue: '$15.19',
      note: 'You will be charged $38.95 every 4 weeks after the intro period.',
    },
    render: framed('Totals', Totals),
  },
  PlanPicker: {
    label: 'Subscription Plan Picker (simple)',
    fields: pickerFields,
    defaultProps: pickerDefaults,
    render: framed('PlanPicker', PlanPicker),
  },
  PlanPickerComposite: {
    label: 'Subscription Plan Picker (composite)',
    fields: pickerFields,
    defaultProps: pickerDefaults,
    render: framed('PlanPickerComposite', PlanPickerComposite),
  },
  TrialPicker: {
    label: 'Trial Price Picker',
    fields: {
      title: text('Title'),
      items: {
        type: 'array',
        label: 'Prices',
        arrayFields: { planKey: planKeyField, price: text('Price label') },
        defaultItemProps: { planKey: '', price: '$5' },
        getItemSummary: (item) => item.price || 'Price',
      },
      selected: number('Selected by default (position)', 1, 10),
      note: textarea('Note'),
    },
    defaultProps: {
      title: 'Choose your trial price',
      items: [
        { planKey: '', price: '$1' },
        { planKey: '', price: '$5' },
        { planKey: '', price: '$9' },
        { planKey: '', price: '$13.67' },
      ],
      selected: 4,
      note: 'It costs us $13.67 to offer a 7-day trial, but pick what you can afford.',
    },
    render: framed('TrialPicker', TrialPicker),
  },
  WalletButton: {
    label: 'Wallet Button',
    fields: {
      source: radio('Plan', [
        ['picker', 'Picked on the paywall'],
        ['fixed', 'Fixed plan'],
      ]),
      planKey: planKeyField,
      label: text('Label'),
    },
    defaultProps: { source: 'picker', planKey: '', label: 'Buy with' },
    render: framed('WalletButton', WalletButton),
  },
};
