import { ServiceTaxonomyRepositoryWrite } from '../../../../../infraestructure/repository/catalog/service-taxonomy.repository.write';
import { ServiceTaxonomyModel } from '../../../../../infraestructure/db/mongo/models/service-taxonomy.model';
import { EServiceTaxonomyStatus } from '../../../../../domain/catalog/entity/enums/EServiceTaxonomyStatus';
import { validServiceTaxonomyMock } from '../../../../__mocks__/service-taxonomy.mock';

const repositoryWrite = new ServiceTaxonomyRepositoryWrite();

describe('when we create a service taxonomy via repository', () => {
  it('should return the created service as a domain object', async () => {
    const service = validServiceTaxonomyMock({ synonyms: [] });

    const created = await repositoryWrite.create(service);

    expect(created).toMatchObject({
      id: service.id,
      slug: service.slug,
      name: service.name,
    });
    expect(created.createdAt).toBeDefined();
  });
});

describe('when we update a service taxonomy by id via repository', () => {
  it('should return the updated service when it exists', async () => {
    const service = validServiceTaxonomyMock({ synonyms: [] });
    await ServiceTaxonomyModel.create(service);

    const updated = await repositoryWrite.updateById(service.id, {
      name: 'Updated Service',
      status: EServiceTaxonomyStatus.INACTIVE,
    });

    expect(updated).toMatchObject({
      id: service.id,
      name: 'Updated Service',
      status: EServiceTaxonomyStatus.INACTIVE,
    });
  });

  it('should return null when the service does not exist', async () => {
    const updated = await repositoryWrite.updateById('missing-id', {
      name: 'Nope',
    });
    expect(updated).toBeNull();
  });
});
