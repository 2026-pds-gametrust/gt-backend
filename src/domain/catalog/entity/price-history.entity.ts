import { createMoney } from '../../common/types/money';
import { EPriceHistorySource } from './enums/EPriceHistorySource';
import { IPriceHistory } from './interfaces/price-history.interface';

export class PriceHistoryServiceEntity implements IPriceHistory {
  id: string;
  productId: string;
  priceCents: number;
  currency: string;
  source: EPriceHistorySource;
  observedAt: Date;
  createdAt: Date;

  constructor(entry: IPriceHistory) {
    this.validate(entry);
    const money = createMoney(entry.priceCents, entry.currency);
    this.id = entry.id;
    this.productId = entry.productId;
    this.priceCents = money.amountCents;
    this.currency = money.currency;
    this.source = entry.source;
    this.observedAt = entry.observedAt;
    this.createdAt = entry.createdAt || new Date();
  }

  private validate(entry: IPriceHistory): void {
    if (!entry.id?.trim()) {
      throw new Error('id is required');
    }
    if (!entry.productId?.trim()) {
      throw new Error('productId is required');
    }
    if (!entry.source) {
      throw new Error('source is required');
    }
    if (!(entry.observedAt instanceof Date) && !entry.observedAt) {
      throw new Error('observedAt is required');
    }
  }
}
