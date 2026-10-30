import { notFound, redirect } from 'next/navigation';
import { FunnelRuntime } from '@/components/FunnelRuntime';
import { getStudioContext } from '@/server/repository';

export const dynamic = 'force-dynamic';

export default async function PreviewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const context = await getStudioContext();
  if (!context) redirect(`/login?next=${encodeURIComponent(`/preview/${id}`)}`);
  const draft = await context.repo.getDraft(id);
  if (!draft) notFound();
  return <FunnelRuntime funnelId={id} definition={draft.definition} label="Draft preview" />;
}
