import { EUserGroup } from '@sauvvitech/st-packages';
import { Types } from 'mongoose';
import supertest from 'supertest';
import { app } from '../../../../../jest/setup-integration-tests';
import { CategoryModel } from '../../../../infraestructure/db/mongo/models/category.model';
import { FavoriteModel } from '../../../../infraestructure/db/mongo/models/favorite.model';
import { ProductModel } from '../../../../infraestructure/db/mongo/models/product.model';
import { validCategoryMock } from '../../../__mocks__/category.mock';
import { validProductMock } from '../../../__mocks__/product.mock';
import { assertUnauthorized } from '../../../helpers/auth-assertions';
import { registerMember } from '../../../helpers/auth-http';
import { signTestAccessToken } from '../../../helpers/sign-test-access-token';

async function seedProduct() {
  const category = validCategoryMock();
  await CategoryModel.create(category);
  const product = validProductMock({ categoryId: category.id });
  await ProductModel.create(product);
  return product;
}

describe('when calling favorites without a token', () => {
  it('should return 401 on list create and delete', async () => {
    const listed = await supertest(app.app).get('/favorites');
    assertUnauthorized(listed);

    const created = await supertest(app.app).post('/favorites').send({
      id: new Types.ObjectId().toHexString(),
      targetType: 'PRODUCT',
      targetId: new Types.ObjectId().toHexString(),
    });
    assertUnauthorized(created);

    const deleted = await supertest(app.app).delete(
      `/favorites/${new Types.ObjectId().toHexString()}`,
    );
    assertUnauthorized(deleted);
  });
});

describe('when creating a favorite with a Bearer token', () => {
  it('should bind userId to the token subject and ignore body and query ids', async () => {
    const carlos = await registerMember();
    const rafael = await registerMember();
    const product = await seedProduct();
    const favoriteId = new Types.ObjectId().toHexString();

    const created = await supertest(app.app)
      .post('/favorites')
      .set('Authorization', `Bearer ${carlos.body.accessToken}`)
      .set('x-user-id', rafael.body.user.id)
      .send({
        id: favoriteId,
        userId: rafael.body.user.id,
        targetType: 'PRODUCT',
        targetId: product.id,
      });
    expect(created.statusCode).toBe(201);
    expect(created.body.userId).toBe(carlos.body.user.id);
    expect((await FavoriteModel.findOne({ id: favoriteId }))?.userId).toBe(
      carlos.body.user.id,
    );

    const listed = await supertest(app.app)
      .get('/favorites')
      .set('Authorization', `Bearer ${carlos.body.accessToken}`)
      .set('x-user-id', rafael.body.user.id)
      .query({ userId: rafael.body.user.id });
    expect(listed.statusCode).toBe(200);
    expect(listed.body).toHaveLength(1);
    expect(listed.body[0].userId).toBe(carlos.body.user.id);

    const rafaelList = await supertest(app.app)
      .get('/favorites')
      .set(
        'Authorization',
        `Bearer ${signTestAccessToken({ actorId: rafael.body.user.id, groups: [EUserGroup.APP_USER] })}`,
      )
      .query({ userId: carlos.body.user.id });
    expect(rafaelList.statusCode).toBe(200);
    expect(rafaelList.body).toEqual([]);
  });
});
