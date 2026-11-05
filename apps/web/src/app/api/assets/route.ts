import { NextResponse } from 'next/server';
import { InvalidImageError, MAX_UPLOAD_BYTES, toWebp } from '@/server/assets/process';
import { publicAsset } from '@/server/assets/public';
import { withStudio } from '@/server/api-helpers';
import { checkRateLimit, clientKey } from '@/server/rate-limit';

export const dynamic = 'force-dynamic';

const UPLOADS_PER_HOUR = 60;
const FORM_OVERHEAD_BYTES = 64 * 1024;

export function GET(request: Request) {
  return withStudio(async (context) => {
    const funnelId = new URL(request.url).searchParams.get('funnelId') ?? '';
    const funnel = funnelId ? await context.repo.getFunnel(funnelId) : null;
    if (!funnel) return NextResponse.json({ error: 'not_found' }, { status: 404 });
    const assets = await context.repo.listAssets(funnel.projectId);
    return NextResponse.json(
      { assets: assets.map((a) => publicAsset(a, request)) },
      { headers: { 'cache-control': 'private, no-store' } },
    );
  });
}

export function POST(request: Request) {
  return withStudio(async (context) => {
    const declared = Number(request.headers.get('content-length'));
    if (!Number.isFinite(declared) || declared <= 0) {
      return NextResponse.json({ error: 'length_required' }, { status: 411 });
    }
    if (declared > MAX_UPLOAD_BYTES + FORM_OVERHEAD_BYTES) {
      return NextResponse.json({ error: 'too_large' }, { status: 413 });
    }
    const limit = checkRateLimit(
      'asset-upload',
      context.userEmail ?? clientKey(request),
      UPLOADS_PER_HOUR,
      60 * 60_000,
    );
    if (!limit.ok) {
      return NextResponse.json(
        { error: 'rate_limited' },
        { status: 429, headers: { 'retry-after': String(limit.retryAfterSeconds) } },
      );
    }
    let form: FormData;
    try {
      form = await request.formData();
    } catch {
      return NextResponse.json({ error: 'invalid_body' }, { status: 400 });
    }
    const file = form.get('file');
    const funnelId = form.get('funnelId');
    if (!(file instanceof File) || typeof funnelId !== 'string' || funnelId === '') {
      return NextResponse.json({ error: 'invalid_body' }, { status: 400 });
    }
    if (file.size === 0 || file.size > MAX_UPLOAD_BYTES) {
      return NextResponse.json({ error: 'too_large' }, { status: 413 });
    }
    const funnel = await context.repo.getFunnel(funnelId);
    if (!funnel) return NextResponse.json({ error: 'not_found' }, { status: 404 });
    try {
      const processed = await toWebp(new Uint8Array(await file.arrayBuffer()));
      const asset = await context.repo.storeAsset({
        projectId: funnel.projectId,
        funnelId: funnel.id,
        data: processed.bytes,
        width: processed.width,
        height: processed.height,
        source: 'upload',
        prompt: null,
        model: null,
      });
      return NextResponse.json({ asset: publicAsset(asset, request) });
    } catch (error) {
      if (error instanceof InvalidImageError) {
        return NextResponse.json({ error: 'invalid_image' }, { status: 415 });
      }
      throw error;
    }
  });
}
