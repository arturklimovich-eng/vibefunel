import { NextResponse } from 'next/server';
import { withStudio } from '@/server/api-helpers';

export const dynamic = 'force-dynamic';

interface Context {
  params: Promise<{ id: string }>;
}

export function DELETE(_request: Request, { params }: Context) {
  return withStudio(async ({ repo }) => {
    const { id } = await params;
    await repo.deleteFunnel(id);
    return NextResponse.json({ ok: true });
  });
}
