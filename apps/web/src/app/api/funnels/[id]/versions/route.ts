import { NextResponse } from 'next/server';
import { withStudio } from '@/server/api-helpers';
import { listVersions } from '@/server/services/funnels';

export const dynamic = 'force-dynamic';

interface Context {
  params: Promise<{ id: string }>;
}

export function GET(_request: Request, { params }: Context) {
  return withStudio(async (studio) => {
    const { id } = await params;
    return NextResponse.json(await listVersions(studio, { funnelId: id }));
  });
}
