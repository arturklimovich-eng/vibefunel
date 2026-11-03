import { NextResponse } from 'next/server';
import { z } from 'zod';
import { withStudio } from '@/server/api-helpers';
import { parseJsonBody } from '@/server/parse-body';

export const dynamic = 'force-dynamic';

interface Context {
  params: Promise<{ id: string }>;
}

const renameSchema = z.object({ name: z.string().trim().min(1).max(80) });

export function PATCH(request: Request, { params }: Context) {
  return withStudio(async ({ repo }) => {
    const { id } = await params;
    const body = await parseJsonBody(request, renameSchema);
    if (!body.ok) return body.response;
    const group = await repo.renameGroup(id, body.data.name);
    return NextResponse.json({ group });
  });
}

export function DELETE(_request: Request, { params }: Context) {
  return withStudio(async ({ repo }) => {
    const { id } = await params;
    await repo.deleteGroup(id);
    return NextResponse.json({ ok: true });
  });
}
