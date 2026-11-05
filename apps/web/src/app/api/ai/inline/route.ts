import { NextResponse } from 'next/server';
import { aiErrorResponse, openAiSession } from '@/server/ai/guards';
import { inlineRequestSchema, runInlineEdit } from '@/server/ai/inline';
import { AiError } from '@/server/ai/types';
import { withStudio } from '@/server/api-helpers';
import { parseJsonBody } from '@/server/parse-body';

export const dynamic = 'force-dynamic';

export function POST(request: Request) {
  return withStudio(async (context) => {
    const body = await parseJsonBody(request, inlineRequestSchema, 256 * 1024);
    if (!body.ok) return body.response;
    const opened = await openAiSession(context, request, 'inline', {
      funnelId: body.data.funnelId,
    });
    if (!opened.ok) return opened.response;
    try {
      const variants = await runInlineEdit(opened.session, body.data, request.signal);
      return NextResponse.json({ variants });
    } catch (error) {
      if (error instanceof AiError) return aiErrorResponse(error);
      throw error;
    }
  });
}
