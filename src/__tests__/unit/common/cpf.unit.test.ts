import { buildValidCpf, isValidCpf } from '../../../domain/common/types/cpf';

describe('when validating a CPF', () => {
  it('should accept a CPF with valid check digits', () => {
    const cpf = buildValidCpf(123456789);
    expect(isValidCpf(cpf)).toBe(true);
  });

  it('should reject repeated digit sequences', () => {
    expect(isValidCpf('00000000000')).toBe(false);
    expect(isValidCpf('11111111111')).toBe(false);
  });

  it('should reject wrong length', () => {
    expect(isValidCpf('123')).toBe(false);
    expect(isValidCpf('123456789012')).toBe(false);
  });

  it('should reject invalid check digits', () => {
    const valid = buildValidCpf(42);
    const invalid = `${valid.slice(0, 10)}${valid[10] === '0' ? '1' : '0'}`;
    expect(isValidCpf(invalid)).toBe(false);
  });
});

describe('when building a valid CPF from a seed', () => {
  it('should produce a valid CPF for a non-repeating seed', () => {
    const cpf = buildValidCpf(123456789);
    expect(cpf).toHaveLength(11);
    expect(isValidCpf(cpf)).toBe(true);
  });

  it('should produce a valid CPF for a negative seed', () => {
    const cpf = buildValidCpf(-99);
    expect(isValidCpf(cpf)).toBe(true);
  });

  it('should map remainder 10 to check digit 0', () => {
    // Known base where first check digit remainder is 10 → digit 0
    // 123456789 → d1 calc yields 0 in Brazilian CPF algorithm
    const cpf = buildValidCpf(123456789);
    expect(cpf[9]).toBe('0');
    expect(isValidCpf(cpf)).toBe(true);
  });
});
