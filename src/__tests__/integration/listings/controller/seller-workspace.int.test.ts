import supertest from 'supertest';
import { app } from '../../../../../jest/setup-integration-tests';
import { CategoryModel } from '../../../../infraestructure/db/mongo/models/category.model';
import { ListingModel } from '../../../../infraestructure/db/mongo/models/listing.model';
import { ProductModel } from '../../../../infraestructure/db/mongo/models/product.model';
import { VerificationCaseModel } from '../../../../infraestructure/db/mongo/models/verification-case.model';
import { EListingStatus } from '../../../../domain/listings/entity/enums/EListingStatus';
import { EVerificationCaseStatus } from '../../../../domain/verification/entity/enums/EVerificationCaseStatus';
import { SealModel } from '../../../../infraestructure/db/mongo/models/seal.model';
import { ESealStatus } from '../../../../domain/verification/entity/enums/ESealStatus';
import { ESealType } from '../../../../domain/verification/entity/enums/ESealType';
import { validCategoryMock } from '../../../__mocks__/category.mock';
import { validListingMock } from '../../../__mocks__/listing.mock';
import { validProductMock } from '../../../__mocks__/product.mock';
import { assertUnauthorized } from '../../../helpers/auth-assertions';
import { registerMember } from '../../../helpers/auth-http';

async function seedListing(params: {
  sellerId: string;
  status: EListingStatus;
  id?: string;
  withActiveSeal?: boolean;
}) {
  const category = validCategoryMock();
  await CategoryModel.create(category);
  const product = validProductMock({ categoryId: category.id });
  await ProductModel.create(product);
  const listing = validListingMock({
    ...(params.id ? { id: params.id } : {}),
    sellerId: params.sellerId,
    productId: product.id,
    status: params.status,
  });
  await ListingModel.create(listing);
  if (params.withActiveSeal) {
    await SealModel.create({
      id: `seal-${listing.id}`,
      listingId: listing.id,
      caseId: 'case-seed',
      type: ESealType.FUNCTIONING,
      status: ESealStatus.GRANTED,
      createdAt: new Date(),
    });
  }
  return listing;
}

describe('when seller workspace endpoints are used', () => {
  it('should list only verified published listings on public GET /listings', async () => {
    const seller = await registerMember();
    const other = await registerMember();
    const published = await seedListing({
      sellerId: seller.body.user.id,
      status: EListingStatus.PUBLISHED,
      withActiveSeal: true,
    });
    await seedListing({
      sellerId: other.body.user.id,
      status: EListingStatus.DRAFT,
    });
    await seedListing({
      sellerId: other.body.user.id,
      status: EListingStatus.PUBLISHED,
    });

    const response = await supertest(app.app).get('/listings');
    expect(response.statusCode).toBe(200);
    expect(response.body.items).toHaveLength(1);
    expect(response.body.items[0].id).toBe(published.id);
    expect(response.body.total).toBe(1);
  });

  it('should return only actor listings on GET /listings/mine', async () => {
    const rafael = await registerMember();
    const carlos = await registerMember();
    const mine = await seedListing({
      sellerId: rafael.body.user.id,
      status: EListingStatus.SUBMITTED,
    });
    await seedListing({
      sellerId: carlos.body.user.id,
      status: EListingStatus.SUBMITTED,
    });

    const response = await supertest(app.app)
      .get('/listings/mine')
      .set('Authorization', `Bearer ${rafael.body.accessToken}`);

    expect(response.statusCode).toBe(200);
    expect(response.body.items).toHaveLength(1);
    expect(response.body.items[0].id).toBe(mine.id);
  });

  it('should filter mine listings by status query', async () => {
    const seller = await registerMember();
    await seedListing({
      sellerId: seller.body.user.id,
      status: EListingStatus.DRAFT,
    });
    const submitted = await seedListing({
      sellerId: seller.body.user.id,
      status: EListingStatus.SUBMITTED,
    });

    const response = await supertest(app.app)
      .get('/listings/mine')
      .query({ status: EListingStatus.SUBMITTED })
      .set('Authorization', `Bearer ${seller.body.accessToken}`);

    expect(response.statusCode).toBe(200);
    expect(response.body.items).toHaveLength(1);
    expect(response.body.items[0].id).toBe(submitted.id);
  });

  it('should attach seller-safe verification summary on mine listings', async () => {
    const seller = await registerMember();
    const listing = await seedListing({
      sellerId: seller.body.user.id,
      status: EListingStatus.SUBMITTED,
    });
    await VerificationCaseModel.create({
      id: 'case-seller-1',
      listingId: listing.id,
      status: EVerificationCaseStatus.IN_REVIEW,
      moderatorId: 'camila',
      checklist: { internal: true },
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const response = await supertest(app.app)
      .get('/listings/mine')
      .set('Authorization', `Bearer ${seller.body.accessToken}`);

    expect(response.statusCode).toBe(200);
    expect(response.body.items[0].verificationCase).toMatchObject({
      id: 'case-seller-1',
      status: EVerificationCaseStatus.IN_REVIEW,
    });
    expect(response.body.items[0].verificationCase.moderatorId).toBeUndefined();
  });

  it('should hide non-published listing from anonymous GET by id', async () => {
    const seller = await registerMember();
    const draft = await seedListing({
      sellerId: seller.body.user.id,
      status: EListingStatus.DRAFT,
    });

    const anonymous = await supertest(app.app).get(`/listings/${draft.id}`);
    expect(anonymous.statusCode).toBe(404);

    const owner = await supertest(app.app)
      .get(`/listings/${draft.id}`)
      .set('Authorization', `Bearer ${seller.body.accessToken}`);
    expect(owner.statusCode).toBe(200);
    expect(owner.body.id).toBe(draft.id);
  });

  it('should require auth for GET /listings/mine', async () => {
    const response = await supertest(app.app).get('/listings/mine');
    assertUnauthorized(response);
  });

  it('should return owner profile on GET /profiles/me', async () => {
    const seller = await registerMember();

    const response = await supertest(app.app)
      .get('/profiles/me')
      .set('Authorization', `Bearer ${seller.body.accessToken}`);

    expect(response.statusCode).toBe(200);
    expect(response.body.userId).toBe(seller.body.user.id);
  });
});
