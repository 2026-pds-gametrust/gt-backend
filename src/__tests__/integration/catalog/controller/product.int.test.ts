import { EUserGroup } from '@sauvvitech/st-packages';
import { signTestAccessToken } from '../../../helpers/sign-test-access-token';
import supertest from 'supertest';
import { app } from '../../../../../jest/setup-integration-tests';
import { CategoryModel } from '../../../../infraestructure/db/mongo/models/category.model';
import { validCategoryMock } from '../../../__mocks__/category.mock';
import { validProductMock } from '../../../__mocks__/product.mock';

describe('when we create a product via HTTP', () => {
  it('should return 201 and the created product', async () => {
    const category = validCategoryMock();
    await CategoryModel.create(category);
    const product = validProductMock({ categoryId: category.id });

    const { body, statusCode } = await supertest(app.app)
      .post('/products')
      .set('Authorization', `Bearer ${signTestAccessToken({ actorId: 'backoffice-actor', groups: [EUserGroup.BACKOFFICE] })}`)
      .send({
        id: product.id,
        categoryId: product.categoryId,
        brand: product.brand,
        model: product.model,
        slug: product.slug,
        sku: product.sku,
        referencePriceCents: product.referencePriceCents,
        currency: product.currency,
      });

    expect(statusCode).toBe(201);
    expect(body).toMatchObject({
      id: product.id,
      slug: product.slug,
    });

    const history = await supertest(app.app).get(
      `/products/${product.id}/price-history`,
    );
    expect(history.statusCode).toBe(200);
    expect(history.body.length).toBeGreaterThanOrEqual(1);
  });
});
