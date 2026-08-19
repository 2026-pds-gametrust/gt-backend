import { EUserGroup } from '@sauvvitech/st-packages';
import { Types } from 'mongoose';
import supertest from 'supertest';
import { app } from '../../../../../jest/setup-integration-tests';
import { CategoryModel } from '../../../../infraestructure/db/mongo/models/category.model';
import { ListingModel } from '../../../../infraestructure/db/mongo/models/listing.model';
import { ProductModel } from '../../../../infraestructure/db/mongo/models/product.model';
import { validCategoryMock } from '../../../__mocks__/category.mock';
import { validListingMock } from '../../../__mocks__/listing.mock';
import { validProductMock } from '../../../__mocks__/product.mock';
import { assertUnauthorized } from '../../../helpers/auth-assertions';
import {
  backofficeBearer,
  registerMember,
} from '../../../helpers/auth-http';

async function seedProduct() {
  const category = validCategoryMock();
  await CategoryModel.create(category);
  const product = validProductMock({
    categoryId: category.id,
    referencePriceCents: undefined,
  });
  await ProductModel.create(product);
  return product;
}

function listingBody(sellerId: string, productId: string, id?: string) {
  const listing = validListingMock({ sellerId, productId });
  return {
    id: id ?? listing.id,
    sellerId,
    productId,
    title: listing.title,
    condition: listing.condition,
    priceCents: listing.priceCents,
    currency: listing.currency,
    media: listing.media,
    shipping: listing.shipping,
  };
}

describe('when calling marketplace discovery GETs without a token', () => {
  it('should succeed or 404 for resource reasons never 401', async () => {
    const product = await seedProduct();
    const carlos = await registerMember();
    const created = await supertest(app.app)
      .post('/listings')
      .set('Authorization', `Bearer ${carlos.body.accessToken}`)
      .send(listingBody(carlos.body.user.id, product.id));
    expect(created.statusCode).toBe(201);

    const search = await supertest(app.app).get('/search').query({ q: 'gpu' });
    expect(search.statusCode).not.toBe(401);

    const categories = await supertest(app.app).get('/categories');
    expect(categories.statusCode).toBe(200);

    const products = await supertest(app.app).get('/products');
    expect(products.statusCode).toBe(200);

    const services = await supertest(app.app).get('/services');
    expect(services.statusCode).toBe(200);

    const listings = await supertest(app.app).get('/listings');
    expect(listings.statusCode).toBe(200);

    const byId = await supertest(app.app).get(`/listings/${created.body.id}`);
    expect([200, 404]).toContain(byId.statusCode);
    expect(byId.statusCode).not.toBe(401);
  });
});

describe('when listing mutations are called without a token', () => {
  it('should return 401 AUTH_UNAUTHORIZED and not create or change a listing', async () => {
    const product = await seedProduct();
    const listingId = new Types.ObjectId().toHexString();
    const before = await ListingModel.countDocuments({ id: listingId });

    const created = await supertest(app.app)
      .post('/listings')
      .send(listingBody('seller-id', product.id, listingId));
    expect(created.statusCode).toBe(401);
    assertUnauthorized(created);
    expect(await ListingModel.countDocuments({ id: listingId })).toBe(before);

    const updated = await supertest(app.app)
      .put(`/listings/${listingId}`)
      .send({ title: 'Nope' });
    expect(updated.statusCode).toBe(401);

    const submitted = await supertest(app.app).post(
      `/listings/${listingId}/submit`,
    );
    expect(submitted.statusCode).toBe(401);

    const paused = await supertest(app.app).post(`/listings/${listingId}/pause`);
    expect(paused.statusCode).toBe(401);
  });
});

describe('when the listing owner calls mutations with Bearer', () => {
  it('should authorize at the authn layer', async () => {
    const product = await seedProduct();
    const carlos = await registerMember();
    const body = listingBody(carlos.body.user.id, product.id);

    const created = await supertest(app.app)
      .post('/listings')
      .set('Authorization', `Bearer ${carlos.body.accessToken}`)
      .send(body);
    expect(created.statusCode).toBe(201);

    const updated = await supertest(app.app)
      .put(`/listings/${body.id}`)
      .set('Authorization', `Bearer ${carlos.body.accessToken}`)
      .send({ title: 'Updated GPU listing title' });
    expect(updated.statusCode).not.toBe(401);
    expect(updated.statusCode).not.toBe(403);

    const submitted = await supertest(app.app)
      .post(`/listings/${body.id}/submit`)
      .set('Authorization', `Bearer ${carlos.body.accessToken}`);
    expect(submitted.statusCode).not.toBe(401);
    expect(submitted.statusCode).not.toBe(403);

    const paused = await supertest(app.app)
      .post(`/listings/${body.id}/pause`)
      .set('Authorization', `Bearer ${carlos.body.accessToken}`);
    expect(paused.statusCode).not.toBe(401);
    expect([200, 400, 409]).toContain(paused.statusCode);
  });
});

