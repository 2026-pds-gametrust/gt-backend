import { Types } from 'mongoose';
import { EErrorCode } from '../../../../domain/common/errors/enums/EErrorCode';
import { IEventPublisher } from '../../../../domain/common/messaging/event-publisher.interface';
import { EMediaAssetStatus } from '../../../../domain/media/entity/enums/EMediaAssetStatus';
import { EMediaPurpose } from '../../../../domain/media/entity/enums/EMediaPurpose';
import { IMediaAsset } from '../../../../domain/media/entity/interfaces/media-asset.interface';
import { MediaAssetService } from '../../../../domain/media/service/media-asset.service';
import { MemoryObjectStorage } from '../../../../infraestructure/storage/memory-object-storage';
import { SharpImageProcessor } from '../../../../infraestructure/processing/sharp-image-processor';
import {
  backofficeActor,
  sellerActor,
} from '../../../__mocks__/actor.mock';
import {
  createTestMp4,
  createTestPng,
} from '../../../__mocks__/media.mock';
import { EMediaVariantFormat } from '../../../../domain/media/entity/enums/EMediaVariantFormat';
import { EMediaVariantSize } from '../../../../domain/media/entity/enums/EMediaVariantSize';
import { MEDIA_MAX_VIDEO_BYTES } from '../../../../domain/media/entity/media-asset.entity';

function buildService(overrides: {
  assets?: Map<string, IMediaAsset>;
  sellerIdByCaseId?: Map<string, string>;
} = {}) {
  const assets = overrides.assets ?? new Map<string, IMediaAsset>();
  const sellerIdByCaseId =
    overrides.sellerIdByCaseId ?? new Map<string, string>();
  const publisher: IEventPublisher = {
    publish: jest.fn().mockResolvedValue(undefined),
  };
  MemoryObjectStorage.reset();
  const storage = MemoryObjectStorage.instance();
  const service = new MediaAssetService({
    mediaAssetRepositoryRead: {
      findMediaAssetById: async (id) => assets.get(id) ?? null,
    },
    mediaAssetRepositoryWrite: {
      createMediaAsset: async (asset) => {
        assets.set(asset.id, asset);
        return asset;
      },
      updateMediaAssetById: async (id, data) => {
        const existing = assets.get(id);
        if (!existing) return null;
        const updated = { ...existing, ...data };
        assets.set(id, updated);
        return updated;
      },
    },
    objectStorage: storage,
    imageProcessor: new SharpImageProcessor(),
    eventPublisher: publisher,
    ownershipLookup: {
      findEvidenceSellerId: async (caseId) =>
        sellerIdByCaseId.get(caseId) ?? null,
    },
    publicBaseUrl: 'http://media.local',
    putUrlTtlSeconds: 900,
    getUrlTtlSeconds: 300,
  });
  return { service, assets, publisher, storage };
}

describe('when creating a listing upload grant', () => {
  it('should issue a PENDING_UPLOAD grant for the owner', async () => {
    const ownerId = new Types.ObjectId().toHexString();
    const { service } = buildService();
    const grant = await service.createUpload(
      {
        purpose: EMediaPurpose.LISTING,
        ownerId,
        contentType: 'image/jpeg',
        byteSize: 1000,
      },
      sellerActor(ownerId),
    );
    expect(grant.asset.status).toBe(EMediaAssetStatus.PENDING_UPLOAD);
    expect(grant.upload.url).toContain('memory://');
    expect(grant.asset.originalKey).toContain(`public/listing/${ownerId}/`);
  });
});

describe('when a seller requests a grant for another owner', () => {
  it('should reject with 403', async () => {
    const { service } = buildService();
    await expect(
      service.createUpload(
        {
          purpose: EMediaPurpose.LISTING,
          ownerId: 'seller-b',
          contentType: 'image/jpeg',
          byteSize: 1000,
        },
        sellerActor('seller-a'),
      ),
    ).rejects.toMatchObject({
      status: 403,
      errorCode: EErrorCode.FIELD_INVALID,
    });
  });
});

