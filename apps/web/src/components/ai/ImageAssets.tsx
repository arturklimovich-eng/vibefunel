'use client';

import { createContext, useContext, useMemo, useRef } from 'react';
import type { ReactNode } from 'react';
import { z } from 'zod';
import { AI_ROUTES, readJson } from '@/lib/api-routes';
import { errorText } from './errors';

export const IMAGE_ASPECTS = ['1:1', '3:4', '4:3', '9:16', '16:9'] as const;
export type ImageAspect = (typeof IMAGE_ASPECTS)[number];

const assetSchema = z.object({
  id: z.string(),
  url: z.string(),
  width: z.number(),
  height: z.number(),
  source: z.enum(['ai', 'upload']),
  prompt: z.string().nullable(),
});
export type LibraryAsset = z.infer<typeof assetSchema>;

const oneSchema = z.object({ asset: assetSchema });
const listSchema = z.object({ assets: z.array(assetSchema) });
const errorSchema = z.object({ error: z.string(), message: z.string().optional() });

const UPLOAD_ERRORS: Record<string, string> = {
  too_large: 'The file is larger than 10 MB.',
  invalid_image: 'This file is not an image we can use (JPEG, PNG, WebP, GIF, AVIF).',
};

export class AssetError extends Error {}

async function readAsset(res: Response): Promise<LibraryAsset> {
  const raw = await readJson(res);
  if (!res.ok) {
    const parsed = errorSchema.safeParse(raw);
    const code = parsed.success ? parsed.data.error : `http_${res.status}`;
    throw new AssetError(
      UPLOAD_ERRORS[code] ?? errorText(code, parsed.success ? parsed.data.message : undefined),
    );
  }
  const parsed = oneSchema.safeParse(raw);
  if (!parsed.success) throw new AssetError('The server returned an unexpected answer.');
  return parsed.data.asset;
}

interface ImageAssetsValue {
  canGenerate: boolean;
  library(): Promise<LibraryAsset[]>;
  upload(file: File): Promise<LibraryAsset>;
  generate(prompt: string, aspect: ImageAspect, signal: AbortSignal): Promise<LibraryAsset>;
}

const ImageAssetsContext = createContext<ImageAssetsValue | null>(null);

export function useImageAssets(): ImageAssetsValue | null {
  return useContext(ImageAssetsContext);
}

export function ImageAssetsProvider({
  funnelId,
  canGenerate,
  children,
}: {
  funnelId: string;
  canGenerate: boolean;
  children: ReactNode;
}) {
  const cache = useRef<Promise<LibraryAsset[]> | null>(null);

  const value = useMemo<ImageAssetsValue>(() => {
    const remember = async (asset: LibraryAsset) => {
      if (cache.current) {
        const list = await cache.current.catch(() => []);
        cache.current = Promise.resolve([asset, ...list.filter((a) => a.id !== asset.id)]);
      }
      return asset;
    };
    return {
      canGenerate,
      library() {
        if (!cache.current) {
          cache.current = fetch(`${AI_ROUTES.assets}?funnelId=${encodeURIComponent(funnelId)}`)
            .then(async (res) => {
              const parsed = listSchema.safeParse(await readJson(res));
              if (!res.ok || !parsed.success) throw new AssetError('Could not load the library.');
              return parsed.data.assets;
            })
            .catch((error: unknown) => {
              cache.current = null;
              throw error;
            });
        }
        return cache.current;
      },
      async upload(file) {
        const form = new FormData();
        form.set('funnelId', funnelId);
        form.set('file', file);
        return remember(
          await readAsset(await fetch(AI_ROUTES.assets, { method: 'POST', body: form })),
        );
      },
      async generate(prompt, aspect, signal) {
        const res = await fetch(AI_ROUTES.images, {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ funnelId, prompt, aspect }),
          signal,
        });
        return remember(await readAsset(res));
      },
    };
  }, [funnelId, canGenerate]);

  return <ImageAssetsContext.Provider value={value}>{children}</ImageAssetsContext.Provider>;
}
