import 'server-only';
import type { StudioContext } from '@/server/repository';

export async function studioShellProps(context: StudioContext) {
  const [funnels, groups] = await Promise.all([
    context.repo.listFunnels(),
    context.repo.listGroups(),
  ]);
  return {
    storage: context.storage,
    userEmail: context.userEmail,
    funnelCount: funnels.length,
    liveCount: funnels.filter((f) => f.publishedVersionId !== null).length,
    groups,
  };
}
