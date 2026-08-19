import { EUserGroup } from '@sauvvitech/st-packages';
import { signTestAccessToken } from '../../../helpers/sign-test-access-token';
import supertest from 'supertest';
import { app } from '../../../../../jest/setup-integration-tests';
import { CategoryModel } from '../../../../infraestructure/db/mongo/models/category.model';
import { validCategoryMock } from '../../../__mocks__/category.mock';

describe('when we create a valid category via HTTP', () => {
  it('should return 201 and the created category', async () => {
    const params = validCategoryMock({ synonyms: ['gpu'] });

    const { body, statusCode } = await supertest(app.app)
      .post('/categories')
      .set('Authorization', `Bearer ${signTestAccessToken({ actorId: 'backoffice-actor', groups: [EUserGroup.BACKOFFICE] })}`)
      .send({
        id: params.id,
        slug: params.slug,
        name: params.name,
        synonyms: params.synonyms,
        parentId: null,
        status: params.status,
      });

    const inDb = await CategoryModel.findOne({ id: params.id });

    expect(statusCode).toBe(201);
    expect(body).toMatchObject({
      id: params.id,
      slug: params.slug,
      name: params.name,
      synonyms: ['gpu'],
    });
    expect(inDb).toMatchObject({
      id: params.id,
      slug: params.slug,
    });
  });
});
