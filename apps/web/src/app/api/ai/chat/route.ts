import { NextResponse } from 'next/server';
import { chatRequestSchema, runChat } from '@/server/ai/chat';
import { aiErrorResponse, openAiSession } from '@/server/ai/guards';
import { AiError } from '@/server/ai/types';
import { withStudio } from '@/server/api-helpers';
import { parseJsonBody } from '@/server/parse-body';
import { loadFunnelMetrics } from '@/server/studio-overview';

const METRICS_DAYS = 30;

export const dynamic = 'force-dynamic';

export function POST(request: Request) {
  return withStudio(async (context) => {
    const body = await parseJsonBody(request, chatRequestSchema, 2 * 1024 * 1024);
    if (!body.ok) return body.response;
    const opened = await openAiSession(context, request, 'chat', { funnelId: body.data.funnelId });
    if (!opened.ok) return opened.response;
    try {
      const result = await runChat(opened.session, body.data, request.signal);
      const metrics = result.cards.some((c) => c.kind === 'metrics')
        ? await loadFunnelMetrics(opened.session.projectId, body.data.funnelId, METRICS_DAYS)
        : null;
      return NextResponse.json({ ...result, metrics });
    } catch (error) {
      if (error instanceof AiError) return aiErrorResponse(error);
      throw error;
    }
  });
}
