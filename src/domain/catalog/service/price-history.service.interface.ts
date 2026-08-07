import { IPriceHistory } from '../entity/interfaces/price-history.interface';
import { EPriceHistorySource } from '../entity/enums/EPriceHistorySource';
import { IPriceHistoryRepositoryRead } from '../repository/price-history.repository.read';
import { IPriceHistoryRepositoryWrite } from '../repository/price-history.repository.write';
import { IProductRepositoryRead } from '../repository/product.repository.read';

export interface IParamsAppendPriceHistory {
  id: string;
  productId: string;
  priceCents: number;
  currency?: string;
  source: EPriceHistorySource;
  observedAt?: Date;
}

export interface IParamsPriceHistoryService {
  priceHistoryRepositoryRead: IPriceHistoryRepositoryRead;
  priceHistoryRepositoryWrite: IPriceHistoryRepositoryWrite;
  productRepositoryRead: IProductRepositoryRead;
}

export interface IPriceHistoryService {
  appendPriceHistory(params: IParamsAppendPriceHistory): Promise<IPriceHistory>;
  listByProductId(productId: string): Promise<IPriceHistory[]>;
}
