import { EUserGroup } from '@sauvvitech/st-packages';
import { signTestAccessToken } from '../../../helpers/sign-test-access-token';
import { Types } from 'mongoose';
import supertest from 'supertest';
import { app } from '../../../../../jest/setup-integration-tests';
import { CategoryModel } from '../../../../infraestructure/db/mongo/models/category.model';
import { FavoriteModel } from '../../../../infraestructure/db/mongo/models/favorite.model';
import { ProductModel } from '../../../../infraestructure/db/mongo/models/product.model';
import { UserModel } from '../../../../infraestructure/db/mongo/models/user.model';
import { validCategoryMock } from '../../../__mocks__/category.mock';
import { validProductMock } from '../../../__mocks__/product.mock';
import { validUserMock } from '../../../__mocks__/user.mock';

describe('when we manage favorites via HTTP', () => {
  it('should create, reject duplicate and delete', async () => {
    const user = validUserMock();
    await UserModel.create(user);
    const category = validCategoryMock();
    await CategoryModel.create(category);
    const product = validProductMock({ categoryId: category.id });
    await ProductModel.create(product);

    const favoriteId = new Types.ObjectId().toHexString();

    const created = await supertest(app.app)
      .post('/favorites')
      .set('Authorization', `Bearer ${signTestAccessToken({ actorId: user.id, groups: [EUserGroup.APP_USER] })}`)
      .send({
        id: favoriteId,
        userId: 'spoofed-other-user',
        targetType: 'PRODUCT',
        targetId: product.id,
      });
    expect(created.statusCode).toBe(201);
    expect(created.body).toMatchObject({
      id: favoriteId,
      userId: user.id,
      targetType: 'PRODUCT',
      targetId: product.id,
    });

    const duplicate = await supertest(app.app)
      .post('/favorites')
      .set('Authorization', `Bearer ${signTestAccessToken({ actorId: user.id, groups: [EUserGroup.APP_USER] })}`)
      .send({
        id: new Types.ObjectId().toHexString(),
        targetType: 'PRODUCT',
        targetId: product.id,
      });
    expect(duplicate.statusCode).toBe(409);

    const listed = await supertest(app.app)
      .get('/favorites')
      .set(
        'Authorization',
        `Bearer ${signTestAccessToken({ actorId: user.id, groups: [EUserGroup.APP_USER] })}`,
      )
      .query({ userId: 'spoofed-other-user' });
    expect(listed.statusCode).toBe(200);
    expect(listed.body.length).toBe(1);

    const deleted = await supertest(app.app)
      .delete(`/favorites/${favoriteId}`)
      .set('Authorization', `Bearer ${signTestAccessToken({ actorId: user.id, groups: [EUserGroup.APP_USER] })}`)
    expect(deleted.statusCode).toBe(204);

    const after = await FavoriteModel.findOne({ id: favoriteId });
    expect(after).toBeNull();
  });
});
