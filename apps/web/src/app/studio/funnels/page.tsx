import { redirect } from 'next/navigation';
import { StudioFunnels } from '@/components/StudioFunnels';
import { getStudioContext } from '@/server/repository';
import { loadStudioOverview, parseRange } from '@/server/studio-overview';
import { uiFont } from '../ui-font';

export const dynamic = 'force-dynamic';

function first(value: string | string[] | undefined): string {
  return (Array.isArray(value) ? value[0] : value)?.trim() ?? '';
}

export default async function StudioFunnelsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const context = await getStudioContext();
  if (!context) redirect('/login?next=%2Fstudio%2Ffunnels');
  const query = await searchParams;
  const [funnels, groups] = await Promise.all([
    context.repo.listFunnels(),
    context.repo.listGroups(),
  ]);
  const overview = await loadStudioOverview(context.repo, funnels, parseRange(query.range));
  return (
    <div className={uiFont.variable}>
      <StudioFunnels
        funnels={overview.funnels}
        groups={groups}
        range={overview.range}
        storage={context.storage}
        userEmail={context.userEmail}
        liveCount={overview.liveCount}
        initialQuery={first(query.q)}
        initialFilter={first(query.project) || 'all'}
      />
    </div>
  );
}