describe('when creating an upload with invalid type or size', () => {
  it('should reject application/pdf', async () => {
    const ownerId = new Types.ObjectId().toHexString();
    const { service } = buildService();
    await expect(
      service.createUpload(
        {
          purpose: EMediaPurpose.LISTING,
          ownerId,
          contentType: 'application/pdf',
          byteSize: 1000,
        },
        sellerActor(ownerId),
      ),
    ).rejects.toMatchObject({
      status: 400,
      errorCode: EErrorCode.FIELD_INVALID,
    });
  });

  it('should accept byteSize at 10 MiB', async () => {
    const ownerId = new Types.ObjectId().toHexString();
    const { service } = buildService();
    const grant = await service.createUpload(
      {
        purpose: EMediaPurpose.LISTING,
        ownerId,
        contentType: 'image/png',
        byteSize: 10 * 1024 * 1024,
      },
      sellerActor(ownerId),
    );
    expect(grant.asset.byteSize).toBe(10 * 1024 * 1024);
  });

  it('should reject byteSize above 10 MiB', async () => {
    const ownerId = new Types.ObjectId().toHexString();
    const { service } = buildService();
    await expect(
      service.createUpload(
        {
          purpose: EMediaPurpose.LISTING,
          ownerId,
          contentType: 'image/png',
          byteSize: 10 * 1024 * 1024 + 1,
        },
        sellerActor(ownerId),
      ),
    ).rejects.toMatchObject({
      status: 400,
      errorCode: EErrorCode.FIELD_INVALID,
    });
  });
});

describe('when creating a product upload', () => {
  it('should reject a seller', async () => {
    const { service } = buildService();
    await expect(
      service.createUpload(
        {
          purpose: EMediaPurpose.PRODUCT,
          ownerId: 'product-1',
          contentType: 'image/jpeg',
          byteSize: 1000,
        },
        sellerActor('seller-1'),
      ),
    ).rejects.toMatchObject({ status: 403 });
  });

  it('should accept backoffice', async () => {
    const { service } = buildService();
    const grant = await service.createUpload(
      {
        purpose: EMediaPurpose.PRODUCT,
        ownerId: 'product-1',
        contentType: 'image/jpeg',
        byteSize: 1000,
      },
      backofficeActor(),
    );
    expect(grant.asset.purpose).toBe(EMediaPurpose.PRODUCT);
  });
});

describe('when completing an upload', () => {
  it('should reject when the object is missing', async () => {
    const ownerId = new Types.ObjectId().toHexString();
    const { service } = buildService();
    const grant = await service.createUpload(
      {
        purpose: EMediaPurpose.LISTING,
        ownerId,
        contentType: 'image/png',
        byteSize: 100,
      },
      sellerActor(ownerId),
    );
    await expect(
      service.completeUpload(grant.asset.id, sellerActor(ownerId)),
    ).rejects.toMatchObject({
      status: 400,
      errorCode: EErrorCode.FIELD_INVALID,
    });
  });

  it('should be idempotent after the first successful complete', async () => {
    const ownerId = new Types.ObjectId().toHexString();
    const { service, publisher, storage } = buildService();
    const png = await createTestPng();
    const grant = await service.createUpload(
      {
        purpose: EMediaPurpose.LISTING,
        ownerId,
        contentType: 'image/png',
        byteSize: png.length,
      },
      sellerActor(ownerId),
    );
    await storage.putObject({
      bucketClass: grant.asset.bucketClass,
      key: grant.asset.originalKey,
      body: png,
      contentType: 'image/png',
    });
    await service.completeUpload(grant.asset.id, sellerActor(ownerId));
    await service.completeUpload(grant.asset.id, sellerActor(ownerId));
    expect(publisher.publish).toHaveBeenCalledTimes(1);
  });
});

describe('when processing a valid image', () => {
  it('should mark READY with six variants', async () => {
    const ownerId = new Types.ObjectId().toHexString();
    const { service, storage } = buildService();
    const png = await createTestPng();
    const grant = await service.createUpload(
      {
        purpose: EMediaPurpose.LISTING,
        ownerId,
        contentType: 'image/png',
        byteSize: png.length,
      },
      sellerActor(ownerId),
    );
    await storage.putObject({
      bucketClass: grant.asset.bucketClass,
      key: grant.asset.originalKey,
      body: png,
      contentType: 'image/png',
    });
    await service.completeUpload(grant.asset.id, sellerActor(ownerId));
    const processed = await service.processUploadedAsset(grant.asset.id);
    expect(processed.status).toBe(EMediaAssetStatus.READY);
    expect(processed.variants).toHaveLength(6);
    expect(processed.variants.every((variant) => variant.publicUrl)).toBe(true);
  });
});

