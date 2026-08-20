import { Types } from 'mongoose';
import { ListingServiceFactory } from '../../../../configuration/factory/listing.service.factory';
import { MediaAssetServiceFactory } from '../../../../configuration/factory/media-asset.service.factory';
import { ProductServiceFactory } from '../../../../configuration/factory/product.service.factory';
import { EvidenceItemServiceFactory } from '../../../../configuration/factory/evidence-item.service.factory';
import { VerificationCaseServiceFactory } from '../../../../configuration/factory/verification-case.service.factory';
import { EMediaPurpose } from '../../../../domain/media/entity/enums/EMediaPurpose';
import { EEvidenceType } from '../../../../domain/verification/entity/enums/EEvidenceType';
import { EShippingMode } from '../../../../domain/listings/entity/enums/EShippingMode';
import { MemoryObjectStorage } from '../../../../infraestructure/storage/memory-object-storage';
import { CategoryModel } from '../../../../infraestructure/db/mongo/models/category.model';
import { UserModel } from '../../../../infraestructure/db/mongo/models/user.model';
import { backofficeActor, sellerActor } from '../../../__mocks__/actor.mock';
import { validCategoryMock } from '../../../__mocks__/category.mock';
import { validListingMock } from '../../../__mocks__/listing.mock';
import { createTestMp4, createTestPng } from '../../../__mocks__/media.mock';
import { EMediaAssetStatus } from '../../../../domain/media/entity/enums/EMediaAssetStatus';
import { EMediaVariantFormat } from '../../../../domain/media/entity/enums/EMediaVariantFormat';
import { EMediaVariantSize } from '../../../../domain/media/entity/enums/EMediaVariantSize';
import { validProductMock } from '../../../__mocks__/product.mock';
import { validUserMock } from '../../../__mocks__/user.mock';

const listingService = ListingServiceFactory.create();
const productService = ProductServiceFactory.create();
const mediaAssetService = MediaAssetServiceFactory.create();
const evidenceItemService = EvidenceItemServiceFactory.create();
const verificationCaseService = VerificationCaseServiceFactory.create();

async function putReadyAsset(params: {
  purpose: EMediaPurpose;
  ownerId: string;
  actorId: string;
}) {
  const png = await createTestPng();
  const actor =
    params.purpose === EMediaPurpose.PRODUCT
      ? backofficeActor(params.actorId)
      : sellerActor(params.actorId);
  const grant = await mediaAssetService.createUpload(
    {
      purpose: params.purpose,
      ownerId: params.ownerId,
      contentType: 'image/png',
      byteSize: png.length,
    },
    actor,
  );
  await MemoryObjectStorage.instance().putObject({
    bucketClass: grant.asset.bucketClass,
    key: grant.asset.originalKey,
    body: png,
    contentType: 'image/png',
  });
  await mediaAssetService.completeUpload(grant.asset.id, actor);
  const ready = await mediaAssetService.processUploadedAsset(grant.asset.id);
  return ready;
}

