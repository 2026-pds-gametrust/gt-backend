import { PriceHistoryService } from '../../domain/catalog/service/price-history.service';
import { PriceHistoryRepositoryRead } from '../../infraestructure/repository/catalog/price-history.repository.read';
import { PriceHistoryRepositoryWrite } from '../../infraestructure/repository/catalog/price-history.repository.write';
import { ProductRepositoryRead } from '../../infraestructure/repository/catalog/product.repository.read';

export class PriceHistoryServiceFactory {
  static create() {
    return new PriceHistoryService({
      priceHistoryRepositoryRead: new PriceHistoryRepositoryRead(),
      priceHistoryRepositoryWrite: new PriceHistoryRepositoryWrite(),
      productRepositoryRead: new ProductRepositoryRead(),
    });
  }
}
