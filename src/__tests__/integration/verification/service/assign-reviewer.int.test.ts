import { Types } from 'mongoose';
import { ListingServiceFactory } from '../../../../configuration/factory/listing.service.factory';
import { ProductServiceFactory } from '../../../../configuration/factory/product.service.factory';
import { VerificationCaseServiceFactory } from '../../../../configuration/factory/verification-case.service.factory';
import { EvidenceItemServiceFactory } from '../../../../configuration/factory/evidence-item.service.factory';
import { EErrorCode } from '../../../../domain/common/errors/enums/EErrorCode';
import { EVerificationCaseStatus } from '../../../../domain/verification/entity/enums/EVerificationCaseStatus';
import { EEvidenceType } from '../../../../domain/verification/entity/enums/EEvidenceType';
import { EShippingMode } from '../../../../domain/listings/entity/enums/EShippingMode';
import { CategoryModel } from '../../../../infraestructure/db/mongo/models/category.model';
import { UserModel } from '../../../../infraestructure/db/mongo/models/user.model';
import { VerificationCaseModel } from '../../../../infraestructure/db/mongo/models/verification-case.model';
import { validCategoryMock } from '../../../__mocks__/category.mock';
import { validListingMock } from '../../../__mocks__/listing.mock';
import { validProductMock } from '../../../__mocks__/product.mock';
import { attachMinProofEvidence } from '../../../helpers/attach-min-proof-evidence';
import { sellerActor } from '../../../__mocks__/actor.mock';
import { validUserMock } from '../../../__mocks__/user.mock';

const listingService = ListingServiceFactory.create();
const productService = ProductServiceFactory.create();
const verificationCaseService = VerificationCaseServiceFactory.create();
const evidenceItemService = EvidenceItemServiceFactory.create();

async function seedListing() {
  const user = validUserMock();
  await UserModel.create(user);
  const category = validCategoryMock();
  await CategoryModel.create(category);
  const product = validProductMock({
    categoryId: category.id,
    referencePriceCents: undefined,
  });
  await productService.createProduct(product);
  const listing = await listingService.createListing(
    validListingMock({
      sellerId: user.id,
      productId: product.id,
      shipping: { modes: [EShippingMode.PICKUP] },
    }),
    sellerActor(user.id),
  );
  return { user, product, listing };
}

async function addPhoto(caseId: string, actorId: string) {
  return evidenceItemService.addEvidence(
    {
      id: new Types.ObjectId().toHexString(),
      caseId,
      type: EEvidenceType.PHOTO,
      storageKey: 'private/evidence/photo.jpg',
    },
    sellerActor(actorId),
  );
}

describe('when we assign a reviewer with minimum proof evidence', () => {
  it('should transition to IN_REVIEW', async () => {
    const { user, listing } = await seedListing();
    const opened = await verificationCaseService.openCase({
      id: new Types.ObjectId().toHexString(),
      listingId: listing.id,
    });
    await attachMinProofEvidence(evidenceItemService, opened.id, user.id);

    const assigned = await verificationCaseService.assignReviewer(opened.id, {
      moderatorId: 'mod-1',
    });

    expect(assigned.status).toBe(EVerificationCaseStatus.IN_REVIEW);
    expect(assigned.moderatorId).toBe('mod-1');
    expect(assigned.proofCodeHash).toBeUndefined();
  });
});

describe('when we assign without PHOTO evidence', () => {
  it('should reject with STATUS_REQUIRES_FIELDS', async () => {
    const { listing } = await seedListing();
    const opened = await verificationCaseService.openCase({
      id: new Types.ObjectId().toHexString(),
      listingId: listing.id,
    });

    await expect(
      verificationCaseService.assignReviewer(opened.id, {
        moderatorId: 'mod-1',
      }),
    ).rejects.toMatchObject({
      status: 400,
      errorCode: EErrorCode.STATUS_REQUIRES_FIELDS,
    });
  });
});

describe('when listing has video and assign lacks VIDEO evidence', () => {
  it('should reject with STATUS_REQUIRES_FIELDS', async () => {
    const { user, listing } = await seedListing();
    const opened = await verificationCaseService.openCase({
      id: new Types.ObjectId().toHexString(),
      listingId: listing.id,
    });
    await addPhoto(opened.id, user.id);

    await expect(
      verificationCaseService.assignReviewer(opened.id, {
        moderatorId: 'mod-1',
      }),
    ).rejects.toMatchObject({
      status: 400,
      errorCode: EErrorCode.STATUS_REQUIRES_FIELDS,
    });
  });
});

describe('when moderatorId is empty', () => {
  it('should reject with FIELD_INVALID', async () => {
    const { listing } = await seedListing();
    const opened = await verificationCaseService.openCase({
      id: new Types.ObjectId().toHexString(),
      listingId: listing.id,
    });

    await expect(
      verificationCaseService.assignReviewer(opened.id, { moderatorId: '  ' }),
    ).rejects.toMatchObject({
      status: 400,
      errorCode: EErrorCode.FIELD_INVALID,
    });
  });
});

describe('when assign reviewer transition is invalid', () => {
  it('should reject with RESOURCE_CONFLICT', async () => {
    const { user, listing } = await seedListing();
    const opened = await verificationCaseService.openCase({
      id: new Types.ObjectId().toHexString(),
      listingId: listing.id,
    });
    await attachMinProofEvidence(evidenceItemService, opened.id, user.id);
    await verificationCaseService.assignReviewer(opened.id, {
      moderatorId: 'mod-1',
    });

    await expect(
      verificationCaseService.assignReviewer(opened.id, {
        moderatorId: 'mod-2',
      }),
    ).rejects.toMatchObject({
      status: 409,
      errorCode: EErrorCode.RESOURCE_CONFLICT,
    });
  });
});

describe('when we open a case', () => {
  it('should persist proofCodeHash without exposing it on the response', async () => {
    const { listing } = await seedListing();
    const opened = await verificationCaseService.openCase({
      id: new Types.ObjectId().toHexString(),
      listingId: listing.id,
    });

    expect(opened.proofCodeHash).toBeUndefined();
    expect(opened.proofCodeIssuedAt).toBeInstanceOf(Date);

    const stored = await VerificationCaseModel.findOne({ id: opened.id }).lean();
    expect(stored?.proofCodeHash).toMatch(/^[a-f0-9]{64}$/i);
  });
});
