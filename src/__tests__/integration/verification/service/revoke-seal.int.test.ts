import { Types } from 'mongoose';
import { ListingServiceFactory } from '../../../../configuration/factory/listing.service.factory';
import { ProductServiceFactory } from '../../../../configuration/factory/product.service.factory';
import { VerificationCaseServiceFactory } from '../../../../configuration/factory/verification-case.service.factory';
import { SealServiceFactory } from '../../../../configuration/factory/seal.service.factory';
import { EErrorCode } from '../../../../domain/common/errors/enums/EErrorCode';
import { ESealStatus } from '../../../../domain/verification/entity/enums/ESealStatus';
import { EShippingMode } from '../../../../domain/listings/entity/enums/EShippingMode';
import { CategoryModel } from '../../../../infraestructure/db/mongo/models/category.model';
import { UserModel } from '../../../../infraestructure/db/mongo/models/user.model';
import { SealModel } from '../../../../infraestructure/db/mongo/models/seal.model';
import { TrustScoreModel } from '../../../../infraestructure/db/mongo/models/trust-score.model';
import { validCategoryMock } from '../../../__mocks__/category.mock';
import { validListingMock } from '../../../__mocks__/listing.mock';
import { validProductMock } from '../../../__mocks__/product.mock';
import { EvidenceItemServiceFactory } from '../../../../configuration/factory/evidence-item.service.factory';
import { attachMinProofEvidence } from '../../../helpers/attach-min-proof-evidence';
import { sellerActor } from '../../../__mocks__/actor.mock';
import { validUserMock } from '../../../__mocks__/user.mock';

const listingService = ListingServiceFactory.create();
const productService = ProductServiceFactory.create();
const verificationCaseService = VerificationCaseServiceFactory.create();
const sealService = SealServiceFactory.create();
const evidenceItemService = EvidenceItemServiceFactory.create();

async function seedApprovedSeal() {
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
  await attachMinProofEvidence(evidenceItemService, opened.id, user.id);
  await verificationCaseService.assignReviewer(opened.id, {
    moderatorId: 'mod-1',
  });
  await verificationCaseService.approveCase(opened.id);
  const seals = await SealModel.find({ listingId: listing.id });
  return { user, listing, sealId: seals[0].id };
}

describe('when we revoke a seal', () => {
  it('should mark REVOKED and reduce trust score', async () => {
    const { user, sealId } = await seedApprovedSeal();

    const revoked = await sealService.revokeSeal(sealId, user.id);

    expect(revoked.status).toBe(ESealStatus.REVOKED);

    const score = await TrustScoreModel.findOne({ sellerId: user.id });
    expect(score?.score).toBe(0);
  });
});

describe('when we revoke an already revoked seal', () => {
  it('should reject with RESOURCE_CONFLICT', async () => {
    const { user, sealId } = await seedApprovedSeal();
    await sealService.revokeSeal(sealId, user.id);

    await expect(sealService.revokeSeal(sealId, user.id)).rejects.toMatchObject(
      {
        status: 409,
        errorCode: EErrorCode.RESOURCE_CONFLICT,
      },
    );
  });
});
