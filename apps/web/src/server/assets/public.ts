import 'server-only';
import type { Asset } from '../funnel-repository';

export interface PublicAsset {
  id: string;
  url: string;
  width: number;
  height: number;
  source: Asset['source'];
  prompt: string | null;
}

export function publicAsset(asset: Asset, request: Request): PublicAsset {
  return {
    id: asset.id,
    url: new URL(asset.url, request.url).toString(),
    width: asset.width,
    height: asset.height,
    source: asset.source,
    prompt: asset.prompt,
  };
}
