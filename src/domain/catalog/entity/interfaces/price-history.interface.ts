import { EPriceHistorySource } from '../enums/EPriceHistorySource';

export interface IPriceHistory {
  id: string;
  productId: string;
  priceCents: number;
  currency: string;
  source: EPriceHistorySource;
  observedAt: Date;
  createdAt: Date;
}
