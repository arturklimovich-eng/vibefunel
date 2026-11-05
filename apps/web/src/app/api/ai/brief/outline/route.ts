import { briefSchema } from '@funnel/schema';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { generateOutline } from '@/server/ai/brief';
import { aiErrorResponse, openAiSession } from '@/server/ai/guards';
import { AiError } from '@/server/ai/types';
import { withStudio } from '@/server/api-helpers';
import { parseJsonBody } from '@/server/parse-body';

export const dynamic = 'force-dynamic';

const bodySchema = z.object({
  brief: briefSchema,
  groupId: z.string().min(1).max(100).nullable().optional(),
});

export function POST(request: Request) {
  return withStudio(async (context) => {
    const body = await parseJsonBody(request, bodySchema, 16 * 1024);
    if (!body.ok) return body.response;
    const opened = await openAiSession(context, request, 'brief', {
      groupId: body.data.groupId ?? null,
    });
    if (!opened.ok) return opened.response;
    try {
      const outline = await generateOutline(opened.session, body.data.brief, request.signal);
      return NextResponse.json({ outline });
    } catch (error) {
      if (error instanceof AiError) return aiErrorResponse(error);
      throw error;
    }
  });
}
