import sharp from 'sharp';
import { Types } from 'mongoose';
import { EMediaAssetStatus } from '../../domain/media/entity/enums/EMediaAssetStatus';
import { EMediaBucketClass } from '../../domain/media/entity/enums/EMediaBucketClass';
import { EMediaPurpose } from '../../domain/media/entity/enums/EMediaPurpose';
import { IMediaAsset } from '../../domain/media/entity/interfaces/media-asset.interface';

export const validMediaAssetMock = (
  override?: Partial<IMediaAsset>,
): IMediaAsset => ({
  id: new Types.ObjectId().toHexString(),
  purpose: EMediaPurpose.LISTING,
  ownerId: new Types.ObjectId().toHexString(),
  status: EMediaAssetStatus.PENDING_UPLOAD,
  contentType: 'image/jpeg',
  byteSize: 1024,
  originalKey: 'public/listing/owner/id/original',
  bucketClass: EMediaBucketClass.PUBLIC,
  variants: [],
  createdAt: new Date(),
  ...override,
});

export async function createTestPng(width = 400, height = 400): Promise<Buffer> {
  return sharp({
    create: {
      width,
      height,
      channels: 3,
      background: { r: 200, g: 40, b: 40 },
    },
  })
    .png()
    .toBuffer();
}

/** Minimal ISO BMFF buffer with `ftyp` at offset 4 (accepted by isMp4Buffer). */
export function createTestMp4(byteLength = 64): Buffer {
  const buffer = Buffer.alloc(Math.max(byteLength, 8));
  buffer.writeUInt32BE(buffer.length, 0);
  buffer.write('ftyp', 4, 'ascii');
  buffer.write('isom', 8, 'ascii');
  return buffer;
}
