import { EUserGroup } from '@sauvvitech/st-packages';
import { signTestAccessToken } from '../../helpers/sign-test-access-token';
import { Types } from 'mongoose';
import supertest from 'supertest';
import { app } from '../../../../jest/setup-integration-tests';
import { ListingServiceFactory } from '../../../configuration/factory/listing.service.factory';
import { ProductServiceFactory } from '../../../configuration/factory/product.service.factory';
import { SearchDocumentServiceFactory } from '../../../configuration/factory/search-document.service.factory';
import { VerificationCaseServiceFactory } from '../../../configuration/factory/verification-case.service.factory';
import { EListingStatus } from '../../../domain/listings/entity/enums/EListingStatus';
import { EShippingMode } from '../../../domain/listings/entity/enums/EShippingMode';
import { EVerificationCaseStatus } from '../../../domain/verification/entity/enums/EVerificationCaseStatus';
import { CategoryModel } from '../../../infraestructure/db/mongo/models/category.model';
import { SearchDocumentModel } from '../../../infraestructure/db/mongo/models/search-document.model';
import { UserModel } from '../../../infraestructure/db/mongo/models/user.model';
import { VerificationCaseModel } from '../../../infraestructure/db/mongo/models/verification-case.model';
import { sellerActor } from '../../__mocks__/actor.mock';
import { validCategoryMock } from '../../__mocks__/category.mock';
import { validListingMock } from '../../__mocks__/listing.mock';
import { validProductMock } from '../../__mocks__/product.mock';
import { validUserMock } from '../../__mocks__/user.mock';

const listingService = ListingServiceFactory.create();
const productService = ProductServiceFactory.create();
const verificationCaseService = VerificationCaseServiceFactory.create();
const searchDocumentService = SearchDocumentServiceFactory.create();

/**
 * Phase 1 hardening funnel (E22–E25):
 * submit → verification case (handler) → approve → auto-publish → search → favorite ownership.
 */
describe('when Phase 1 hardening funnel runs end-to-end', () => {
  it('should submit, open case, auto-publish on approve, search, and favorite with x-user-id', async () => {
    const seller = validUserMock();
    const buyer = validUserMock();
    await UserModel.create(seller);
    await UserModel.create(buyer);

    const category = validCategoryMock();
    await CategoryModel.create(category);
    const product = validProductMock({
      categoryId: category.id,
      referencePriceCents: undefined,
    });
    await productService.createProduct(product);

    const uniqueToken = `E26HardeningGPU-${Date.now()}`;
    const created = await listingService.createListing(
      validListingMock({
        sellerId: seller.id,
        productId: product.id,
        title: uniqueToken,
        shipping: { modes: [EShippingMode.PICKUP] },
      }),
      sellerActor(seller.id),
    );

    const submitted = await listingService.submitListing(
      created.id,
      sellerActor(seller.id),
    );
    expect(submitted.status).toBe(EListingStatus.SUBMITTED);

    const openCases = await VerificationCaseModel.find({
      listingId: created.id,
    });
    expect(openCases).toHaveLength(1);

    await verificationCaseService.assignReviewer(openCases[0].id, {
      moderatorId: 'mod-e26',
    });
    const approved = await verificationCaseService.approveCase(
      openCases[0].id,
    );
    expect(approved.status).toBe(EVerificationCaseStatus.APPROVED);

    const published = await listingService.getListingById(created.id);
    expect(published.status).toBe(EListingStatus.PUBLISHED);

    const searchDoc = await SearchDocumentModel.findOne({
      listingId: created.id,
    });
    expect(searchDoc).not.toBeNull();
    expect(searchDoc?.status).toBe(EListingStatus.PUBLISHED);

    const searchHits = await searchDocumentService.search({ q: uniqueToken });
    expect(searchHits.some((hit) => hit.listingId === created.id)).toBe(true);

    const favoriteId = new Types.ObjectId().toHexString();
    const favorited = await supertest(app.app)
      .post('/favorites')
      .set('Authorization', `Bearer ${signTestAccessToken({ actorId: buyer.id, groups: [EUserGroup.APP_USER] })}`)
      .send({
        id: favoriteId,
        userId: 'spoofed-other-user',
        targetType: 'LISTING',
        targetId: created.id,
      });

    expect(favorited.statusCode).toBe(201);
    expect(favorited.body).toMatchObject({
      id: favoriteId,
      userId: buyer.id,
      targetType: 'LISTING',
      targetId: created.id,
    });
  });
});
