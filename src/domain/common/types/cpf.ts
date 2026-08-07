/**
 * CPF helpers (11 digits + check digits). Domain-local; no infra deps.
 */

function calcCheckDigit(digits: string, factorStart: number): number {
  let sum = 0;
  for (let i = 0; i < digits.length; i++) {
    sum += Number(digits[i]) * (factorStart - i);
  }
  const remainder = (sum * 10) % 11;
  return remainder === 10 ? 0 : remainder;
}

export function isValidCpf(cpf: string): boolean {
  if (!/^\d{11}$/.test(cpf)) {
    return false;
  }
  if (/^(\d)\1{10}$/.test(cpf)) {
    return false;
  }
  const d1 = calcCheckDigit(cpf.slice(0, 9), 10);
  const d2 = calcCheckDigit(cpf.slice(0, 10), 11);
  return cpf[9] === String(d1) && cpf[10] === String(d2);
}

/** Build a valid CPF from a numeric seed (for tests / fixtures). */
export function buildValidCpf(seed: number): string {
  const base = String(Math.abs(seed) % 1_000_000_000).padStart(9, '0');
  const d1 = calcCheckDigit(base, 10);
  const withD1 = `${base}${d1}`;
  const d2 = calcCheckDigit(withD1, 11);
  return `${withD1}${d2}`;
}
