'use client';

import { useCallback, useEffect, useState } from 'react';
import { z } from 'zod';
import { funnelRoutes, readJson } from '@/lib/api-routes';
import styles from './FunnelEditor.module.css';

const paymentSchema = z.object({
  provider: z.string(),
  providerRef: z.string(),
  screenId: z.string(),
  planKey: z.string(),
  amount: z.number(),
  currency: z.string(),
  status: z.enum(['pending', 'succeeded', 'failed']),
  reason: z.string().nullable(),
  amountRefunded: z.number(),
  disputeStatus: z.string().nullable(),
  revoked: z.enum(['refunded', 'disputed']).nullable(),
  createdAt: z.string(),
});
const responseSchema = z.object({ payments: z.array(paymentSchema) });

type Payment = z.infer<typeof paymentSchema>;

function formatMoney(amount: number, currency: string): string {
  try {
    const formatter = new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency: currency.toUpperCase(),
    });
    const digits = formatter.resolvedOptions().maximumFractionDigits ?? 2;
    return formatter.format(amount / 10 ** digits);
  } catch (error) {
    if (error instanceof RangeError) return `${(amount / 100).toFixed(2)} ${currency}`;
    throw error;
  }
}

function formatDate(value: string): string {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString();
}

function describe(payment: Payment): string {
  if (payment.status === 'pending') return 'Pending';
  if (payment.status === 'failed') return payment.reason ? `Failed (${payment.reason})` : 'Failed';
  const parts: string[] = [];
  if (payment.revoked === 'refunded') parts.push('Refunded, access closed');
  else if (payment.revoked === 'disputed') parts.push('Disputed, access suspended');
  else parts.push('Paid, access active');
  if (payment.amountRefunded > 0 && payment.revoked !== 'refunded') {
    parts.push(`refunded ${formatMoney(payment.amountRefunded, payment.currency)}`);
  }
  if (payment.disputeStatus !== null) parts.push(`dispute: ${payment.disputeStatus}`);
  return parts.join(', ');
}

export function PaymentsPanel({ funnelId }: { funnelId: string }) {
  const [payments, setPayments] = useState<Payment[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const res = await fetch(`${funnelRoutes(funnelId).base}/payments`, { cache: 'no-store' });
      if (res.status === 503) {
        setError('Payments are not configured on this server.');
        return;
      }
      if (!res.ok) {
        setError(`Payments could not be loaded (HTTP ${res.status}).`);
        return;
      }
      const parsed = responseSchema.safeParse(await readJson(res));
      if (!parsed.success) {
        setError('Payments response was not understood.');
        return;
      }
      setError(null);
      setPayments(parsed.data.payments);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Network error');
    }
  }, [funnelId]);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <div className={styles.panel}>
      <h2 className={styles.panelHeading}>Payments</h2>
      {error ? <p role="alert">{error}</p> : null}
      {payments === null && !error ? <p>Loading payments...</p> : null}
      {payments && payments.length === 0 ? <p>No payments yet.</p> : null}
      {payments && payments.length > 0 ? (
        <ul className={styles.edgeList}>
          {payments.map((p) => (
            <li key={`${p.provider}:${p.providerRef}`} className={styles.row}>
              <span>
                <strong>{formatMoney(p.amount, p.currency)}</strong> {p.planKey} -{' '}
                {formatDate(p.createdAt)}
              </span>
              <span>{describe(p)}</span>
            </li>
          ))}
        </ul>
      ) : null}
      <button type="button" className={styles.btn} onClick={() => void load()}>
        Refresh
      </button>
    </div>
  );
}