describe('when attaching READY listing assets', () => {
  it('should derive public photoUrls from assetIds', async () => {
    const user = validUserMock();
    await UserModel.create(user);
    const category = validCategoryMock();
    await CategoryModel.create(category);
    const product = await productService.createProduct(
      validProductMock({
        categoryId: category.id,
        referencePriceCents: undefined,
      }),
    );
    const asset = await putReadyAsset({
      purpose: EMediaPurpose.LISTING,
      ownerId: user.id,
      actorId: user.id,
    });
    const listing = await listingService.createListing(
      validListingMock({
        sellerId: user.id,
        productId: product.id,
        shipping: { modes: [EShippingMode.PICKUP] },
        media: {
          photoUrls: ['https://cdn.example.com/ignored.jpg'],
          videoUrl: 'https://cdn.example.com/video1.mp4',
          assetIds: [asset.id],
        },
      }),
      sellerActor(user.id),
    );
    expect(listing.media.assetIds).toEqual([asset.id]);
    expect(listing.media.photoUrls[0]).not.toBe(
      'https://cdn.example.com/ignored.jpg',
    );
    expect(listing.media.photoUrls[0]).toContain('http');
  });

  it('should derive videoUrl from videoAssetId', async () => {
    const user = validUserMock();
    await UserModel.create(user);
    const category = validCategoryMock();
    await CategoryModel.create(category);
    const product = await productService.createProduct(
      validProductMock({
        categoryId: category.id,
        referencePriceCents: undefined,
      }),
    );
    const photo = await putReadyAsset({
      purpose: EMediaPurpose.LISTING,
      ownerId: user.id,
      actorId: user.id,
    });
    const mp4 = createTestMp4(256);
    const grant = await mediaAssetService.createUpload(
      {
        purpose: EMediaPurpose.LISTING,
        ownerId: user.id,
        contentType: 'video/mp4',
        byteSize: mp4.length,
      },
      sellerActor(user.id),
    );
    await MemoryObjectStorage.instance().putObject({
      bucketClass: grant.asset.bucketClass,
      key: grant.asset.originalKey,
      body: mp4,
      contentType: 'video/mp4',
    });
    await mediaAssetService.completeUpload(grant.asset.id, sellerActor(user.id));
    const video = await mediaAssetService.processUploadedAsset(grant.asset.id);
    expect(video.status).toBe(EMediaAssetStatus.READY);
    expect(video.variants[0]).toMatchObject({
      size: EMediaVariantSize.ORIGINAL,
      format: EMediaVariantFormat.MP4,
    });

    const listing = await listingService.createListing(
      validListingMock({
        sellerId: user.id,
        productId: product.id,
        shipping: { modes: [EShippingMode.PICKUP] },
        media: {
          photoUrls: [],
          assetIds: [photo.id],
          videoAssetId: video.id,
        },
      }),
      sellerActor(user.id),
    );
    expect(listing.media.videoAssetId).toBe(video.id);
    expect(listing.media.videoUrl).toContain('http');
    expect(listing.media.photoUrls[0]).toContain('http');
  });
});

describe('when attaching READY product assets', () => {
  it('should derive imageUrls from imageAssetIds', async () => {
    const category = validCategoryMock();
    await CategoryModel.create(category);
    const productId = new Types.ObjectId().toHexString();
    const asset = await putReadyAsset({
      purpose: EMediaPurpose.PRODUCT,
      ownerId: productId,
      actorId: 'backoffice-actor',
    });
    const product = await productService.createProduct(
      validProductMock({
        id: productId,
        categoryId: category.id,
        referencePriceCents: undefined,
        imageUrls: ['https://cdn.example.com/product.jpg'],
        imageAssetIds: [asset.id],
      }),
    );
    expect(product.imageAssetIds).toEqual([asset.id]);
    expect(product.imageUrls?.[0]).not.toBe(
      'https://cdn.example.com/product.jpg',
    );
  });
});

describe('when attaching READY evidence assets', () => {
  it('should copy storageKey and omit public URLs from media view', async () => {
    const user = validUserMock();
    await UserModel.create(user);
    const category = validCategoryMock();
    await CategoryModel.create(category);
    const product = await productService.createProduct(
      validProductMock({
        categoryId: category.id,
        referencePriceCents: undefined,
      }),
    );
    const listing = await listingService.createListing(
      validListingMock({
        sellerId: user.id,
        productId: product.id,
        shipping: { modes: [EShippingMode.PICKUP] },
      }),
      sellerActor(user.id),
    );
    const opened = await verificationCaseService.openCase({
      id: new Types.ObjectId().toHexString(),
      listingId: listing.id,
    });
    const asset = await putReadyAsset({
      purpose: EMediaPurpose.EVIDENCE,
      ownerId: opened.id,
      actorId: user.id,
    });
    const evidence = await evidenceItemService.addEvidence(
      {
        id: new Types.ObjectId().toHexString(),
        caseId: opened.id,
        type: EEvidenceType.PHOTO,
        assetId: asset.id,
      },
      sellerActor(user.id),
    );
    expect(evidence.storageKey).toBe(asset.originalKey);
    expect(evidence.assetId).toBe(asset.id);

    const view = await mediaAssetService.getMediaAssetView(
      asset.id,
      sellerActor(user.id),
    );
    expect(view.variants.every((variant) => !variant.publicUrl)).toBe(true);

    const grant = await mediaAssetService.getContentGrant(
      asset.id,
      sellerActor(user.id),
    );
    expect(grant.url).toBeDefined();
    expect(grant.expiresAt).toBeInstanceOf(Date);
  });
});
