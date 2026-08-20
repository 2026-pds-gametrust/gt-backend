import { Types } from 'mongoose';
import { ListingServiceFactory } from '../../../../configuration/factory/listing.service.factory';
import { ProductServiceFactory } from '../../../../configuration/factory/product.service.factory';
import { VerificationCaseServiceFactory } from '../../../../configuration/factory/verification-case.service.factory';
import { SealServiceFactory } from '../../../../configuration/factory/seal.service.factory';
import { EErrorCode } from '../../../../domain/common/errors/enums/EErrorCode';
import { EVerificationCaseStatus } from '../../../../domain/verification/entity/enums/EVerificationCaseStatus';
import { ESealStatus } from '../../../../domain/verification/entity/enums/ESealStatus';
import { EShippingMode } from '../../../../domain/listings/entity/enums/EShippingMode';
import { ETrustEventType } from '../../../../domain/trust/entity/enums/ETrustEventType';
import { CategoryModel } from '../../../../infraestructure/db/mongo/models/category.model';
import { UserModel } from '../../../../infraestructure/db/mongo/models/user.model';
import { TrustEventModel } from '../../../../infraestructure/db/mongo/models/trust-event.model';
import { TrustScoreModel } from '../../../../infraestructure/db/mongo/models/trust-score.model';
import { SellerLevelModel } from '../../../../infraestructure/db/mongo/models/seller-level.model';
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

describe('when we approve a case in review', () => {
  it('should approve grant seal and append trust ledger', async () => {
    const { user, listing } = await seedListing();
    const opened = await verificationCaseService.openCase({
      id: new Types.ObjectId().toHexString(),
      listingId: listing.id,
    });
    await attachMinProofEvidence(evidenceItemService, opened.id, user.id);
    await verificationCaseService.assignReviewer(opened.id, {
      moderatorId: 'mod-1',
    });

    const approved = await verificationCaseService.approveCase(opened.id);

    expect(approved.status).toBe(EVerificationCaseStatus.APPROVED);

    const seals = await sealService.listSealsByListingId(listing.id);
    expect(seals).toHaveLength(1);
    expect(seals[0].status).toBe(ESealStatus.GRANTED);

    const trustEvents = await TrustEventModel.find({ sellerId: user.id });
    expect(trustEvents.some((e) => e.type === ETrustEventType.SEAL_GRANTED)).toBe(
      true,
    );

    const score = await TrustScoreModel.findOne({ sellerId: user.id });
    expect(score?.score).toBe(20);

    const level = await SellerLevelModel.findOne({ sellerId: user.id });
    expect(level?.level).toBe('EVOLVING');
  });
});

describe('when we approve from PENDING', () => {
  it('should reject with RESOURCE_CONFLICT', async () => {
    const { listing } = await seedListing();
    const opened = await verificationCaseService.openCase({
      id: new Types.ObjectId().toHexString(),
      listingId: listing.id,
    });

    await expect(
      verificationCaseService.approveCase(opened.id),
    ).rejects.toMatchObject({
      status: 409,
      errorCode: EErrorCode.RESOURCE_CONFLICT,
    });
  });
});
