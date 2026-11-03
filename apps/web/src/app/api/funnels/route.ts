import { slugSchema } from '@funnel/schema';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { withStudio } from '@/server/api-helpers';
import { parseJsonBody } from '@/server/parse-body';

export const dynamic = 'force-dynamic';

const createSchema = z.object({
  name: z.string().trim().min(1).max(200),
  slug: slugSchema,
  groupId: z.string().min(1).max(100).nullable().optional(),
});

export function GET() {
  return withStudio(async ({ repo }) => {
    const funnels = await repo.listFunnels();
    return NextResponse.json({ funnels });
  });
}

export function POST(request: Request) {
  return withStudio(async ({ repo }) => {
    const body = await parseJsonBody(request, createSchema);
    if (!body.ok) return body.response;
    const funnel = await repo.createFunnel(
      body.data.name,
      body.data.slug,
      body.data.groupId ?? null,
    );
    return NextResponse.json({ funnel }, { status: 201 });
  });
}
