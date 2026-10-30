import { NextResponse } from 'next/server';
import { withStudio } from '@/server/api-helpers';

export const dynamic = 'force-dynamic';

interface Context {
  params: Promise<{ id: string }>;
}

export function GET(_request: Request, { params }: Context) {
  return withStudio(async ({ repo }) => {
    const { id } = await params;
    const funnel = await repo.getFunnel(id);
    if (!funnel) return NextResponse.json({ error: 'not_found' }, { status: 404 });
    const versions = await repo.listVersionSummaries(id);
    return NextResponse.json({
      liveVersionId: funnel.publishedVersionId,
      versions: versions.map((v) => ({ id: v.id, version: v.version, createdAt: v.createdAt })),
    });
  });
}
