import {
  isBlank,
  requireNonEmptyString,
  requireNonEmptyWhenProvided,
} from '../../../domain/common/types/required-string';

describe('when checking if a string is blank', () => {
  it('should treat undefined as blank', () => {
    expect(isBlank(undefined)).toBe(true);
  });

  it('should treat null as blank', () => {
    expect(isBlank(null)).toBe(true);
  });

  it('should treat an empty string as blank', () => {
    expect(isBlank('')).toBe(true);
  });

  it('should treat whitespace-only as blank', () => {
    expect(isBlank('   ')).toBe(true);
  });

  it('should accept a non-empty string', () => {
    expect(isBlank('ok')).toBe(false);
  });
});

describe('when requiring a non-empty string', () => {
  it('should reject a blank value with the field label', () => {
    expect(() => requireNonEmptyString('  ', 'id')).toThrow('id is required');
  });

  it('should accept a value with internal spaces', () => {
    expect(() => requireNonEmptyString('RTX 4090', 'model')).not.toThrow();
  });
});

describe('when requiring a non-empty string only when provided', () => {
  it('should accept undefined', () => {
    expect(() => requireNonEmptyWhenProvided(undefined, 'sku')).not.toThrow();
  });

  it('should reject an empty string', () => {
    expect(() => requireNonEmptyWhenProvided('', 'sku')).toThrow(
      'sku must be non-empty when provided',
    );
  });

  it('should reject whitespace-only', () => {
    expect(() => requireNonEmptyWhenProvided('  ', 'mpn')).toThrow(
      'mpn must be non-empty when provided',
    );
  });

  it('should accept a non-empty value', () => {
    expect(() => requireNonEmptyWhenProvided('ABC-1', 'ean')).not.toThrow();
  });
});
