import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { MermaidDiagrams } from '@/components/MermaidDiagrams';
import { StudioShell } from '@/components/StudioShell';
import { loadDoc } from '@/server/docs';
import { getStudioContext } from '@/server/repository';
import { studioShellProps } from '../../shell-props';
import { uiFont } from '../../ui-font';
import { DocsSearch } from '../DocsSearch';
import styles from '../docs.module.css';

export const dynamic = 'force-dynamic';

export default async function DocPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const context = await getStudioContext();
  if (!context) redirect(`/login?next=${encodeURIComponent(`/studio/docs/${slug}`)}`);
  const [doc, shellProps] = await Promise.all([loadDoc(slug), studioShellProps(context)]);
  if (!doc) notFound();
  return (
    <div className={uiFont.variable}>
      <StudioShell active="docs" {...shellProps} search={<DocsSearch />}>
        <div className={styles.layout}>
          <nav className={styles.sidebar} aria-label="Documentation">
            <Link href="/studio/docs" className={styles.sidebarTitle}>
              Documentation
            </Link>
            {(['Features', 'Reference'] as const).map((group) => (
              <div key={group}>
                <p className={styles.groupTitle}>{group}</p>
                <ul className={styles.navList}>
                  {doc.docs
                    .filter((d) => d.group === group)
                    .map((d) => (
                      <li key={d.slug}>
                        <Link
                          href={`/studio/docs/${d.slug}`}
                          aria-current={d.slug === slug ? 'page' : undefined}
                        >
                          {d.title}
                        </Link>
                      </li>
                    ))}
                </ul>
              </div>
            ))}
          </nav>
          <article className={styles.prose} dangerouslySetInnerHTML={{ __html: doc.html }} />
          {doc.toc.length > 0 ? (
            <nav className={styles.tocCol} aria-label="On this page">
              <p className={styles.sidebarTitle}>On this page</p>
              <ul className={styles.toc}>
                {doc.toc.map((h) => (
                  <li key={h.id} data-depth={h.depth}>
                    <a href={`#${h.id}`}>{h.text}</a>
                  </li>
                ))}
              </ul>
            </nav>
          ) : null}
        </div>
      </StudioShell>
      <MermaidDiagrams />
    </div>
  );
}
