'use client';

import { useEffect, useState } from 'react';
import { z } from 'zod';
import styles from './blocks.module.css';

const plansResponse = z.object({
  plans: z.array(z.object({ key: z.string(), title: z.string(), displayPrice: z.string() })),
  error: z.string().nullable(),
});

type Plans = z.infer<typeof plansResponse>['plans'];

type LoadState =
  { kind: 'loading' } | { kind: 'ready'; plans: Plans; error: string | null } | { kind: 'failed' };

export function PlanField({
  id,
  value,
  onChange,
  readOnly,
}: {
  id: string;
  value: string;
  onChange: (value: string) => void;
  readOnly?: boolean;
}) {
  const [state, setState] = useState<LoadState>({ kind: 'loading' });

  useEffect(() => {
    const controller = new AbortController();
    const load = async () => {
      try {
        const response = await fetch('/api/payments/plans', { signal: controller.signal });
        if (!response.ok) {
          setState({ kind: 'failed' });
          return;
        }
        const parsed = plansResponse.parse(await response.json());
        setState({ kind: 'ready', plans: parsed.plans, error: parsed.error });
      } catch (error) {
        if (controller.signal.aborted) return;
        console.error('Could not load plans:', error instanceof Error ? error.message : error);
        setState({ kind: 'failed' });
      }
    };
    void load();
    return () => controller.abort();
  }, []);

  const plans = state.kind === 'ready' ? state.plans : [];
  const known = plans.some((plan) => plan.key === value);

  return (
    <div>
      <label htmlFor={id} className={styles.fieldLabel}>
        Plan
      </label>
      <select
        id={id}
        value={value}
        disabled={readOnly || state.kind === 'loading'}
        onChange={(event) => onChange(event.target.value)}
      >
        <option value="">{state.kind === 'loading' ? 'Loading plans...' : 'Select a plan'}</option>
        {plans.map((plan) => (
          <option key={plan.key} value={plan.key}>
            {plan.title} ({plan.displayPrice}) - {plan.key}
          </option>
        ))}
        {value !== '' && !known && state.kind !== 'loading' ? (
          <option value={value}>{value} (not in the catalogue)</option>
        ) : null}
      </select>
      {state.kind === 'failed' ? <p>Plans could not be loaded.</p> : null}
      {state.kind === 'ready' && state.error ? <p>{state.error}</p> : null}
    </div>
  );
}
