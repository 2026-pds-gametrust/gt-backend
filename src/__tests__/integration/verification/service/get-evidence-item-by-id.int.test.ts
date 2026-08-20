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

async function seedEvidence() {
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
  const evidence = await evidenceItemService.addEvidence(
    {
      id: new Types.ObjectId().toHexString(),
      caseId: opened.id,
      type: EEvidenceType.PHOTO,
      storageKey: 'private/bucket/key.jpg',
    },
    sellerActor(user.id),
  );
  return { evidence };
}

describe('when we get an evidence item by id', () => {
  it('should return the evidence', async () => {
    const { evidence } = await seedEvidence();

    const found = await evidenceItemService.getEvidenceItemById(evidence.id);

    expect(found).toMatchObject({
      id: evidence.id,
      storageKey: evidence.storageKey,
    });
  });
});

describe('when evidence item does not exist', () => {
  it('should reject with RESOURCE_NOT_FOUND', async () => {
    await expect(
      evidenceItemService.getEvidenceItemById('missing-evidence'),
    ).rejects.toMatchObject({
      status: 404,
      errorCode: EErrorCode.RESOURCE_NOT_FOUND,
    });
  });
});
