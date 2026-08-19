import sharp from 'sharp';
import { Types } from 'mongoose';
import { MediaAssetServiceFactory } from '../../../../configuration/factory/media-asset.service.factory';
import { EMediaAssetStatus } from '../../../../domain/media/entity/enums/EMediaAssetStatus';
import { EMediaPurpose } from '../../../../domain/media/entity/enums/EMediaPurpose';
import { MemoryObjectStorage } from '../../../../infraestructure/storage/memory-object-storage';
import { sellerActor } from '../../../__mocks__/actor.mock';
import { createTestPng } from '../../../__mocks__/media.mock';

const mediaAssetService = MediaAssetServiceFactory.create();

describe('when we complete and process a listing image', () => {
  it('should reach READY with variants and no EXIF', async () => {
    const ownerId = new Types.ObjectId().toHexString();
    const png = await createTestPng();
    const grant = await mediaAssetService.createUpload(
      {
        purpose: EMediaPurpose.LISTING,
        ownerId,
        contentType: 'image/png',
        byteSize: png.length,
      },
      sellerActor(ownerId),
    );
    await MemoryObjectStorage.instance().putObject({
      bucketClass: grant.asset.bucketClass,
      key: grant.asset.originalKey,
      body: png,
      contentType: 'image/png',
    });

    const completed = await mediaAssetService.completeUpload(
      grant.asset.id,
      sellerActor(ownerId),
    );
    expect([
      EMediaAssetStatus.UPLOADED,
      EMediaAssetStatus.PROCESSING,
      EMediaAssetStatus.READY,
    ]).toContain(completed.status);

    const ready =
      completed.status === EMediaAssetStatus.READY
        ? completed
        : await mediaAssetService.processUploadedAsset(grant.asset.id);
    expect(ready.status).toBe(EMediaAssetStatus.READY);
    expect(ready.variants).toHaveLength(6);

    const jpegVariant = ready.variants.find(
      (variant) => variant.format === 'JPEG',
    );
    expect(jpegVariant?.storageKey).toBeDefined();
    const bytes = await MemoryObjectStorage.instance().getObject({
      bucketClass: ready.bucketClass,
      key: jpegVariant!.storageKey,
    });
    const metadata = await sharp(bytes!).metadata();
    expect(metadata.exif).toBeUndefined();
  });
});
