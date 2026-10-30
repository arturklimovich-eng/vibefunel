import { redirect } from 'next/navigation';
import { resolveStorageMode } from '@/lib/storage-mode';
import { getStudioContext } from '@/server/repository';
import styles from '../studio/studio.module.css';
import { LoginForm } from './LoginForm';

export const dynamic = 'force-dynamic';

function firstValue(value: string | string[] | undefined): string {
  return Array.isArray(value) ? (value[0] ?? '') : (value ?? '');
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  if (resolveStorageMode() !== 'supabase') redirect('/studio');
  const { next } = await searchParams;
  const context = await getStudioContext();
  if (context) redirect('/studio');
  return (
    <main className={styles.narrow}>
      <h1>Sign in</h1>
      <p className={styles.muted}>Sign in or create an account to use the studio.</p>
      <LoginForm next={firstValue(next)} />
    </main>
  );
}
