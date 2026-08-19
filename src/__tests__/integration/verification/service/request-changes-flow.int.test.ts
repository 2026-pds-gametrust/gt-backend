import { randomUUID } from 'crypto';
import { ListingServiceFactory } from '../../../../configuration/factory/listing.service.factory';
import { MediaAssetServiceFactory } from '../../../../configuration/factory/media-asset.service.factory';
import { ProductServiceFactory } from '../../../../configuration/factory/product.service.factory';
import { VerificationCaseServiceFactory } from '../../../../configuration/factory/verification-case.service.factory';
import { createEventEnvelope } from '../../../../domain/common/messaging/event-envelope';
import { EErrorCode } from '../../../../domain/common/errors/enums/EErrorCode';
import { EListingStatus } from '../../../../domain/listings/entity/enums/EListingStatus';
import { EShippingMode } from '../../../../domain/listings/entity/enums/EShippingMode';
import { EMediaPurpose } from '../../../../domain/media/entity/enums/EMediaPurpose';
import { ERequiredChangeTarget } from '../../../../domain/verification/entity/enums/ERequiredChangeTarget';
import { EVerificationCaseStatus } from '../../../../domain/verification/entity/enums/EVerificationCaseStatus';
import { CategoryModel } from '../../../../infraestructure/db/mongo/models/category.model';
import { UserModel } from '../../../../infraestructure/db/mongo/models/user.model';
import { MemoryObjectStorage } from '../../../../infraestructure/storage/memory-object-storage';
import { validCategoryMock } from '../../../__mocks__/category.mock';
import { validListingMock } from '../../../__mocks__/listing.mock';
import { createTestMp4, createTestPng } from '../../../__mocks__/media.mock';
import { validProductMock } from '../../../__mocks__/product.mock';
import { sellerActor } from '../../../__mocks__/actor.mock';
import { validUserMock } from '../../../__mocks__/user.mock';

const listingService = ListingServiceFactory.create();
const productService = ProductServiceFactory.create();
const mediaAssetService = MediaAssetServiceFactory.create();
const verificationCaseService = VerificationCaseServiceFactory.create();

async function putReadyPhoto(ownerId: string) {
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
  await mediaAssetService.completeUpload(grant.asset.id, sellerActor(ownerId));
  return mediaAssetService.processUploadedAsset(grant.asset.id);
}

async function putReadyVideo(ownerId: string) {
  const mp4 = createTestMp4(256);
  const grant = await mediaAssetService.createUpload(
    {
      purpose: EMediaPurpose.LISTING,
      ownerId,
      contentType: 'video/mp4',
      byteSize: mp4.length,
    },
    sellerActor(ownerId),
  );
  await MemoryObjectStorage.instance().putObject({
    bucketClass: grant.asset.bucketClass,
    key: grant.asset.originalKey,
    body: mp4,
    contentType: 'video/mp4',
  });
  await mediaAssetService.completeUpload(grant.asset.id, sellerActor(ownerId));
  return mediaAssetService.processUploadedAsset(grant.asset.id);
}

async function seedSubmittedListing() {
  const user = validUserMock();
  await UserModel.create(user);
  const category = validCategoryMock();
  await CategoryModel.create(category);
  const product = validProductMock({
    categoryId: category.id,
    referencePriceCents: undefined,
  });
  await productService.createProduct(product);
  const photo = await putReadyPhoto(user.id);
  const video = await putReadyVideo(user.id);
  const listing = await listingService.createListing(
    validListingMock({
      sellerId: user.id,
      productId: product.id,
      description: 'Original description',
      media: {
        photoUrls: [],
        assetIds: [photo.id],
        videoAssetId: video.id,
      },
      shipping: { modes: [EShippingMode.PICKUP] },
    }),
    sellerActor(user.id),
  );
  await listingService.submitListing(listing.id, sellerActor(user.id));
  return { user, listing, photoAssetId: photo.id, videoAssetId: video.id };
}

async function openInReviewCase(listingId: string) {
  const pending =
    await verificationCaseService.ensureOpenCaseForListing(listingId);
  return verificationCaseService.assignReviewer(pending.id, {
    moderatorId: 'mod-1',
  });
}

function changesRequestedEnvelope(payload: Record<string, unknown>) {
  return createEventEnvelope({
    eventId: randomUUID(),
    eventType: 'verification.case.changes_requested',
    aggregateId: randomUUID(),
    producerModule: 'verification',
    correlationId: randomUUID(),
    payload,
  });
}

