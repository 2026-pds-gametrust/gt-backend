import { ServiceTaxonomyRepositoryRead } from '../../../../../infraestructure/repository/catalog/service-taxonomy.repository.read';
import { ServiceTaxonomyModel } from '../../../../../infraestructure/db/mongo/models/service-taxonomy.model';
import { EErrorCode } from '../../../../../domain/common/errors/enums/EErrorCode';
import { validServiceTaxonomyMock } from '../../../../__mocks__/service-taxonomy.mock';

const repositoryRead = new ServiceTaxonomyRepositoryRead();

afterEach(() => {
  jest.restoreAllMocks();
});

describe('when we find a service taxonomy by id via repository', () => {
  it('should return the service when it exists', async () => {
    const service = validServiceTaxonomyMock({ synonyms: [] });
    await ServiceTaxonomyModel.create(service);

    const found = await repositoryRead.findById(service.id);

    expect(found).toMatchObject({
      id: service.id,
      slug: service.slug,
      name: service.name,
    });
  });

  it('should return null when the service does not exist', async () => {
    const found = await repositoryRead.findById('nonexistent-id');
    expect(found).toBeNull();
  });
});

describe('when ServiceTaxonomyModel.findOne rejects for findById', () => {
  it('should reject with DATABASE_ERROR', async () => {
    jest
      .spyOn(ServiceTaxonomyModel, 'findOne')
      .mockRejectedValue(new Error('mongo failure'));

    await expect(repositoryRead.findById('any-id')).rejects.toMatchObject({
      status: 500,
      errorCode: EErrorCode.DATABASE_ERROR,
    });
  });
});
