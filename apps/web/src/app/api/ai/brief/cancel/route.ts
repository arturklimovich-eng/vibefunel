import { NextResponse } from 'next/server';
import { z } from 'zod';
import { cancelAiRun } from '@/server/ai/runs';
import { withStudio } from '@/server/api-helpers';
import { parseJsonBody } from '@/server/parse-body';

export const dynamic = 'force-dynamic';

const bodySchema = z.object({ runId: z.uuid() });

export function POST(request: Request) {
  return withStudio(async (context) => {
    const body = await parseJsonBody(request, bodySchema, 1024);
    if (!body.ok) return body.response;
    const cancelled = cancelAiRun(body.data.runId, context.userEmail ?? 'local');
    return NextResponse.json({ cancelled });
  });
}