describe('when another APP_USER mutates a listing they do not own', () => {
  it('should return 403', async () => {
    const product = await seedProduct();
    const carlos = await registerMember();
    const rafael = await registerMember();
    const body = listingBody(carlos.body.user.id, product.id);
    await supertest(app.app)
      .post('/listings')
      .set('Authorization', `Bearer ${carlos.body.accessToken}`)
      .send(body);

    const updated = await supertest(app.app)
      .put(`/listings/${body.id}`)
      .set('Authorization', `Bearer ${rafael.body.accessToken}`)
      .send({ title: 'Stolen title here' });
    expect(updated.statusCode).toBe(403);

    const submitted = await supertest(app.app)
      .post(`/listings/${body.id}/submit`)
      .set('Authorization', `Bearer ${rafael.body.accessToken}`);
    expect(submitted.statusCode).toBe(403);

    const paused = await supertest(app.app)
      .post(`/listings/${body.id}/pause`)
      .set('Authorization', `Bearer ${rafael.body.accessToken}`);
    expect(paused.statusCode).toBe(403);
  });
});

describe('when an operator route is called without Bearer or with APP_USER', () => {
  it('should return 401 AUTH_UNAUTHORIZED then 403 Access denied', async () => {
    const product = await seedProduct();
    const carlos = await registerMember();
    const body = listingBody(carlos.body.user.id, product.id);
    await supertest(app.app)
      .post('/listings')
      .set('Authorization', `Bearer ${carlos.body.accessToken}`)
      .send(body);

    const noToken = await supertest(app.app)
      .post(`/listings/${body.id}/publish`)
      .set('x-user-groups', EUserGroup.BACKOFFICE);
    expect(noToken.statusCode).toBe(401);
    assertUnauthorized(noToken);
    expect(`${noToken.body.error ?? ''} ${noToken.body.message ?? ''}`).not.toMatch(
      /Missing x-user-groups/i,
    );

    const asAppUser = await supertest(app.app)
      .post(`/listings/${body.id}/publish`)
      .set('Authorization', `Bearer ${carlos.body.accessToken}`);
    expect(asAppUser.statusCode).toBe(403);
    expect(asAppUser.body).toMatchObject({ error: 'Access denied' });

    const categoryNoToken = await supertest(app.app).post('/categories').send({
      id: new Types.ObjectId().toHexString(),
      slug: `gpus-${Date.now()}`,
      name: 'GPUs',
    });
    expect(categoryNoToken.statusCode).toBe(401);
    assertUnauthorized(categoryNoToken);

    const categoryAsUser = await supertest(app.app)
      .post('/categories')
      .set('Authorization', `Bearer ${carlos.body.accessToken}`)
      .send({
        id: new Types.ObjectId().toHexString(),
        slug: `gpus-${Date.now()}`,
        name: 'GPUs',
      });
    expect(categoryAsUser.statusCode).toBe(403);
    expect(categoryAsUser.body).toMatchObject({ error: 'Access denied' });
  });
});

describe('when a BACKOFFICE token calls an existing operator route', () => {
  it('should accept token groups on publish and catalog write', async () => {
    const product = await seedProduct();
    const carlos = await registerMember();
    const body = listingBody(carlos.body.user.id, product.id);
    await supertest(app.app)
      .post('/listings')
      .set('Authorization', `Bearer ${carlos.body.accessToken}`)
      .send(body);
    await supertest(app.app)
      .post(`/listings/${body.id}/submit`)
      .set('Authorization', `Bearer ${carlos.body.accessToken}`);

    const publish = await supertest(app.app)
      .post(`/listings/${body.id}/publish`)
      .set('Authorization', backofficeBearer());
    expect(publish.statusCode).not.toBe(401);
    expect(publish.statusCode).not.toBe(403);

    const category = validCategoryMock({
      slug: `auth-op-${new Types.ObjectId().toHexString()}`,
      synonyms: [`syn-${new Types.ObjectId().toHexString()}`],
    });
    const createdCategory = await supertest(app.app)
      .post('/categories')
      .set('Authorization', backofficeBearer())
      .send({
        id: category.id,
        slug: category.slug,
        name: category.name,
        synonyms: category.synonyms,
        parentId: null,
        status: category.status,
      });
    expect(createdCategory.statusCode).not.toBe(401);
    expect(createdCategory.statusCode).not.toBe(403);
  });
});

describe('when calling discovery-adjacent GETs that this slice does not gate', () => {
  it('should not return a new 401 from requireAccessToken', async () => {
    const product = await seedProduct();
    const carlos = await registerMember();
    const created = await supertest(app.app)
      .post('/listings')
      .set('Authorization', `Bearer ${carlos.body.accessToken}`)
      .send(listingBody(carlos.body.user.id, product.id));

    const events = await supertest(app.app).get(
      `/listings/${created.body.id}/events`,
    );
    expect(events.statusCode).not.toBe(401);

    const synonyms = await supertest(app.app).get('/synonyms').query({ q: 'gpu' });
    expect(synonyms.statusCode).not.toBe(401);
  });
});
