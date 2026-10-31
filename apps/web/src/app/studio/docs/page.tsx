import Link from 'next/link';
import { redirect } from 'next/navigation';
import { StudioHeader } from '@/components/StudioHeader';
import { listDocs } from '@/server/docs';
import { getStudioContext } from '@/server/repository';
import styles from './docs.module.css';

export const dynamic = 'force-dynamic';

export default async function DocsIndexPage() {
  const context = await getStudioContext();
  if (!context) redirect('/login?next=%2Fstudio%2Fdocs');
  const docs = await listDocs();
  return (
    <>
      <StudioHeader storage={context.storage} userEmail={context.userEmail} />
      <main className={styles.index}>
        <h1>Documentation</h1>
        <p className={styles.muted}>
          Rendered from <code>README.md</code> and <code>docs/*.md</code> in the repository. Features are
          graphs you can click through, step by step; Reference holds the full technical documents.
        </p>
        {(['Features', 'Reference'] as const).map((group) => {
          const items = docs.filter((d) => d.group === group);
          if (items.length === 0) return null;
          return (
            <section key={group}>
              <h2 className={styles.groupHeading}>{group}</h2>
              <ul className={styles.cards}>
                {items.map((d) => (
                  <li key={d.slug}>
                    <Link href={`/studio/docs/${d.slug}`} className={styles.card}>
                      <strong>{d.title}</strong>
                      <span className={styles.muted}>{d.summary}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          );
        })}
      </main>
    </>
  );
}
