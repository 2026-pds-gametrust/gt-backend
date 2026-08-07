import { normalizeSynonym } from '../../../domain/common/types/normalize-synonym';

describe('when value has spaces and mixed case', () => {
  it('should normalize to lowercase collapsed whitespace', () => {
    expect(normalizeSynonym('  Play Station  5 ')).toBe('play station 5');
  });
});
