import 'server-only';
import sharp from 'sharp';

export const MAX_ASSET_SIDE = 1600;
export const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;
export const ASSET_MIME = 'image/webp';

export class InvalidImageError extends Error {
  constructor() {
    super('The file is not a supported image.');
    this.name = 'InvalidImageError';
  }
}

export interface ProcessedImage {
  bytes: Buffer;
  width: number;
  height: number;
}

export async function toWebp(input: Uint8Array): Promise<ProcessedImage> {
  try {
    const { data, info } = await sharp(input, { limitInputPixels: 50_000_000 })
      .rotate()
      .resize({
        width: MAX_ASSET_SIDE,
        height: MAX_ASSET_SIDE,
        fit: 'inside',
        withoutEnlargement: true,
      })
      .webp({ quality: 82, effort: 4 })
      .toBuffer({ resolveWithObject: true });
    return { bytes: data, width: info.width, height: info.height };
  } catch {
    throw new InvalidImageError();
  }
}
