import { NextResponse } from 'next/server';
import { z } from 'zod';
import { withStudio } from '@/server/api-helpers';
import { parseJsonBody } from '@/server/parse-body';
import { publishFunnel } from '@/server/services/funnels';

export const dynamic = 'force-dynamic';

interface Context {
  params: Promise<{ id: string }>;
}

const publishSchema = z.object({ revision: z.number().int().positive() });

export function POST(request: Request, { params }: Context) {
  return withStudio(async (studio) => {
    const { id } = await params;
    const body = await parseJsonBody(request, publishSchema);
    if (!body.ok) return body.response;
    const result = await publishFunnel(studio, {
      funnelId: id,
      expectedRevision: body.data.revision,
    });
    return NextResponse.json(result);
  });
}
