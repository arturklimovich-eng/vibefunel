'use client';

import { useCallback, useEffect, useState } from 'react';
import { z } from 'zod';
import { funnelRoutes } from '@/lib/api-routes';
import styles from './FunnelEditor.module.css';

const versionsResponseSchema = z.object({
  liveVersionId: z.string().nullable(),
  versions: z.array(z.object({ id: z.string(), version: z.number().int(), createdAt: z.string() })),
});

type VersionsResponse = z.infer<typeof versionsResponseSchema>;

function formatDate(value: string): string {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString();
}

export function VersionsPanel({ funnelId, refreshKey }: { funnelId: string; refreshKey: number }) {
  const [data, setData] = useState<VersionsResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = useCallback(async (): Promise<VersionsResponse | string> => {
    try {
      const res = await fetch(funnelRoutes(funnelId).versions, { cache: 'no-store' });
      if (!res.ok) return `Versions could not be loaded (HTTP ${res.status}).`;
      const parsed = versionsResponseSchema.safeParse(await res.json());
      return parsed.success ? parsed.data : 'Versions response was not understood.';
    } catch (loadError) {
      return loadError instanceof Error ? loadError.message : 'Network error';
    }
  }, [funnelId]);

  useEffect(() => {
    let cancelled = false;
    void load().then((result) => {
      if (cancelled) return;
      if (typeof result === 'string') {
        setError(result);
        return;
      }
      setError(null);
      setData(result);
    });
    return () => {
      cancelled = true;
    };
  }, [load, refreshKey]);

  const makeLive = async (versionId: string, versionNumber: number) => {
    if (
      !window.confirm(
        `Make version ${versionNumber} the live version? Visitors will see it immediately.`,
      )
    )
      return;
    setBusyId(versionId);
    setError(null);
    try {
      const res = await fetch(funnelRoutes(funnelId).rollback, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ versionId }),
      });
      if (!res.ok) {
        setError(`Could not switch the live version (HTTP ${res.status}).`);
        return;
      }
      const result = await load();
      if (typeof result === 'string') setError(result);
      else setData(result);
    } catch (rollbackError) {
      setError(rollbackError instanceof Error ? rollbackError.message : 'Network error');
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className={styles.panel}>
      <h2 className={styles.panelHeading}>Versions</h2>
      {error ? <p role="alert">{error}</p> : null}
      {data === null && !error ? <p>Loading versions...</p> : null}
      {data && data.versions.length === 0 ? <p>Nothing published yet.</p> : null}
      {data && data.versions.length > 0 ? (
        <ul className={styles.edgeList}>
          {data.versions.map((v) => {
            const live = v.id === data.liveVersionId;
            return (
              <li key={v.id} className={styles.row}>
                <span>
                  <strong>v{v.version}</strong> - {formatDate(v.createdAt)}
                </span>
                {live ? (
                  <strong aria-label="Currently live">Live</strong>
                ) : (
                  <button
                    type="button"
                    className={styles.btn}
                    disabled={busyId !== null}
                    onClick={() => void makeLive(v.id, v.version)}
                  >
                    Make live
                  </button>
                )}
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}
