import { briefSchema, outlineSchema } from '@funnel/schema';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { randomId } from '@/lib/ids';
import { generateFunnel } from '@/server/ai/brief';
import type { BriefEvent, MakeImage } from '@/server/ai/brief';
import { companionImageSession, openAiSession } from '@/server/ai/guards';
import { AI_DRAFT_TTL_MS, startAiRun } from '@/server/ai/runs';
import { AiError } from '@/server/ai/types';
import { withStudio } from '@/server/api-helpers';
import { generateAsset } from '@/server/assets/generate';
import { publicAsset } from '@/server/assets/public';
import { parseJsonBody } from '@/server/parse-body';

export const dynamic = 'force-dynamic';

const bodySchema = z.object({
  brief: briefSchema,
  outline: outlineSchema,
  groupId: z.string().min(1).max(100).nullable().optional(),
  runId: z.uuid(),
});

const HEARTBEAT_MS = 15_000;

function slugFrom(name: string): string {
  const base = name
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40);
  return `${base.length >= 3 ? base : 'ai-funnel'}-${randomId(6)}`;
}

type StreamEvent =
  | BriefEvent
  | { type: 'done'; funnelId: string; warnings: number; failedScreens: string[] }
  | { type: 'error'; error: string; message: string };

export function POST(request: Request) {
  return withStudio(async (context) => {
    const body = await parseJsonBody(request, bodySchema, 64 * 1024);
    if (!body.ok) return body.response;
    const { brief, outline } = body.data;
    const groupId = body.data.groupId ?? null;
    const run = startAiRun(body.data.runId, context.userEmail ?? 'local');
    if (!run) return NextResponse.json({ error: 'run_exists' }, { status: 409 });
    let opened: Awaited<ReturnType<typeof openAiSession>>;
    let imageSession: Awaited<ReturnType<typeof companionImageSession>>;
    try {
      opened = await openAiSession(context, request, 'brief', { groupId });
      imageSession =
        opened.ok && brief.images ? await companionImageSession(context, opened.session) : null;
    } catch (error) {
      run.finish();
      throw error;
    }
    if (!opened.ok) {
      run.finish();
      return opened.response;
    }
    const { session } = opened;
    const makeImage: MakeImage | undefined = imageSession
      ? async (prompt, aspect, signal) => {
          const asset = await generateAsset(context, imageSession, {
            prompt,
            aspect,
            funnelId: null,
            signal,
          });
          return publicAsset(asset, request).url;
        }
      : undefined;
    const encoder = new TextEncoder();

    let open = true;
    const stream = new ReadableStream<Uint8Array>({
      cancel() {
        open = false;
      },
      async start(controller) {
        const send = (event: StreamEvent) => {
          if (!open) return;
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(event)}\n\n`));
        };
        const heartbeat = setInterval(() => {
          if (open) controller.enqueue(encoder.encode(': keep-alive\n\n'));
        }, HEARTBEAT_MS);
        try {
          const result = await generateFunnel(session, brief, outline, send, run.signal, makeImage);
          let funnelId: string | null = null;
          for (let attempt = 0; attempt < 3 && funnelId === null; attempt++) {
            try {
              const funnel = await context.repo.createFunnel(
                outline.name,
                slugFrom(outline.name),
                groupId,
                result.definition,
                new Date(Date.now() + AI_DRAFT_TTL_MS),
              );
              funnelId = funnel.id;
            } catch (error) {
              if (!(error instanceof Error) || error.name !== 'SlugTakenError') throw error;
            }
          }
          if (funnelId === null) throw new AiError('provider_error', 'Could not pick a free slug.');
          send({
            type: 'done',
            funnelId,
            warnings: result.warnings.length,
            failedScreens: result.failedScreens,
          });
        } catch (error) {
          const code = error instanceof AiError ? error.code : 'internal_error';
          const message = error instanceof AiError ? error.message : 'Generation failed.';
          if (!(error instanceof AiError)) console.error('[ai/brief/generate]', error);
          send({ type: 'error', error: code, message });
        } finally {
          run.finish();
          clearInterval(heartbeat);
          if (open) {
            open = false;
            controller.close();
          }
        }
      },
    });

    return new Response(stream, {
      headers: {
        'content-type': 'text/event-stream; charset=utf-8',
        'cache-control': 'no-cache, no-transform',
        'x-accel-buffering': 'no',
      },
    });
  });
}
