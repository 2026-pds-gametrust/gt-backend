import { ServiceTaxonomyServiceEntity } from '../../../../domain/catalog/entity/service-taxonomy.entity';
import { EServiceTaxonomyStatus } from '../../../../domain/catalog/entity/enums/EServiceTaxonomyStatus';
import { validServiceTaxonomyMock } from '../../../__mocks__/service-taxonomy.mock';

describe('when constructing a service taxonomy entity', () => {
  it('should accept a valid service and normalize slug and synonyms', () => {
    const entity = new ServiceTaxonomyServiceEntity(
      validServiceTaxonomyMock({
        slug: '  Build-PC  ',
        name: '  Montagem  ',
        synonyms: [' Montar PC ', ''],
      }),
    );
    expect(entity.slug).toBe('build-pc');
    expect(entity.name).toBe('Montagem');
    expect(entity.synonyms).toEqual(['montar pc']);
    expect(entity.status).toBe(EServiceTaxonomyStatus.ACTIVE);
  });

  it('should reject missing slug', () => {
    expect(
      () =>
        new ServiceTaxonomyServiceEntity(
          validServiceTaxonomyMock({ slug: '  ' }),
        ),
    ).toThrow('Slug is required');
  });

  it('should reject missing name', () => {
    expect(
      () =>
        new ServiceTaxonomyServiceEntity(
          validServiceTaxonomyMock({ name: '' }),
        ),
    ).toThrow('Name is required');
  });
});
