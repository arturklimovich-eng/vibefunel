import 'server-only';
import { aiBriefOptions } from '@/server/ai/registry';
import { withoutExpiredAiDrafts } from '@/server/ai/runs';
import type { StudioContext } from '@/server/repository';

export async function studioShellProps(context: StudioContext) {
  const [listed, groups] = await Promise.all([
    context.repo.listFunnels(),
    context.repo.listGroups(),
  ]);
  const funnels = await withoutExpiredAiDrafts(context.repo, listed);
  return {
    storage: context.storage,
    userEmail: context.userEmail,
    funnelCount: funnels.length,
    liveCount: funnels.filter((f) => f.publishedVersionId !== null).length,
    groups,
    aiBrief: aiBriefOptions(),
  };
}
