import { EUserGroup } from '@sauvvitech/st-packages';
import supertest from 'supertest';
import { app } from '../../../../../jest/setup-integration-tests';
import { CategoryModel } from '../../../../infraestructure/db/mongo/models/category.model';
import { validAttributeDefMock } from '../../../__mocks__/category-attribute-schema.mock';
import { validCategoryMock } from '../../../__mocks__/category.mock';

describe('when we upsert attribute schema via HTTP', () => {
  it('should return 200 with the schema', async () => {
    const category = validCategoryMock();
    await CategoryModel.create(category);

    const { body, statusCode } = await supertest(app.app)
      .put(`/categories/${category.id}/attribute-schema`)
      .set('x-user-groups', EUserGroup.BACKOFFICE)
      .send({
        attributes: [validAttributeDefMock()],
      });

    expect(statusCode).toBe(200);
    expect(body).toMatchObject({
      categoryId: category.id,
      version: 1,
    });
  });
});
