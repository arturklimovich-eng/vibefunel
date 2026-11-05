import { redirect } from 'next/navigation';
import { StudioDashboard } from '@/components/StudioDashboard';
import { aiBriefOptions } from '@/server/ai/registry';
import { withoutExpiredAiDrafts } from '@/server/ai/runs';
import { getStudioContext } from '@/server/repository';
import { loadStudioOverview, parseRange } from '@/server/studio-overview';
import { uiFont } from './ui-font';

export const dynamic = 'force-dynamic';

export default async function StudioPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const context = await getStudioContext();
  if (!context) redirect('/login?next=%2Fstudio');
  const query = await searchParams;
  const [listed, groups] = await Promise.all([
    context.repo.listFunnels(),
    context.repo.listGroups(),
  ]);
  const funnels = await withoutExpiredAiDrafts(context.repo, listed);
  const overview = await loadStudioOverview(context.repo, funnels, parseRange(query.range));
  return (
    <div className={uiFont.variable}>
      <StudioDashboard
        overview={overview}
        groups={groups}
        aiBrief={aiBriefOptions()}
        storage={context.storage}
        userEmail={context.userEmail}
      />
    </div>
  );
}
