import { EUserGroup } from '@sauvvitech/st-packages';
import { signTestAccessToken } from '../../../helpers/sign-test-access-token';
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
import { SealServiceFactory } from '../../../../configuration/factory/seal.service.factory';
import { ESealType } from '../../../../domain/verification/entity/enums/ESealType';

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
      shipping: { modes: [EShippingMode.PICKUP] },
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

    const rejected = await supertest(app.app)
      .post('/listings')
      .set('Authorization', `Bearer ${signTestAccessToken({ actorId: user.id, groups: [EUserGroup.APP_USER] })}`)
      .send({
        id: new Types.ObjectId().toHexString(),
        sellerId: user.id,
        productId: product.id,
        title: 'No media',
        condition: listing.condition,
        priceCents: listing.priceCents,
        currency: listing.currency,
        media: { photoUrls: [], videoUrl: undefined },
        shipping: listing.shipping,
      });
    expect(rejected.statusCode).toBe(400);
    expect(rejected.body).not.toMatchObject({
      errors: expect.arrayContaining([
        expect.objectContaining({
          message: expect.stringContaining("no schema defined for status code '400'"),
        }),
      ]),
    });

    const listed = await supertest(app.app).get('/listings');
    expect(listed.statusCode).toBe(200);
    expect(listed.body.items).toEqual(
      expect.not.arrayContaining([
        expect.objectContaining({ id: listing.id }),
      ]),
    );

    const got = await supertest(app.app).get(`/listings/${listing.id}`);
    expect(got.statusCode).toBe(404);

    const updated = await supertest(app.app)
      .put(`/listings/${listing.id}`)
      .set('Authorization', `Bearer ${signTestAccessToken({ actorId: user.id, groups: [EUserGroup.APP_USER] })}`)
      .send({ title: `${listing.title} Updated` });
    expect(updated.statusCode).toBe(200);
    expect(updated.body.title).toBe(`${listing.title} Updated`);

    const submitted = await supertest(app.app)
      .post(`/listings/${listing.id}/submit`)
      .set('Authorization', `Bearer ${signTestAccessToken({ actorId: user.id, groups: [EUserGroup.APP_USER] })}`)
    expect(submitted.statusCode).toBe(200);
    expect(submitted.body.status).toBe('SUBMITTED');

    const published = await supertest(app.app)
      .post(`/listings/${listing.id}/publish`)
      .set('Authorization', `Bearer ${signTestAccessToken({ actorId: 'backoffice-actor', groups: [EUserGroup.BACKOFFICE] })}`)
    expect(published.statusCode).toBe(200);
    expect(published.body.status).toBe('PUBLISHED');

    const sealService = SealServiceFactory.create();
    await sealService.grantSeal({
      id: new Types.ObjectId().toHexString(),
      listingId: listing.id,
      caseId: new Types.ObjectId().toHexString(),
      type: ESealType.POSSESSION,
      sellerId: user.id,
      sourceEventId: `seal-granted:${listing.id}`,
    });

    const listedAfterPublish = await supertest(app.app).get('/listings');
    expect(listedAfterPublish.statusCode).toBe(200);
    expect(listedAfterPublish.body.items).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: listing.id }),
      ]),
    );

    const paused = await supertest(app.app)
      .post(`/listings/${listing.id}/pause`)
      .set('Authorization', `Bearer ${signTestAccessToken({ actorId: user.id, groups: [EUserGroup.APP_USER] })}`)
    expect(paused.statusCode).toBe(200);
    expect(paused.body.status).toBe('PAUSED');

    const events = await supertest(app.app)
      .get(`/listings/${listing.id}/events`)
      .set(
        'Authorization',
        `Bearer ${signTestAccessToken({ actorId: user.id, groups: [EUserGroup.APP_USER] })}`,
      );
    expect(events.statusCode).toBe(200);
    expect(events.body.length).toBeGreaterThanOrEqual(3);

    const missing = await supertest(app.app).get(
      `/listings/${new Types.ObjectId().toHexString()}`,
    );
    expect(missing.statusCode).toBe(404);
  });
});
