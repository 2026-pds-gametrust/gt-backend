import { QueryLogServiceEntity } from '../../../../domain/search/entity/query-log.entity';
import { validQueryLogMock } from '../../../__mocks__/search-favorites.mock';

describe('when constructing a query log entity', () => {
  it('should accept a valid query log including empty query string', () => {
    const entity = new QueryLogServiceEntity(
      validQueryLogMock({ query: '', resultCount: 0 }),
    );
    expect(entity.query).toBe('');
    expect(entity.resultCount).toBe(0);
  });

  it('should reject missing id', () => {
    expect(
      () => new QueryLogServiceEntity(validQueryLogMock({ id: ' ' })),
    ).toThrow('id is required');
  });

  it('should reject null query', () => {
    expect(
      () =>
        new QueryLogServiceEntity(
          validQueryLogMock({ query: null as any }),
        ),
    ).toThrow('query is required');
  });

  it('should reject negative resultCount', () => {
    expect(
      () =>
        new QueryLogServiceEntity(validQueryLogMock({ resultCount: -1 })),
    ).toThrow('resultCount must be >= 0');
  });

  it('should reject null resultCount', () => {
    expect(
      () =>
        new QueryLogServiceEntity(
          validQueryLogMock({ resultCount: null as any }),
        ),
    ).toThrow('resultCount must be >= 0');
  });

  it('should reject missing createdAt', () => {
    expect(
      () =>
        new QueryLogServiceEntity(
          validQueryLogMock({ createdAt: undefined as any }),
        ),
    ).toThrow('createdAt is required');
  });
});
