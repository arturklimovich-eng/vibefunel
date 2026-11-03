import { NextResponse } from 'next/server';
import { z } from 'zod';
import { withStudio } from '@/server/api-helpers';
import { parseJsonBody } from '@/server/parse-body';

export const dynamic = 'force-dynamic';

interface Context {
  params: Promise<{ id: string }>;
}

const moveSchema = z.object({ groupId: z.string().min(1).max(100).nullable() });

export function PATCH(request: Request, { params }: Context) {
  return withStudio(async ({ repo }) => {
    const { id } = await params;
    const body = await parseJsonBody(request, moveSchema);
    if (!body.ok) return body.response;
    const funnel = await repo.moveFunnel(id, body.data.groupId);
    return NextResponse.json({ funnel });
  });
}

export function DELETE(_request: Request, { params }: Context) {
  return withStudio(async ({ repo }) => {
    const { id } = await params;
    await repo.deleteFunnel(id);
    return NextResponse.json({ ok: true });
  });
}
