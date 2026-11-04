import { NavLink as Link } from '@/components/NavPending';
import { redirect } from 'next/navigation';
import { StudioShell } from '@/components/StudioShell';
import { listDocs } from '@/server/docs';
import { getStudioContext } from '@/server/repository';
import { studioShellProps } from '../shell-props';
import { uiFont } from '../ui-font';
import { DocsSearch } from './DocsSearch';
import styles from './docs.module.css';

export const dynamic = 'force-dynamic';

export default async function DocsIndexPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const context = await getStudioContext();
  if (!context) redirect('/login?next=%2Fstudio%2Fdocs');
  const params = await searchParams;
  const raw = Array.isArray(params.q) ? params.q[0] : params.q;
  const query = raw?.trim() ?? '';
  const [docs, shellProps] = await Promise.all([listDocs(), studioShellProps(context)]);
  const needle = query.toLowerCase();
  const matches = needle
    ? docs.filter(
        (d) => d.title.toLowerCase().includes(needle) || d.summary.toLowerCase().includes(needle),
      )
    : docs;
  return (
    <div className={uiFont.variable}>
      <StudioShell active="docs" {...shellProps} search={<DocsSearch query={query} />}>
        <main className={styles.index}>
          <h1 className={styles.title}>Documentation</h1>
          <p className={styles.subtitle}>
            Rendered from <code>README.md</code> and <code>docs/*.md</code> in the repository.
            Features are graphs you can click through, step by step; Reference holds the full
            technical documents.
          </p>
          {query ? (
            <p className={styles.resultNote}>
              {matches.length} result{matches.length === 1 ? '' : 's'} for “{query}” ·{' '}
              <Link href="/studio/docs">Clear</Link>
            </p>
          ) : null}
          {(['Features', 'Reference'] as const).map((group) => {
            const items = matches.filter((d) => d.group === group);
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
      </StudioShell>
    </div>
  );
}
