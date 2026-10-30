import { notFound } from 'next/navigation';
import { FunnelRuntime } from '@/components/FunnelRuntime';
import { normalizeHostname } from '@/lib/hostname';
import { getPublishedReader } from '@/server/repository';
import { parseReturnParams } from '@/server/return-params';
import type { SearchParams } from '@/server/return-params';

export const dynamic = 'force-dynamic';

export default async function CustomDomainFunnelPage({
  params,
  searchParams,
}: {
  params: Promise<{ host: string }>;
  searchParams: Promise<SearchParams>;
}) {
  const { host } = await params;
  const hostname = normalizeHostname(host);
  if (hostname === null || hostname !== host) notFound();
  const published = await getPublishedReader().getPublishedByHost(hostname);
  if (!published) notFound();
  const query = await searchParams;
  return (
    <FunnelRuntime
      funnelId={published.funnelId}
      projectId={published.projectId}
      funnelVersion={published.version}
      slug={published.slug}
      returning={parseReturnParams(query)}
      definition={published.definition}
    />
  );
}
