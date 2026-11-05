import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { FunnelEditor } from '@/components/FunnelEditor';
import { aiChatEnabled, aiImagesEnabled, aiInlineEnabled } from '@/server/ai/registry';
import { getStudioContext } from '@/server/repository';
import { uiFont } from '../../ui-font';

export const dynamic = 'force-dynamic';

export default async function EditFunnelPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const [{ id }, query] = await Promise.all([params, searchParams]);
  const context = await getStudioContext();
  if (!context) redirect(`/login?next=${encodeURIComponent(`/studio/funnels/${id}`)}`);
  const { repo } = context;
  const [funnel, draft] = await Promise.all([repo.getFunnel(id), repo.getDraft(id)]);
  if (!funnel) notFound();
  if (funnel.aiDraftExpiresAt) await repo.markFunnelOpened(id);
  if (!draft) {
    return (
      <main style={{ padding: '3rem 1rem', textAlign: 'center' }} role="alert">
        <h1>Draft could not be loaded</h1>
        <p>The stored draft for this funnel is missing, corrupt or could not be migrated.</p>
        <Link href="/studio">Back to studio</Link>
      </main>
    );
  }
  return (
    <div className={uiFont.variable}>
      <FunnelEditor
        funnel={funnel}
        initialDefinition={draft.definition}
        initialRevision={draft.revision}
        initialMode={query.view === 'flow' ? 'flow' : 'editor'}
        aiInline={aiInlineEnabled()}
        aiImages={aiImagesEnabled()}
        aiChat={aiChatEnabled()}
      />
    </div>
  );
}
