'use client';

import { useCallback, useEffect, useState } from 'react';
import { z } from 'zod';
import { funnelRoutes, readJson } from '@/lib/api-routes';
import styles from './FunnelEditor.module.css';

const leadSchema = z.object({
  email: z.string(),
  consent: z.boolean(),
  screenId: z.string(),
  createdAt: z.string(),
});
const responseSchema = z.object({ leads: z.array(leadSchema) });

type Lead = z.infer<typeof leadSchema>;

function formatDate(value: string): string {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString();
}

export function LeadsPanel({ funnelId }: { funnelId: string }) {
  const [leads, setLeads] = useState<Lead[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const routes = funnelRoutes(funnelId);

  const load = useCallback(async () => {
    try {
      const res = await fetch(funnelRoutes(funnelId).leads, { cache: 'no-store' });
      if (res.status === 503) {
        setError('Lead storage is not configured on this server.');
        return;
      }
      if (!res.ok) {
        setError(`Leads could not be loaded (HTTP ${res.status}).`);
        return;
      }
      const parsed = responseSchema.safeParse(await readJson(res));
      if (!parsed.success) {
        setError('Leads response was not understood.');
        return;
      }
      setError(null);
      setLeads(parsed.data.leads);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Network error');
    }
  }, [funnelId]);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <div className={styles.panel}>
      <h2 className={styles.panelHeading}>Leads</h2>
      {error ? <p role="alert">{error}</p> : null}
      {leads === null && !error ? <p>Loading leads...</p> : null}
      {leads && leads.length === 0 ? <p>No leads yet.</p> : null}
      {leads && leads.length > 0 ? (
        <>
          <p>Latest {leads.length} leads. The CSV contains every lead of this funnel.</p>
          <div className={styles.tableScroll}>
            <table className={styles.dataTable}>
              <thead>
                <tr>
                  <th scope="col">Email</th>
                  <th scope="col">Consent</th>
                  <th scope="col">Screen</th>
                  <th scope="col">Captured</th>
                </tr>
              </thead>
              <tbody>
                {leads.map((lead) => (
                  <tr key={`${lead.createdAt}:${lead.email}:${lead.screenId}`}>
                    <td>{lead.email}</td>
                    <td>{lead.consent ? 'Yes' : 'No'}</td>
                    <td>{lead.screenId}</td>
                    <td>{formatDate(lead.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      ) : null}
      <div className={styles.row}>
        <button type="button" className={styles.btn} onClick={() => void load()}>
          Refresh
        </button>
        <a className={styles.btn} href={routes.leadsCsv} download>
          Download CSV
        </a>
      </div>
    </div>
  );
}
