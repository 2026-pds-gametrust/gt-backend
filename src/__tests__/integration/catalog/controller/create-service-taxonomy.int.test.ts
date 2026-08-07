import { EUserGroup } from '@sauvvitech/st-packages';
import supertest from 'supertest';
import { app } from '../../../../../jest/setup-integration-tests';
import { ServiceTaxonomyModel } from '../../../../infraestructure/db/mongo/models/service-taxonomy.model';
import { validServiceTaxonomyMock } from '../../../__mocks__/service-taxonomy.mock';

describe('when we create a valid taxonomy service via HTTP', () => {
  it('should return 201 and the created service', async () => {
    const params = validServiceTaxonomyMock({ synonyms: ['build pc'] });

    const { body, statusCode } = await supertest(app.app)
      .post('/services')
      .set('x-user-groups', EUserGroup.BACKOFFICE)
      .send({
        id: params.id,
        slug: params.slug,
        name: params.name,
        synonyms: params.synonyms,
        status: params.status,
      });

    const inDb = await ServiceTaxonomyModel.findOne({ id: params.id });

    expect(statusCode).toBe(201);
    expect(body).toMatchObject({
      id: params.id,
      slug: params.slug,
      name: params.name,
      synonyms: ['build pc'],
    });
    expect(inDb).toMatchObject({
      id: params.id,
      slug: params.slug,
    });
  });
});
