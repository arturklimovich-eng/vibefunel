import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { FunnelEditor } from '@/components/FunnelEditor';
import { StudioHeader } from '@/components/StudioHeader';
import { getStudioContext } from '@/server/repository';

export const dynamic = 'force-dynamic';

export default async function EditFunnelPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const context = await getStudioContext();
  if (!context) redirect(`/login?next=${encodeURIComponent(`/studio/funnels/${id}`)}`);
  const { repo } = context;
  const [funnel, draft] = await Promise.all([repo.getFunnel(id), repo.getDraft(id)]);
  if (!funnel) notFound();
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
    <>
      <StudioHeader storage={context.storage} userEmail={context.userEmail} />
      <FunnelEditor
        funnel={funnel}
        initialDefinition={draft.definition}
        initialRevision={draft.revision}
      />
    </>
  );
}
