'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { funnelRoutes } from '@/lib/api-routes';
import styles from '@/app/studio/studio.module.css';

export function DeleteFunnelButton({ funnelId, name }: { funnelId: string; name: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const remove = async () => {
    if (!window.confirm(`Delete "${name}" and all of its versions? This cannot be undone.`)) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(funnelRoutes(funnelId).base, { method: 'DELETE' });
      if (!res.ok) {
        setError(`Delete failed (HTTP ${res.status}).`);
        return;
      }
      router.refresh();
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : 'Network error');
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <button
        type="button"
        className={styles.btnDanger}
        disabled={busy}
        onClick={() => void remove()}
      >
        Delete
      </button>
      {error ? <span role="alert">{error}</span> : null}
    </>
  );
}
