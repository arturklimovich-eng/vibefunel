import { NextResponse } from 'next/server';
import { z } from 'zod';
import { withStudio } from '@/server/api-helpers';
import { parseJsonBody } from '@/server/parse-body';

export const dynamic = 'force-dynamic';

const createSchema = z.object({ name: z.string().trim().min(1).max(80) });

export function GET() {
  return withStudio(async ({ repo }) => {
    const groups = await repo.listGroups();
    return NextResponse.json({ groups });
  });
}

export function POST(request: Request) {
  return withStudio(async ({ repo }) => {
    const body = await parseJsonBody(request, createSchema);
    if (!body.ok) return body.response;
    const group = await repo.createGroup(body.data.name);
    return NextResponse.json({ group }, { status: 201 });
  });
}
