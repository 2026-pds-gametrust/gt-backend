import { ProductService } from '../../domain/catalog/service/product.service';
import { CategoryRepositoryRead } from '../../infraestructure/repository/catalog/category.repository.read';
import { PriceHistoryRepositoryWrite } from '../../infraestructure/repository/catalog/price-history.repository.write';
import { ProductRepositoryRead } from '../../infraestructure/repository/catalog/product.repository.read';
import { ProductRepositoryWrite } from '../../infraestructure/repository/catalog/product.repository.write';
import { EventPublisherFactory } from './messaging/event-publisher.factory';
import { MediaAssetServiceFactory } from './media-asset.service.factory';

export class ProductServiceFactory {
  static create() {
    return new ProductService({
      productRepositoryRead: new ProductRepositoryRead(),
      productRepositoryWrite: new ProductRepositoryWrite(),
      categoryRepositoryRead: new CategoryRepositoryRead(),
      priceHistoryRepositoryWrite: new PriceHistoryRepositoryWrite(),
      eventPublisher: EventPublisherFactory.create(),
      mediaClient: MediaAssetServiceFactory.create(),
    });
  }
}
