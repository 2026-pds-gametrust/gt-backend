import { SynonymServiceEntity } from '../../../../domain/search/entity/synonym.entity';
import { validSynonymMock } from '../../../__mocks__/search-favorites.mock';

describe('when constructing a synonym entity', () => {
  it('should accept a valid synonym and trim canonicalName', () => {
    const entity = new SynonymServiceEntity(
      validSynonymMock({ canonicalName: '  GPUs  ' }),
    );
    expect(entity.canonicalName).toBe('GPUs');
  });

  it('should reject missing id', () => {
    expect(
      () => new SynonymServiceEntity(validSynonymMock({ id: ' ' })),
    ).toThrow('id is required');
  });

  it('should reject missing normalizedTerm', () => {
    expect(
      () =>
        new SynonymServiceEntity(validSynonymMock({ normalizedTerm: '' })),
    ).toThrow('normalizedTerm is required');
  });

  it('should reject missing targetType', () => {
    expect(
      () =>
        new SynonymServiceEntity(
          validSynonymMock({ targetType: undefined as any }),
        ),
    ).toThrow('targetType is required');
  });

  it('should reject missing targetId', () => {
    expect(
      () => new SynonymServiceEntity(validSynonymMock({ targetId: ' ' })),
    ).toThrow('targetId is required');
  });

  it('should reject missing canonicalName', () => {
    expect(
      () =>
        new SynonymServiceEntity(validSynonymMock({ canonicalName: '  ' })),
    ).toThrow('canonicalName is required');
  });
});
