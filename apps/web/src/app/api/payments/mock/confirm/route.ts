import { slugSchema } from '@funnel/schema';
import { randomBytes } from 'node:crypto';
import { z } from 'zod';
import { isMockEnabled } from '@/server/payments/mock-provider';
import { resolveCheckoutTarget } from '@/server/payments/checkout-target';
import { formatPrice } from '@/server/payments/plans';
import { planKeySchema, runIdSchema, screenIdSchema } from '@/server/payments/types';
import { getPublishedReader } from '@/server/repository';

export const dynamic = 'force-dynamic';

const querySchema = z.object({
  runId: runIdSchema,
  screenId: screenIdSchema,
  planKey: planKeySchema,
  slug: slugSchema,
  payer: z.string().regex(/^[a-f0-9]{64}$/),
  analytics: z.enum(['0', '1']).default('0'),
});

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function page(status: number, body: string): Response {
  const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="robots" content="noindex"><title>Mock payment (development only)</title><style>body{font-family:system-ui,sans-serif;max-width:32rem;margin:2rem auto;padding:0 1rem;color:#111}.banner{background:#b91c1c;color:#fff;padding:.75rem 1rem;border-radius:8px;font-weight:700}button{font:inherit;padding:.75rem 1rem;border-radius:8px;border:0;cursor:pointer;margin:.25rem .25rem 0 0}.ok{background:#15803d;color:#fff}.fail{background:#374151;color:#fff}</style></head><body>${body}</body></html>`;
  return new Response(html, {
    status,
    headers: {
      'content-type': 'text/html; charset=utf-8',
      'cache-control': 'no-store',
      'content-security-policy':
        "default-src 'none'; style-src 'unsafe-inline'; form-action 'self'; frame-ancestors 'none'; base-uri 'none'",
    },
  });
}

function hidden(name: string, value: string): string {
  return `<input type="hidden" name="${name}" value="${escapeHtml(value)}">`;
}

export async function GET(request: Request) {
  if (!isMockEnabled()) return new Response('Not found', { status: 404 });
  const params = new URL(request.url).searchParams;
  const parsed = querySchema.safeParse(Object.fromEntries(params.entries()));
  if (!parsed.success) {
    return page(
      400,
      '<div class="banner">MOCK PAYMENT - DEVELOPMENT ONLY</div><p>Invalid request.</p>',
    );
  }
  const { runId, screenId, planKey, slug, payer, analytics } = parsed.data;
  const target = await resolveCheckoutTarget(getPublishedReader(), { slug, screenId, planKey });
  if (!target.ok) {
    return page(
      target.status,
      `<div class="banner">MOCK PAYMENT - DEVELOPMENT ONLY</div><p>Cannot start: ${escapeHtml(target.error)}.</p>`,
    );
  }
  const suffix = randomBytes(12).toString('hex');
  const fields = [
    hidden('slug', slug),
    hidden('screenId', screenId),
    hidden('runId', runId),
    hidden('planKey', planKey),
    hidden('payer', payer),
    hidden('analytics', analytics),
    hidden('eventId', `mock_evt_${suffix}`),
    hidden('providerRef', `mock_ref_${suffix}`),
  ].join('');
  const price = formatPrice(target.plan.amount, target.plan.currency);
  return page(
    200,
    `<div class="banner">MOCK PAYMENT - DEVELOPMENT ONLY. No money moves and no card is involved.</div><h1>${escapeHtml(target.plan.title)}</h1><p>${escapeHtml(price)}</p><form method="post" action="/api/payments/mock/webhook">${fields}<button class="ok" type="submit" name="outcome" value="success">Simulate successful payment</button><button class="fail" type="submit" name="outcome" value="failure">Simulate failure</button></form>`,
  );
}
