import { EUserGroup } from '@sauvvitech/st-packages';
import { Types } from 'mongoose';
import supertest from 'supertest';
import { app } from '../../../../../jest/setup-integration-tests';
import { CategoryModel } from '../../../../infraestructure/db/mongo/models/category.model';
import { UserModel } from '../../../../infraestructure/db/mongo/models/user.model';
import { validCategoryMock } from '../../../__mocks__/category.mock';
import { validListingMock } from '../../../__mocks__/listing.mock';
import { validProductMock } from '../../../__mocks__/product.mock';
import { validUserMock } from '../../../__mocks__/user.mock';
import { EShippingMode } from '../../../../domain/listings/entity/enums/EShippingMode';

describe('when we open assign and approve a verification case via HTTP', () => {
  it('should return 201 then APPROVED after backoffice approve', async () => {
    const user = validUserMock();
    await UserModel.create(user);
    const category = validCategoryMock();
    await CategoryModel.create(category);
    const product = validProductMock({
      categoryId: category.id,
      referencePriceCents: undefined,
    });

    await supertest(app.app)
      .post('/products')
      .set('x-user-groups', EUserGroup.BACKOFFICE)
      .send({
        id: product.id,
        categoryId: product.categoryId,
        brand: product.brand,
        model: product.model,
        slug: product.slug,
      });

    const listing = validListingMock({
      sellerId: user.id,
      productId: product.id,
      shipping: { modes: [EShippingMode.PICKUP] },
    });

    const createdListing = await supertest(app.app)
      .post('/listings')
      .set('x-user-id', user.id)
      .send({
        id: listing.id,
        sellerId: listing.sellerId,
        productId: listing.productId,
        title: listing.title,
        condition: listing.condition,
        priceCents: listing.priceCents,
        currency: listing.currency,
        media: listing.media,
        shipping: listing.shipping,
      });
    expect(createdListing.statusCode).toBe(201);

    const caseId = new Types.ObjectId().toHexString();
    const opened = await supertest(app.app).post('/verification-cases').send({
      id: caseId,
      listingId: listing.id,
    });
    expect(opened.statusCode).toBe(201);
    expect(opened.body.status).toBe('PENDING');

    const assigned = await supertest(app.app)
      .post(`/verification-cases/${caseId}/assign`)
      .set('x-user-groups', EUserGroup.BACKOFFICE)
      .send({ moderatorId: 'mod-1' });
    expect(assigned.statusCode).toBe(200);
    expect(assigned.body.status).toBe('IN_REVIEW');

    const evidence = await supertest(app.app)
      .post(`/verification-cases/${caseId}/evidence`)
      .send({
        id: new Types.ObjectId().toHexString(),
        type: 'PHOTO',
        storageKey: 'private/evidence/1.jpg',
      });
    expect(evidence.statusCode).toBe(201);

    const approved = await supertest(app.app)
      .post(`/verification-cases/${caseId}/approve`)
      .set('x-user-groups', EUserGroup.BACKOFFICE)
      .send({});
    expect(approved.statusCode).toBe(200);
    expect(approved.body.status).toBe('APPROVED');

    const seals = await supertest(app.app).get(
      `/seals?listingId=${listing.id}`,
    );
    expect(seals.statusCode).toBe(200);
    expect(seals.body.length).toBe(1);
    expect(seals.body[0].status).toBe('GRANTED');

    const score = await supertest(app.app).get(`/trust-scores/${user.id}`);
    expect(score.statusCode).toBe(200);
    expect(score.body.score).toBe(20);
  });
});
