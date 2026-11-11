import { NextResponse } from 'next/server';
import { forgetResolvedTokens } from '@/server/agent-auth';
import { withStudio } from '@/server/api-helpers';

export const dynamic = 'force-dynamic';

interface Context {
  params: Promise<{ id: string }>;
}

export function DELETE(_request: Request, { params }: Context) {
  return withStudio(async ({ tokens }) => {
    const { id } = await params;
    const revoked = await tokens.revoke(id);
    if (!revoked) return NextResponse.json({ error: 'not_found' }, { status: 404 });
    forgetResolvedTokens();
    return NextResponse.json({ ok: true });
  });
}
