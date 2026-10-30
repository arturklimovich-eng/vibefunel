import Link from 'next/link';
import { redirect } from 'next/navigation';
import { DeleteFunnelButton } from '@/components/DeleteFunnelButton';
import { NewFunnelForm } from '@/components/NewFunnelForm';
import { StudioHeader } from '@/components/StudioHeader';
import { getStudioContext } from '@/server/repository';
import styles from './studio.module.css';

export const dynamic = 'force-dynamic';

export default async function StudioPage() {
  const context = await getStudioContext();
  if (!context) redirect('/login?next=%2Fstudio');
  const funnels = await context.repo.listFunnels();
  return (
    <>
      <StudioHeader storage={context.storage} userEmail={context.userEmail} />
      <main className={styles.container}>
        <h1>Funnels</h1>
        <NewFunnelForm />
        {funnels.length === 0 ? <p className={styles.muted}>No funnels yet.</p> : null}
        <ul className={styles.list}>
          {funnels.map((f) => (
            <li key={f.id} className={styles.item}>
              <div>
                <strong>{f.name}</strong>
                <div className={styles.muted}>
                  /{f.slug} - {f.status}
                </div>
              </div>
              <div className={styles.links}>
                <Link href={`/studio/funnels/${f.id}`}>Edit</Link>
                <Link href={`/preview/${f.id}`}>Preview</Link>
                {f.publishedVersionId ? <Link href={`/f/${f.slug}`}>Live</Link> : null}
                <DeleteFunnelButton funnelId={f.id} name={f.name} />
              </div>
            </li>
          ))}
        </ul>
      </main>
    </>
  );
}
