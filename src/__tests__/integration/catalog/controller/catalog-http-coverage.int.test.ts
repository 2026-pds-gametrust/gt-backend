import { EUserGroup } from '@sauvvitech/st-packages';
import { signTestAccessToken } from '../../../helpers/sign-test-access-token';
import supertest from 'supertest';
import { app } from '../../../../../jest/setup-integration-tests';
import { validAttributeDefMock } from '../../../__mocks__/category-attribute-schema.mock';
import { validCategoryMock } from '../../../__mocks__/category.mock';
import { validProductMock } from '../../../__mocks__/product.mock';
import { validServiceTaxonomyMock } from '../../../__mocks__/service-taxonomy.mock';

describe('when catalog HTTP read and update routes are called', () => {
  it('should cover list get and update flows for categories services and products', async () => {
    const category = validCategoryMock();
    const createdCategory = await supertest(app.app)
      .post('/categories')
      .set('Authorization', `Bearer ${signTestAccessToken({ actorId: 'backoffice-actor', groups: [EUserGroup.BACKOFFICE] })}`)
      .send({
        id: category.id,
        name: category.name,
        slug: category.slug,
        synonyms: category.synonyms,
        parentId: null,
        status: category.status,
      });
    expect(createdCategory.statusCode).toBe(201);

    const listedCategories = await supertest(app.app).get('/categories');
    expect(listedCategories.statusCode).toBe(200);
    expect(
      listedCategories.body.some((item: { id: string }) => item.id === category.id),
    ).toBe(true);

    const gotCategory = await supertest(app.app).get(
      `/categories/${category.id}`,
    );
    expect(gotCategory.statusCode).toBe(200);
    expect(gotCategory.body.id).toBe(category.id);

    const updatedCategory = await supertest(app.app)
      .put(`/categories/${category.id}`)
      .set('Authorization', `Bearer ${signTestAccessToken({ actorId: 'backoffice-actor', groups: [EUserGroup.BACKOFFICE] })}`)
      .send({ name: `${category.name} Updated` });
    expect(updatedCategory.statusCode).toBe(200);
    expect(updatedCategory.body.name).toBe(`${category.name} Updated`);

    const schema = await supertest(app.app)
      .put(`/categories/${category.id}/attribute-schema`)
      .set('Authorization', `Bearer ${signTestAccessToken({ actorId: 'backoffice-actor', groups: [EUserGroup.BACKOFFICE] })}`)
      .send({
        attributes: [validAttributeDefMock()],
      });
    expect(schema.statusCode).toBe(200);

    const gotSchema = await supertest(app.app).get(
      `/categories/${category.id}/attribute-schema`,
    );
    expect(gotSchema.statusCode).toBe(200);

    const service = validServiceTaxonomyMock();
    const createdService = await supertest(app.app)
      .post('/services')
      .set('Authorization', `Bearer ${signTestAccessToken({ actorId: 'backoffice-actor', groups: [EUserGroup.BACKOFFICE] })}`)
      .send({
        id: service.id,
        name: service.name,
        slug: service.slug,
        synonyms: service.synonyms,
        status: service.status,
      });
    expect(createdService.statusCode).toBe(201);

    const listedServices = await supertest(app.app).get('/services');
    expect(listedServices.statusCode).toBe(200);

    const gotService = await supertest(app.app).get(`/services/${service.id}`);
    expect(gotService.statusCode).toBe(200);

    const updatedService = await supertest(app.app)
      .put(`/services/${service.id}`)
      .set('Authorization', `Bearer ${signTestAccessToken({ actorId: 'backoffice-actor', groups: [EUserGroup.BACKOFFICE] })}`)
      .send({ name: `${service.name} Updated` });
    expect(updatedService.statusCode).toBe(200);

    const product = validProductMock({
      categoryId: category.id,
      referencePriceCents: 1000,
    });
    const createdProduct = await supertest(app.app)
      .post('/products')
      .set('Authorization', `Bearer ${signTestAccessToken({ actorId: 'backoffice-actor', groups: [EUserGroup.BACKOFFICE] })}`)
      .send({
        id: product.id,
        categoryId: product.categoryId,
        brand: product.brand,
        model: product.model,
        slug: product.slug,
        referencePriceCents: product.referencePriceCents,
      });
    expect(createdProduct.statusCode).toBe(201);

    const listedProducts = await supertest(app.app).get('/products');
    expect(listedProducts.statusCode).toBe(200);

    const gotProduct = await supertest(app.app).get(`/products/${product.id}`);
    expect(gotProduct.statusCode).toBe(200);

    const priceHistory = await supertest(app.app).get(
      `/products/${product.id}/price-history`,
    );
    expect(priceHistory.statusCode).toBe(200);

    const updatedProduct = await supertest(app.app)
      .put(`/products/${product.id}`)
      .set('Authorization', `Bearer ${signTestAccessToken({ actorId: 'backoffice-actor', groups: [EUserGroup.BACKOFFICE] })}`)
      .send({ brand: `${product.brand}-X` });
    expect(updatedProduct.statusCode).toBe(200);
  });
});
