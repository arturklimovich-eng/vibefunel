import { slugSchema } from '@funnel/schema';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { isValidEmail, normalizeEmail } from '@/lib/email';
import { isMissingServiceKey } from '@/lib/supabase/service';
import { resolveLeadTarget } from '@/server/leads/lead-target';
import { getLeadStore } from '@/server/leads/registry';
import { parseJsonBody } from '@/server/parse-body';
import { checkRateLimit, clientKey, ipLimit } from '@/server/payments/rate-limit';
import { runIdSchema, screenIdSchema } from '@/server/payments/types';
import { getPublishedReader } from '@/server/repository';

export const dynamic = 'force-dynamic';

const MAX_LEAD_BODY_BYTES = 4 * 1024;

const bodySchema = z.object({
  slug: slugSchema,
  runId: runIdSchema,
  screenId: screenIdSchema,
  blockId: z.string().min(1).max(100),
  email: z.string().max(320).refine(isValidEmail, 'Invalid email address.'),
  consent: z.boolean().default(false),
});

function rateLimited(retryAfterSeconds: number): NextResponse {
  return NextResponse.json(
    { error: 'rate_limited' },
    { status: 429, headers: { 'retry-after': String(retryAfterSeconds) } },
  );
}

export async function POST(request: Request) {
  const limit = checkRateLimit('leads', clientKey(request), ipLimit(request, 300, 30), 60_000);
  if (!limit.ok) return rateLimited(limit.retryAfterSeconds);

  const body = await parseJsonBody(request, bodySchema, MAX_LEAD_BODY_BYTES);
  if (!body.ok) return body.response;
  const { slug, runId, screenId, blockId, email, consent } = body.data;

  const perRun = checkRateLimit('leads-run', `${slug}:${runId}`, 10, 60_000);
  if (!perRun.ok) return rateLimited(perRun.retryAfterSeconds);

  try {
    const target = await resolveLeadTarget(getPublishedReader(), { slug, screenId, blockId });
    if (!target.ok) return NextResponse.json({ error: target.error }, { status: target.status });
    const consented = consent && target.consentLabel.length > 0;
    await getLeadStore().recordLead({
      projectId: target.projectId,
      funnelId: target.funnelId,
      version: target.version,
      runId,
      screenId,
      blockId,
      email: normalizeEmail(email),
      consent: consented,
      consentText: consented ? target.consentLabel : null,
    });
  } catch (error) {
    if (isMissingServiceKey(error)) {
      return NextResponse.json({ status: 'not_configured' }, { status: 503 });
    }
    throw error;
  }
  return new NextResponse(null, { status: 204 });
}
