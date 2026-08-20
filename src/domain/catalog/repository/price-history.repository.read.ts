import { IPriceHistory } from '../entity/interfaces/price-history.interface';

export interface IPriceHistoryRepositoryRead {
  findById(id: string): Promise<IPriceHistory | null>;
  listByProductId(productId: string): Promise<IPriceHistory[]>;
}
