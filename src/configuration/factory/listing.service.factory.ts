import { ListingService } from '../../domain/listings/service/listing.service';
import { PriceHistoryRepositoryWrite } from '../../infraestructure/repository/catalog/price-history.repository.write';
import { ProductRepositoryRead } from '../../infraestructure/repository/catalog/product.repository.read';
import { UserRepositoryRead } from '../../infraestructure/repository/identity/user.repository.read';
import { ListingEventRepositoryRead } from '../../infraestructure/repository/listings/listing-event.repository.read';
import { ListingEventRepositoryWrite } from '../../infraestructure/repository/listings/listing-event.repository.write';
import { ListingRepositoryRead } from '../../infraestructure/repository/listings/listing.repository.read';
import { ListingRepositoryWrite } from '../../infraestructure/repository/listings/listing.repository.write';
import { EventPublisherFactory } from './messaging/event-publisher.factory';

export class ListingServiceFactory {
  static create() {
    return new ListingService({
      listingRepositoryRead: new ListingRepositoryRead(),
      listingRepositoryWrite: new ListingRepositoryWrite(),
      listingEventRepositoryRead: new ListingEventRepositoryRead(),
      listingEventRepositoryWrite: new ListingEventRepositoryWrite(),
      userRepositoryRead: new UserRepositoryRead(),
      productRepositoryRead: new ProductRepositoryRead(),
      priceHistoryRepositoryWrite: new PriceHistoryRepositoryWrite(),
      eventPublisher: EventPublisherFactory.create(),
    });
  }
}
