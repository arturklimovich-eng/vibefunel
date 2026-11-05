import 'server-only';
import type { ImageSession } from '../ai/guards';
import type { ImageAspect } from '../ai/types';
import type { Asset } from '../funnel-repository';
import type { StudioContext } from '../repository';
import { toWebp } from './process';

export async function generateAsset(
  context: StudioContext,
  session: ImageSession,
  input: { prompt: string; aspect: ImageAspect; funnelId: string | null; signal?: AbortSignal },
): Promise<Asset> {
  const image = await session.generate({
    prompt: input.prompt,
    aspect: input.aspect,
    signal: input.signal,
  });
  const processed = await toWebp(image.bytes);
  return context.repo.storeAsset({
    projectId: session.projectId,
    funnelId: input.funnelId,
    data: processed.bytes,
    width: processed.width,
    height: processed.height,
    source: 'ai',
    prompt: input.prompt,
    model: `${session.model.ref.provider}:${session.model.ref.model}`,
  });
}
