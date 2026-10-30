import { NextResponse } from 'next/server';
import { withStudio } from '@/server/api-helpers';

export const dynamic = 'force-dynamic';

interface Context {
  params: Promise<{ id: string; domainId: string }>;
}

export function DELETE(_request: Request, { params }: Context) {
  return withStudio(async ({ repo }) => {
    const { id, domainId } = await params;
    await repo.removeDomain(id, domainId);
    return NextResponse.json({ ok: true });
  });
}
