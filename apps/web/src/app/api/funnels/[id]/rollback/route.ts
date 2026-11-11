import { NextResponse } from 'next/server';
import { z } from 'zod';
import { withStudio } from '@/server/api-helpers';
import { parseJsonBody } from '@/server/parse-body';
import { rollbackFunnel } from '@/server/services/funnels';

export const dynamic = 'force-dynamic';

interface Context {
  params: Promise<{ id: string }>;
}

const rollbackSchema = z.object({ versionId: z.string().min(1).max(200) });

export function POST(request: Request, { params }: Context) {
  return withStudio(async (studio) => {
    const { id } = await params;
    const body = await parseJsonBody(request, rollbackSchema);
    if (!body.ok) return body.response;
    const funnel = await rollbackFunnel(studio, { funnelId: id, versionId: body.data.versionId });
    return NextResponse.json({ funnel });
  });
}
