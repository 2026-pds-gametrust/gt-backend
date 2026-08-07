export interface IMoney {
  amountCents: number;
  currency: string;
}

export function createMoney(amountCents: number, currency = 'BRL'): IMoney {
  if (!Number.isInteger(amountCents) || amountCents < 0) {
    throw new Error('amountCents must be a non-negative integer');
  }
  if (!currency || currency.length !== 3) {
    throw new Error('currency must be a 3-letter ISO code');
  }
  return { amountCents, currency: currency.toUpperCase() };
}
