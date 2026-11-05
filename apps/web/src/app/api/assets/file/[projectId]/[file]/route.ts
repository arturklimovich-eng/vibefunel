import { NextResponse } from 'next/server';
import { resolveStorageMode } from '@/lib/storage-mode';
import { getFileRepository } from '@/server/repository';

export const dynamic = 'force-dynamic';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ projectId: string; file: string }> },
) {
  if (resolveStorageMode() !== 'file') return new NextResponse(null, { status: 404 });
  const { projectId, file } = await params;
  const data = await getFileRepository().readAssetFile(projectId, file);
  if (!data) return new NextResponse(null, { status: 404 });
  return new NextResponse(new Uint8Array(data), {
    headers: {
      'content-type': 'image/webp',
      'cache-control': 'public, max-age=31536000, immutable',
      'x-content-type-options': 'nosniff',
    },
  });
}