function rejectedEnvelope(payload: Record<string, unknown>) {
  return createEventEnvelope({
    eventId: randomUUID(),
    eventType: 'verification.case.rejected',
    aggregateId: randomUUID(),
    producerModule: 'verification',
    correlationId: randomUUID(),
    payload,
  });
}

describe('when moderator requests granular changes', () => {
  it('should store requiredChanges and revision baseline', async () => {
    const { listing, photoAssetId } = await seedSubmittedListing();
    const inReview = await openInReviewCase(listing.id);

    const updated = await verificationCaseService.requestChangesCase(
      inReview.id,
      {
        summary: 'Fix photo and description',
        requiredChanges: [
          {
            target: ERequiredChangeTarget.PHOTO,
            reason: 'Blurry photo',
            assetId: photoAssetId,
          },
          {
            target: ERequiredChangeTarget.DESCRIPTION,
            reason: 'Missing serial number',
          },
        ],
      },
    );

    expect(updated.status).toBe(EVerificationCaseStatus.CHANGES_REQUESTED);
    expect(updated.requiredChanges).toHaveLength(2);
    expect(updated.revisionBaseline?.assetIds).toContain(photoAssetId);
    expect(updated.revisionBaseline?.description).toBe('Original description');
  });
});

describe('when changes_requested event is applied', () => {
  it('should move listing from SUBMITTED to DRAFT', async () => {
    const { listing } = await seedSubmittedListing();

    await listingService.applyVerificationChangesRequested(
      changesRequestedEnvelope({ listingId: listing.id }),
    );

    const updated = await listingService.getListingById(listing.id);
    expect(updated.status).toBe(EListingStatus.DRAFT);
  });
});

describe('when listing is rejected definitively', () => {
  it('should move listing from SUBMITTED to REJECTED', async () => {
    const { listing } = await seedSubmittedListing();

    await listingService.applyVerificationRejected(
      rejectedEnvelope({ listingId: listing.id, reason: 'Policy violation' }),
    );

    const updated = await listingService.getListingById(listing.id);
    expect(updated.status).toBe(EListingStatus.REJECTED);
  });
});

describe('when seller resubmits without required edits', () => {
  it('should reject submit with FIELD_INVALID', async () => {
    const { user, listing, photoAssetId } = await seedSubmittedListing();
    const inReview = await openInReviewCase(listing.id);

    await verificationCaseService.requestChangesCase(inReview.id, {
      summary: 'Fix photo',
      requiredChanges: [
        {
          target: ERequiredChangeTarget.PHOTO,
          reason: 'Blurry',
          assetId: photoAssetId,
        },
      ],
    });
    await listingService.applyVerificationChangesRequested(
      changesRequestedEnvelope({ listingId: listing.id }),
    );

    await expect(
      listingService.submitListing(listing.id, sellerActor(user.id)),
    ).rejects.toMatchObject({
      status: 400,
      errorCode: EErrorCode.FIELD_INVALID,
    });
  });
});

describe('when seller applies required edits and resubmits', () => {
  it('should open a new PENDING case linked via previousCaseId', async () => {
    const { user, listing } = await seedSubmittedListing();
    const inReview = await openInReviewCase(listing.id);

    const changesRequested = await verificationCaseService.requestChangesCase(
      inReview.id,
      {
        summary: 'Fix description',
        requiredChanges: [
          {
            target: ERequiredChangeTarget.DESCRIPTION,
            reason: 'Add details',
          },
        ],
      },
    );
    await listingService.applyVerificationChangesRequested(
      changesRequestedEnvelope({ listingId: listing.id }),
    );

    await listingService.updateListingById(
      listing.id,
      { listingData: { description: 'Updated description with serial' } },
      sellerActor(user.id),
    );
    await listingService.submitListing(listing.id, sellerActor(user.id));

    const newCase = await verificationCaseService.ensureOpenCaseForListing(
      listing.id,
    );
    expect(newCase.status).toBe(EVerificationCaseStatus.PENDING);
    expect(newCase.previousCaseId).toBe(changesRequested.id);
  });
});

describe('when request-changes references foreign asset', () => {
  it('should reject with FIELD_INVALID', async () => {
    const { listing } = await seedSubmittedListing();
    const inReview = await openInReviewCase(listing.id);

    await expect(
      verificationCaseService.requestChangesCase(inReview.id, {
        summary: 'Fix photo',
        requiredChanges: [
          {
            target: ERequiredChangeTarget.PHOTO,
            reason: 'Wrong asset',
            assetId: 'foreign-photo',
          },
        ],
      }),
    ).rejects.toMatchObject({
      status: 400,
      errorCode: EErrorCode.FIELD_INVALID,
    });
  });
});
