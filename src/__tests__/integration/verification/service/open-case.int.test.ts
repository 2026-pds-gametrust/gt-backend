import { Types } from 'mongoose';
import { ListingServiceFactory } from '../../../../configuration/factory/listing.service.factory';
import { ProductServiceFactory } from '../../../../configuration/factory/product.service.factory';
import { VerificationCaseServiceFactory } from '../../../../configuration/factory/verification-case.service.factory';
import { VerificationCaseService } from '../../../../domain/verification/service/verification-case.service';
import { SealService } from '../../../../domain/verification/service/seal.service';
import { TrustEventService } from '../../../../domain/trust/service/trust-event.service';
import { TrustScoreService } from '../../../../domain/trust/service/trust-score.service';
import { SellerLevelService } from '../../../../domain/trust/service/seller-level.service';
import { EErrorCode } from '../../../../domain/common/errors/enums/EErrorCode';
import { EVerificationCaseStatus } from '../../../../domain/verification/entity/enums/EVerificationCaseStatus';
import { EShippingMode } from '../../../../domain/listings/entity/enums/EShippingMode';
import { CategoryModel } from '../../../../infraestructure/db/mongo/models/category.model';
import { UserModel } from '../../../../infraestructure/db/mongo/models/user.model';
import { ListingRepositoryRead } from '../../../../infraestructure/repository/listings/listing.repository.read';
import { VerificationCaseRepositoryRead } from '../../../../infraestructure/repository/verification/verification-case.repository.read';
import { VerificationCaseRepositoryWrite } from '../../../../infraestructure/repository/verification/verification-case.repository.write';
import { SealRepositoryRead } from '../../../../infraestructure/repository/verification/seal.repository.read';
import { SealRepositoryWrite } from '../../../../infraestructure/repository/verification/seal.repository.write';
import { TrustEventRepositoryRead } from '../../../../infraestructure/repository/trust/trust-event.repository.read';
import { TrustEventRepositoryWrite } from '../../../../infraestructure/repository/trust/trust-event.repository.write';
import { TrustScoreRepositoryRead } from '../../../../infraestructure/repository/trust/trust-score.repository.read';
import { TrustScoreRepositoryWrite } from '../../../../infraestructure/repository/trust/trust-score.repository.write';
import { SellerLevelRepositoryRead } from '../../../../infraestructure/repository/trust/seller-level.repository.read';
import { SellerLevelRepositoryWrite } from '../../../../infraestructure/repository/trust/seller-level.repository.write';
import { validCategoryMock } from '../../../__mocks__/category.mock';
import { validListingMock } from '../../../__mocks__/listing.mock';
import { validProductMock } from '../../../__mocks__/product.mock';
import { sellerActor } from '../../../__mocks__/actor.mock';
import { validUserMock } from '../../../__mocks__/user.mock';

const listingService = ListingServiceFactory.create();
const productService = ProductServiceFactory.create();
const verificationCaseService = VerificationCaseServiceFactory.create();

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

describe('when we open a verification case', () => {
  it('should persist PENDING status', async () => {
    const { listing } = await seedListing();
    const opened = await verificationCaseService.openCase({
      id: new Types.ObjectId().toHexString(),
      listingId: listing.id,
    });
    expect(opened.status).toBe(EVerificationCaseStatus.PENDING);
    expect(opened.listingId).toBe(listing.id);
  });
});

describe('when listing does not exist', () => {
  it('should reject with RESOURCE_NOT_FOUND', async () => {
    await expect(
      verificationCaseService.openCase({
        id: new Types.ObjectId().toHexString(),
        listingId: 'missing-listing',
      }),
    ).rejects.toMatchObject({
      status: 404,
      errorCode: EErrorCode.RESOURCE_NOT_FOUND,
    });
  });
});

describe('when listing already has an open case', () => {
  it('should reject with RESOURCE_CONFLICT', async () => {
    const { listing } = await seedListing();
    await verificationCaseService.openCase({
      id: new Types.ObjectId().toHexString(),
      listingId: listing.id,
    });
    await expect(
      verificationCaseService.openCase({
        id: new Types.ObjectId().toHexString(),
        listingId: listing.id,
      }),
    ).rejects.toMatchObject({
      status: 409,
      errorCode: EErrorCode.RESOURCE_CONFLICT,
    });
  });
});

describe('when we open a verification case', () => {
  it('should publish verification.case.submitted via event publisher', async () => {
    const publisher = {
      publish: jest.fn().mockResolvedValue(undefined),
    };
    const service = new VerificationCaseService({
      verificationCaseRepositoryRead: new VerificationCaseRepositoryRead(),
      verificationCaseRepositoryWrite: new VerificationCaseRepositoryWrite(),
      evidenceItemRepositoryRead: {
        findEvidenceItemById: async () => null,
        listByCaseId: async () => [],
      },
      listingRepositoryRead: new ListingRepositoryRead(),
      userRepositoryRead: {
        findUserIdsBySearchQuery: async () => [],
        findUsersByIds: async () => [],
      } as never,
      profileRepositoryRead: {
        findProfilesByUserIds: async () => [],
      } as never,
      sealService: new SealService({
        sealRepositoryRead: new SealRepositoryRead(),
        sealRepositoryWrite: new SealRepositoryWrite(),
        trustEventService: new TrustEventService({
          trustEventRepositoryRead: new TrustEventRepositoryRead(),
          trustEventRepositoryWrite: new TrustEventRepositoryWrite(),
        }),
        trustScoreService: new TrustScoreService({
          trustScoreRepositoryRead: new TrustScoreRepositoryRead(),
          trustScoreRepositoryWrite: new TrustScoreRepositoryWrite(),
          trustEventRepositoryRead: new TrustEventRepositoryRead(),
          sellerLevelService: new SellerLevelService({
            sellerLevelRepositoryRead: new SellerLevelRepositoryRead(),
            sellerLevelRepositoryWrite: new SellerLevelRepositoryWrite(),
          }),
          eventPublisher: publisher,
        }),
        eventPublisher: publisher,
      }),
      eventPublisher: publisher,
      proofCodeIssuer: {
        issueForCase: (_caseId: string) => ({
          code: 'ABCD2345',
          hash: 'a'.repeat(64),
        }),
      },
    });

    const { listing } = await seedListing();
    await service.openCase({
      id: new Types.ObjectId().toHexString(),
      listingId: listing.id,
    });

    expect(publisher.publish).toHaveBeenCalledWith(
      expect.objectContaining({
        eventType: 'verification.case.submitted',
      }),
    );
  });
});
