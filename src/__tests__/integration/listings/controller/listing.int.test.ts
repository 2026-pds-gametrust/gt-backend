import { EUserGroup } from '@sauvvitech/st-packages';
import { signTestAccessToken } from '../../../helpers/sign-test-access-token';
import supertest from 'supertest';
import { app } from '../../../../../jest/setup-integration-tests';
import { CategoryModel } from '../../../../infraestructure/db/mongo/models/category.model';
import { UserModel } from '../../../../infraestructure/db/mongo/models/user.model';
import { validCategoryMock } from '../../../__mocks__/category.mock';
import { validListingMock } from '../../../__mocks__/listing.mock';
import { validProductMock } from '../../../__mocks__/product.mock';
import { validUserMock } from '../../../__mocks__/user.mock';

describe('when we create and submit a listing via HTTP', () => {
  it('should return 201 then transition to SUBMITTED', async () => {
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
      .set('Authorization', `Bearer ${signTestAccessToken({ actorId: 'backoffice-actor', groups: [EUserGroup.BACKOFFICE] })}`)
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
    });

    const created = await supertest(app.app)
      .post('/listings')
      .set('Authorization', `Bearer ${signTestAccessToken({ actorId: user.id, groups: [EUserGroup.APP_USER] })}`)
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

    expect(created.statusCode).toBe(201);
    expect(created.body.status).toBe('DRAFT');

    const submitted = await supertest(app.app)
      .post(`/listings/${listing.id}/submit`)
      .set('Authorization', `Bearer ${signTestAccessToken({ actorId: user.id, groups: [EUserGroup.APP_USER] })}`)
    expect(submitted.statusCode).toBe(200);
    expect(submitted.body.status).toBe('SUBMITTED');

    const events = await supertest(app.app).get(
      `/listings/${listing.id}/events`,
    );
    expect(events.statusCode).toBe(200);
    expect(events.body.length).toBeGreaterThanOrEqual(2);
  });
});
