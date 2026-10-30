import { notFound } from 'next/navigation';
import { FunnelRuntime } from '@/components/FunnelRuntime';
import { getPublishedReader } from '@/server/repository';
import { parseReturnParams } from '@/server/return-params';
import type { SearchParams } from '@/server/return-params';

export const dynamic = 'force-dynamic';

export default async function PublishedFunnelPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<SearchParams>;
}) {
  const { slug } = await params;
  const query = await searchParams;
  const published = await getPublishedReader().getPublishedBySlug(slug);
  if (!published) notFound();
  return (
    <FunnelRuntime
      funnelId={published.funnelId}
      projectId={published.projectId}
      funnelVersion={published.version}
      slug={slug}
      returning={parseReturnParams(query)}
      definition={published.definition}
    />
  );
}
