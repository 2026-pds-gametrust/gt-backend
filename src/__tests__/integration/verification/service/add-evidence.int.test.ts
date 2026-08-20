import { Types } from 'mongoose';
import { ListingServiceFactory } from '../../../../configuration/factory/listing.service.factory';
import { ProductServiceFactory } from '../../../../configuration/factory/product.service.factory';
import { VerificationCaseServiceFactory } from '../../../../configuration/factory/verification-case.service.factory';
import { EvidenceItemServiceFactory } from '../../../../configuration/factory/evidence-item.service.factory';
import { EErrorCode } from '../../../../domain/common/errors/enums/EErrorCode';
import { EEvidenceType } from '../../../../domain/verification/entity/enums/EEvidenceType';
import { EShippingMode } from '../../../../domain/listings/entity/enums/EShippingMode';
import { CategoryModel } from '../../../../infraestructure/db/mongo/models/category.model';
import { UserModel } from '../../../../infraestructure/db/mongo/models/user.model';
import { validCategoryMock } from '../../../__mocks__/category.mock';
import { validListingMock } from '../../../__mocks__/listing.mock';
import { validProductMock } from '../../../__mocks__/product.mock';
import { sellerActor } from '../../../__mocks__/actor.mock';
import { validUserMock } from '../../../__mocks__/user.mock';

const listingService = ListingServiceFactory.create();
const productService = ProductServiceFactory.create();
const verificationCaseService = VerificationCaseServiceFactory.create();
const evidenceItemService = EvidenceItemServiceFactory.create();

async function seedOpenCase() {
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
  const opened = await verificationCaseService.openCase({
    id: new Types.ObjectId().toHexString(),
    listingId: listing.id,
  });
  return { user, listing, opened };
}

describe('when we add evidence to a case', () => {
  it('should persist evidence metadata', async () => {
    const { user, opened } = await seedOpenCase();

    const evidence = await evidenceItemService.addEvidence(
      {
        id: new Types.ObjectId().toHexString(),
        caseId: opened.id,
        type: EEvidenceType.PHOTO,
        storageKey: 'private/bucket/key.jpg',
      },
      sellerActor(user.id),
    );

    expect(evidence.caseId).toBe(opened.id);
    expect(evidence.storageKey).toBe('private/bucket/key.jpg');
  });
});

describe('when we add evidence to a missing case', () => {
  it('should reject with RESOURCE_NOT_FOUND', async () => {
    await expect(
      evidenceItemService.addEvidence(
        {
          id: new Types.ObjectId().toHexString(),
          caseId: 'missing-case',
          type: EEvidenceType.PHOTO,
          storageKey: 'private/key.jpg',
        },
        sellerActor('any-user'),
      ),
    ).rejects.toMatchObject({
      status: 404,
      errorCode: EErrorCode.RESOURCE_NOT_FOUND,
    });
  });
});

describe('when non-owner adds evidence', () => {
  it('should reject with forbidden', async () => {
    const { opened } = await seedOpenCase();

    await expect(
      evidenceItemService.addEvidence(
        {
          id: new Types.ObjectId().toHexString(),
          caseId: opened.id,
          type: EEvidenceType.PHOTO,
          storageKey: 'private/key.jpg',
        },
        sellerActor('other-seller'),
      ),
    ).rejects.toMatchObject({
      status: 403,
    });
  });
});
