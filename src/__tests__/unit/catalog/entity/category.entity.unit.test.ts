import { CategoryServiceEntity } from '../../../../domain/catalog/entity/category.entity';
import { ECategoryStatus } from '../../../../domain/catalog/entity/enums/ECategoryStatus';
import { validCategoryMock } from '../../../__mocks__/category.mock';

describe('when constructing a category entity', () => {
  it('should accept a valid category and normalize slug and synonyms', () => {
    const entity = new CategoryServiceEntity(
      validCategoryMock({
        slug: '  GPUs  ',
        name: '  Graphics Cards  ',
        synonyms: [' Placa de Vídeo ', ''],
      }),
    );
    expect(entity.slug).toBe('gpus');
    expect(entity.name).toBe('Graphics Cards');
    expect(entity.synonyms).toEqual(['placa de vídeo']);
    expect(entity.status).toBe(ECategoryStatus.ACTIVE);
  });

  it('should reject missing slug', () => {
    expect(
      () => new CategoryServiceEntity(validCategoryMock({ slug: '  ' })),
    ).toThrow('Slug is required');
  });

  it('should reject missing name', () => {
    expect(
      () => new CategoryServiceEntity(validCategoryMock({ name: '' })),
    ).toThrow('Name is required');
  });
});