describe('when processing invalid bytes', () => {
  it('should mark FAILED', async () => {
    const ownerId = new Types.ObjectId().toHexString();
    const { service, storage } = buildService();
    const garbage = Buffer.from('not-an-image');
    const grant = await service.createUpload(
      {
        purpose: EMediaPurpose.LISTING,
        ownerId,
        contentType: 'image/jpeg',
        byteSize: garbage.length,
      },
      sellerActor(ownerId),
    );
    await storage.putObject({
      bucketClass: grant.asset.bucketClass,
      key: grant.asset.originalKey,
      body: garbage,
      contentType: 'image/jpeg',
    });
    await service.completeUpload(grant.asset.id, sellerActor(ownerId));
    const processed = await service.processUploadedAsset(grant.asset.id);
    expect(processed.status).toBe(EMediaAssetStatus.FAILED);
  });
});

describe('when creating a listing video upload grant', () => {
  it('should accept video/mp4 within 50 MiB', async () => {
    const ownerId = new Types.ObjectId().toHexString();
    const { service } = buildService();
    const grant = await service.createUpload(
      {
        purpose: EMediaPurpose.LISTING,
        ownerId,
        contentType: 'video/mp4',
        byteSize: MEDIA_MAX_VIDEO_BYTES,
      },
      sellerActor(ownerId),
    );
    expect(grant.asset.contentType).toBe('video/mp4');
    expect(grant.asset.byteSize).toBe(MEDIA_MAX_VIDEO_BYTES);
  });

  it('should reject video/mp4 above 50 MiB', async () => {
    const ownerId = new Types.ObjectId().toHexString();
    const { service } = buildService();
    await expect(
      service.createUpload(
        {
          purpose: EMediaPurpose.LISTING,
          ownerId,
          contentType: 'video/mp4',
          byteSize: MEDIA_MAX_VIDEO_BYTES + 1,
        },
        sellerActor(ownerId),
      ),
    ).rejects.toMatchObject({
      status: 400,
      errorCode: EErrorCode.FIELD_INVALID,
    });
  });

  it('should reject video/mp4 for PRODUCT purpose', async () => {
    const { service } = buildService();
    await expect(
      service.createUpload(
        {
          purpose: EMediaPurpose.PRODUCT,
          ownerId: 'product-1',
          contentType: 'video/mp4',
          byteSize: 1000,
        },
        backofficeActor(),
      ),
    ).rejects.toMatchObject({
      status: 400,
      errorCode: EErrorCode.FIELD_INVALID,
    });
  });
});

describe('when processing a valid mp4', () => {
  it('should mark READY with one ORIGINAL/MP4 public variant', async () => {
    const ownerId = new Types.ObjectId().toHexString();
    const { service, storage } = buildService();
    const mp4 = createTestMp4(128);
    const grant = await service.createUpload(
      {
        purpose: EMediaPurpose.LISTING,
        ownerId,
        contentType: 'video/mp4',
        byteSize: mp4.length,
      },
      sellerActor(ownerId),
    );
    await storage.putObject({
      bucketClass: grant.asset.bucketClass,
      key: grant.asset.originalKey,
      body: mp4,
      contentType: 'video/mp4',
    });
    await service.completeUpload(grant.asset.id, sellerActor(ownerId));
    const processed = await service.processUploadedAsset(grant.asset.id);
    expect(processed.status).toBe(EMediaAssetStatus.READY);
    expect(processed.variants).toHaveLength(1);
    expect(processed.variants[0]).toMatchObject({
      size: EMediaVariantSize.ORIGINAL,
      format: EMediaVariantFormat.MP4,
    });
    expect(processed.variants[0].publicUrl).toContain('http');
    const videoUrl = await service.resolvePublicVideoUrl(processed.id);
    expect(videoUrl).toBe(processed.variants[0].publicUrl);
    expect(await service.resolvePublicVariantUrls(processed.id)).toEqual([]);
  });
});

describe('when processing invalid mp4 bytes', () => {
  it('should mark FAILED', async () => {
    const ownerId = new Types.ObjectId().toHexString();
    const { service, storage } = buildService();
    const garbage = Buffer.from('not-an-mp4-file');
    const grant = await service.createUpload(
      {
        purpose: EMediaPurpose.LISTING,
        ownerId,
        contentType: 'video/mp4',
        byteSize: garbage.length,
      },
      sellerActor(ownerId),
    );
    await storage.putObject({
      bucketClass: grant.asset.bucketClass,
      key: grant.asset.originalKey,
      body: garbage,
      contentType: 'video/mp4',
    });
    await service.completeUpload(grant.asset.id, sellerActor(ownerId));
    const processed = await service.processUploadedAsset(grant.asset.id);
    expect(processed.status).toBe(EMediaAssetStatus.FAILED);
  });
});
