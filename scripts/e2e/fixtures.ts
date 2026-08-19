/** Minimal real binaries for the media upload flow. */

import sharp from 'sharp';

/**
 * Realistic listing photo. A 1x1 pixel is rejected by the processing pipeline, so
 * fixtures must have plausible dimensions for the resize variants to be produced.
 */
export async function listingPhoto(): Promise<Buffer> {
  return sharp({
    create: {
      width: 1200,
      height: 900,
      channels: 3,
      background: { r: 30, g: 90, b: 180 },
    },
  })
    .jpeg({ quality: 80 })
    .toBuffer();
}

/** Smallest buffer carrying a valid MP4 `ftyp` box (isom brand). */
export const MP4_STUB = Buffer.concat([
  Buffer.from([0x00, 0x00, 0x00, 0x20]),
  Buffer.from('ftypisom'),
  Buffer.from([0x00, 0x00, 0x02, 0x00]),
  Buffer.from('isomiso2avc1mp41'),
]);
