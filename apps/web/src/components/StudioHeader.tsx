import Link from 'next/link';
import { signOut } from '@/app/auth/actions';
import type { StorageMode } from '@/lib/storage-mode';
import styles from '@/app/studio/studio.module.css';

export function StudioHeader({
  storage,
  userEmail,
}: {
  storage: StorageMode;
  userEmail: string | null;
}) {
  return (
    <header className={styles.header}>
      <Link href="/studio" className={styles.brand}>
        Funnel Studio
      </Link>
      <div className={styles.links}>
        <span className={styles.badge} data-storage={storage}>
          Storage: {storage === 'supabase' ? 'Supabase' : 'local files (dev)'}
        </span>
        {userEmail ? <span className={styles.muted}>{userEmail}</span> : null}
        {storage === 'supabase' ? (
          <form action={signOut}>
            <button type="submit" className={styles.btn}>
              Sign out
            </button>
          </form>
        ) : null}
      </div>
    </header>
  );
}
