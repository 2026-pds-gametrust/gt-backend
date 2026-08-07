import { IPriceHistory } from '../entity/interfaces/price-history.interface';

export interface IPriceHistoryRepositoryWrite {
  appendPriceHistory(entry: IPriceHistory): Promise<IPriceHistory>;
}
