import { NextResponse } from 'next/server';
import { z } from 'zod';
import { generateAsset } from '@/server/assets/generate';
import { publicAsset } from '@/server/assets/public';
import { aiErrorResponse, openImageSession } from '@/server/ai/guards';
import { AiError, IMAGE_ASPECTS } from '@/server/ai/types';
import { withStudio } from '@/server/api-helpers';
import { parseJsonBody } from '@/server/parse-body';

export const dynamic = 'force-dynamic';

const bodySchema = z.object({
  funnelId: z.string().min(1).max(100),
  prompt: z.string().trim().min(3).max(1000),
  aspect: z.enum(IMAGE_ASPECTS),
});

export function POST(request: Request) {
  return withStudio(async (context) => {
    const body = await parseJsonBody(request, bodySchema, 8 * 1024);
    if (!body.ok) return body.response;
    const opened = await openImageSession(context, request, { funnelId: body.data.funnelId });
    if (!opened.ok) return opened.response;
    const { session } = opened;
    try {
      const asset = await generateAsset(context, session, {
        prompt: body.data.prompt,
        aspect: body.data.aspect,
        funnelId: body.data.funnelId,
        signal: request.signal,
      });
      return NextResponse.json({ asset: publicAsset(asset, request) });
    } catch (error) {
      if (error instanceof AiError) return aiErrorResponse(error);
      throw error;
    }
  });
}
