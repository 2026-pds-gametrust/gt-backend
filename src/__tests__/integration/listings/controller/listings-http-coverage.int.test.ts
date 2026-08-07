import { EUserGroup } from '@sauvvitech/st-packages';
import { Types } from 'mongoose';
import supertest from 'supertest';
import { app } from '../../../../../jest/setup-integration-tests';
import { CategoryModel } from '../../../../infraestructure/db/mongo/models/category.model';
import { UserModel } from '../../../../infraestructure/db/mongo/models/user.model';
import { EShippingMode } from '../../../../domain/listings/entity/enums/EShippingMode';
import { validCategoryMock } from '../../../__mocks__/category.mock';
import { validListingMock } from '../../../__mocks__/listing.mock';
import { validProductMock } from '../../../__mocks__/product.mock';
import { validUserMock } from '../../../__mocks__/user.mock';

describe('when listings HTTP routes are exercised', () => {
  it('should cover get list update publish and pause', async () => {
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
      .set('x-user-id', 'backoffice-actor')
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

    const created = await supertest(app.app)
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
    expect(created.statusCode).toBe(201);

    const listed = await supertest(app.app).get('/listings');
    expect(listed.statusCode).toBe(200);
    expect(listed.body.some((item: { id: string }) => item.id === listing.id)).toBe(
      true,
    );

    const got = await supertest(app.app).get(`/listings/${listing.id}`);
    expect(got.statusCode).toBe(200);
    expect(got.body.id).toBe(listing.id);

    const updated = await supertest(app.app)
      .put(`/listings/${listing.id}`)
      .set('x-user-id', user.id)
      .send({ title: `${listing.title} Updated` });
    expect(updated.statusCode).toBe(200);
    expect(updated.body.title).toBe(`${listing.title} Updated`);

    const submitted = await supertest(app.app)
      .post(`/listings/${listing.id}/submit`)
      .set('x-user-id', user.id);
    expect(submitted.statusCode).toBe(200);
    expect(submitted.body.status).toBe('SUBMITTED');

    const published = await supertest(app.app)
      .post(`/listings/${listing.id}/publish`)
      .set('x-user-groups', EUserGroup.BACKOFFICE)
      .set('x-user-id', 'backoffice-actor');
    expect(published.statusCode).toBe(200);
    expect(published.body.status).toBe('PUBLISHED');

    const paused = await supertest(app.app)
      .post(`/listings/${listing.id}/pause`)
      .set('x-user-id', user.id);
    expect(paused.statusCode).toBe(200);
    expect(paused.body.status).toBe('PAUSED');

    const events = await supertest(app.app).get(
      `/listings/${listing.id}/events`,
    );
    expect(events.statusCode).toBe(200);
    expect(events.body.length).toBeGreaterThanOrEqual(3);

    const missing = await supertest(app.app).get(
      `/listings/${new Types.ObjectId().toHexString()}`,
    );
    expect(missing.statusCode).toBe(404);
  });
});
