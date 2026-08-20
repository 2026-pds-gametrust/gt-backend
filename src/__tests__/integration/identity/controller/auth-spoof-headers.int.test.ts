import { EUserGroup } from '@sauvvitech/st-packages';
import { Types } from 'mongoose';
import supertest from 'supertest';
import { app } from '../../../../../jest/setup-integration-tests';
import { CategoryModel } from '../../../../infraestructure/db/mongo/models/category.model';
import { FavoriteModel } from '../../../../infraestructure/db/mongo/models/favorite.model';
import { ListingModel } from '../../../../infraestructure/db/mongo/models/listing.model';
import { ProductModel } from '../../../../infraestructure/db/mongo/models/product.model';
import { UserModel } from '../../../../infraestructure/db/mongo/models/user.model';
import { validCategoryMock } from '../../../__mocks__/category.mock';
import { validListingMock } from '../../../__mocks__/listing.mock';
import { validAddressMock } from '../../../__mocks__/profile.mock';
import { validProductMock } from '../../../__mocks__/product.mock';
import { validUserMock } from '../../../__mocks__/user.mock';
import { signTestAccessToken } from '../../../helpers/sign-test-access-token';
import { assertUnauthorized } from '../../../helpers/auth-assertions';
import { appUserBearer, registerMember } from '../../../helpers/auth-http';

describe('when spoofed x-user-* headers are sent without Bearer', () => {
  it('should return 401 and not mutate listing favorite profile or User PII', async () => {
    const carlos = await registerMember();
    const rafael = validUserMock();
    await UserModel.create(rafael);
    const category = validCategoryMock();
    await CategoryModel.create(category);
    const product = validProductMock({ categoryId: category.id });
    await ProductModel.create(product);
    const listing = validListingMock({
      sellerId: carlos.body.user.id,
      productId: product.id,
    });
    await ListingModel.create(listing);

    const spoof = {
      'x-user-id': carlos.body.user.id,
      'x-user-groups': `${EUserGroup.BACKOFFICE},${EUserGroup.ADMIN}`,
    };

    const listingCreate = await supertest(app.app)
      .post('/listings')
      .set(spoof)
      .send({
        id: new Types.ObjectId().toHexString(),
        sellerId: carlos.body.user.id,
        productId: product.id,
        title: listing.title,
        condition: listing.condition,
        priceCents: listing.priceCents,
        currency: listing.currency,
        media: listing.media,
        shipping: listing.shipping,
      });
    expect(listingCreate.statusCode).toBe(401);
    assertUnauthorized(listingCreate);

    const publish = await supertest(app.app)
      .post(`/listings/${listing.id}/publish`)
      .set(spoof);
    expect(publish.statusCode).toBe(401);

    const favorite = await supertest(app.app)
      .post('/favorites')
      .set(spoof)
      .send({
        id: new Types.ObjectId().toHexString(),
        targetType: 'PRODUCT',
        targetId: product.id,
      });
    expect(favorite.statusCode).toBe(401);
    expect(await FavoriteModel.countDocuments()).toBe(0);

    const address = validAddressMock();
    const profileWrite = await supertest(app.app)
      .post('/profiles')
      .set(spoof)
      .send({
        id: new Types.ObjectId().toHexString(),
        userId: carlos.body.user.id,
        displayName: 'Spoofed',
        addresses: [address],
        defaultShippingAddressId: address.id,
      });
    expect(profileWrite.statusCode).toBe(401);

    const pii = await supertest(app.app)
      .get(`/users/${carlos.body.user.id}`)
      .set(spoof);
    expect(pii.statusCode).toBe(401);
    expect(pii.body.email).toBeUndefined();
    expect(pii.body.cpf).toBeUndefined();
  });
});

describe('when a valid APP_USER token is sent with spoofed x-user-* headers', () => {
  it('should take actor id and groups from the token not the headers', async () => {
    const carlos = await registerMember();
    const rafael = await registerMember();
    const category = validCategoryMock();
    await CategoryModel.create(category);
    const product = validProductMock({ categoryId: category.id });
    await ProductModel.create(product);
    const listing = validListingMock({
      sellerId: carlos.body.user.id,
      productId: product.id,
    });

    const created = await supertest(app.app)
      .post('/listings')
      .set('Authorization', `Bearer ${carlos.body.accessToken}`)
      .set('x-user-id', rafael.body.user.id)
      .set('x-user-groups', EUserGroup.BACKOFFICE)
      .send({
        id: listing.id,
        sellerId: carlos.body.user.id,
        productId: product.id,
        title: listing.title,
        condition: listing.condition,
        priceCents: listing.priceCents,
        currency: listing.currency,
        media: listing.media,
        shipping: listing.shipping,
      });
    expect(created.statusCode).toBe(201);

    const publish = await supertest(app.app)
      .post(`/listings/${listing.id}/publish`)
      .set('Authorization', `Bearer ${carlos.body.accessToken}`)
      .set('x-user-id', 'backoffice-actor')
      .set('x-user-groups', EUserGroup.BACKOFFICE);
    expect(publish.statusCode).toBe(403);
    expect(publish.body).toMatchObject({ error: 'Access denied' });

    const favoriteId = new Types.ObjectId().toHexString();
    const favorite = await supertest(app.app)
      .post('/favorites')
      .set('Authorization', `Bearer ${carlos.body.accessToken}`)
      .set('x-user-id', rafael.body.user.id)
      .set('x-user-groups', EUserGroup.BACKOFFICE)
      .send({
        id: favoriteId,
        userId: rafael.body.user.id,
        targetType: 'PRODUCT',
        targetId: product.id,
      });
    expect(favorite.statusCode).toBe(201);
    expect(favorite.body.userId).toBe(carlos.body.user.id);

    const asRafaelOwner = await supertest(app.app)
      .put(`/listings/${listing.id}`)
      .set(
        'Authorization',
        `Bearer ${signTestAccessToken({ actorId: rafael.body.user.id, groups: [EUserGroup.APP_USER] })}`,
      )
      .set('x-user-id', carlos.body.user.id)
      .send({ title: 'Hijacked title' });
    expect(asRafaelOwner.statusCode).toBe(403);
  });
});

describe('when signTestAccessToken is used as Bearer', () => {
  it('should be accepted by attachActorFromAccessToken on a gated route', async () => {
    const user = validUserMock();
    await UserModel.create(user);

    const response = await supertest(app.app)
      .get(`/users/${user.id}`)
      .set('Authorization', appUserBearer(user.id));

    expect(response.statusCode).toBe(200);
    expect(response.body.id).toBe(user.id);
  });
});
