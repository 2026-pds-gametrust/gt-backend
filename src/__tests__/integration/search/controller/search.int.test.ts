import { EUserGroup } from '@sauvvitech/st-packages';
import { signTestAccessToken } from '../../../helpers/sign-test-access-token';
import { Types } from 'mongoose';
import supertest from 'supertest';
import { app } from '../../../../../jest/setup-integration-tests';
import { CategoryModel } from '../../../../infraestructure/db/mongo/models/category.model';
import { SearchDocumentModel } from '../../../../infraestructure/db/mongo/models/search-document.model';
import { SynonymModel } from '../../../../infraestructure/db/mongo/models/synonym.model';
import { validCategoryMock } from '../../../__mocks__/category.mock';

describe('when we search via HTTP', () => {
  it('should return matching published documents', async () => {
    const listingId = new Types.ObjectId().toHexString();
    await SearchDocumentModel.create({
      id: listingId,
      listingId,
      productId: new Types.ObjectId().toHexString(),
      categoryId: new Types.ObjectId().toHexString(),
      sellerId: new Types.ObjectId().toHexString(),
      title: 'HTTP Searchable Listing',
      brand: 'MSI',
      condition: 'GOOD',
      status: 'PUBLISHED',
      priceCents: 200000,
      currency: 'BRL',
      searchText: 'http searchable listing msi',
      sourceOccurredAt: new Date(),
    });

    const response = await supertest(app.app).get('/search').query({
      q: 'HTTP Searchable',
    });

    expect(response.statusCode).toBe(200);
    expect(response.body.length).toBeGreaterThanOrEqual(1);
    expect(response.body[0].listingId).toBe(listingId);
  });

  it('should return 200 when q is omitted', async () => {
    const response = await supertest(app.app).get('/search');

    expect(response.statusCode).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
  });

  it('should return 200 when q is an empty string', async () => {
    const response = await supertest(app.app).get('/search').query({ q: '' });

    expect(response.statusCode).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
  });

  it('should omit null optional fields so the contract stays valid', async () => {
    const listingId = new Types.ObjectId().toHexString();
    const uniqueToken = `nobrand-${listingId}`;
    await SearchDocumentModel.create({
      id: listingId,
      listingId,
      productId: new Types.ObjectId().toHexString(),
      categoryId: new Types.ObjectId().toHexString(),
      sellerId: new Types.ObjectId().toHexString(),
      title: uniqueToken,
      brand: null,
      model: null,
      condition: 'GOOD',
      status: 'PUBLISHED',
      priceCents: 150000,
      currency: 'BRL',
      searchText: uniqueToken,
      embedding: null,
      sourceOccurredAt: new Date(),
    });

    const response = await supertest(app.app).get('/search').query({
      q: uniqueToken,
    });

    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveLength(1);
    expect(response.body[0].listingId).toBe(listingId);
    expect(response.body[0].brand).toBeUndefined();
    expect(response.body[0].model).toBeUndefined();
  });
});

describe('when we list synonyms via HTTP', () => {
  it('should return projected synonyms', async () => {
    const category = validCategoryMock({ synonyms: ['vga-card'] });
    await CategoryModel.create(category);

    await supertest(app.app)
      .post('/categories')
      .set('Authorization', `Bearer ${signTestAccessToken({ actorId: 'backoffice-actor', groups: [EUserGroup.BACKOFFICE] })}`)
      .send({
        id: new Types.ObjectId().toHexString(),
        slug: `gpus-${Date.now()}`,
        name: `GPUs Synonym ${Date.now()}`,
        synonyms: ['placa-video-test'],
      });

    const response = await supertest(app.app)
      .get('/synonyms')
      .query({ q: 'placa-video-test' });

    expect(response.statusCode).toBe(200);
    expect(
      response.body.some(
        (item: { normalizedTerm: string }) =>
          item.normalizedTerm === 'placa-video-test',
      ),
    ).toBe(true);

    const persisted = await SynonymModel.find({
      normalizedTerm: 'placa-video-test',
    });
    expect(persisted.length).toBeGreaterThanOrEqual(1);
  });
});
