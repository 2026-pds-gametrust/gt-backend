import { createMoney } from '../../../domain/common/types/money';

describe('when amount is valid', () => {
  it('should create BRL money by default', () => {
    expect(createMoney(1999)).toEqual({ amountCents: 1999, currency: 'BRL' });
  });
});

describe('when amountCents is negative', () => {
  it('should throw', () => {
    expect(() => createMoney(-1)).toThrow('amountCents must be a non-negative integer');
  });
});

describe('when amountCents is not an integer', () => {
  it('should throw', () => {
    expect(() => createMoney(1.5)).toThrow('amountCents must be a non-negative integer');
  });
});

describe('when amountCents is zero', () => {
  it('should accept free pricing', () => {
    expect(createMoney(0)).toEqual({ amountCents: 0, currency: 'BRL' });
  });
});

describe('when currency is provided', () => {
  it('should uppercase a valid 3-letter currency', () => {
    expect(createMoney(100, 'brl')).toEqual({
      amountCents: 100,
      currency: 'BRL',
    });
  });

  it('should reject an invalid currency code', () => {
    expect(() => createMoney(100, 'br')).toThrow();
    expect(() => createMoney(100, '')).toThrow();
  });
});
