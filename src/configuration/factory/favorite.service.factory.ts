import { FavoriteService } from '../../domain/favorites/service/favorite.service';
import { ProductRepositoryRead } from '../../infraestructure/repository/catalog/product.repository.read';
import { FavoriteRepositoryRead } from '../../infraestructure/repository/favorites/favorite.repository.read';
import { FavoriteRepositoryWrite } from '../../infraestructure/repository/favorites/favorite.repository.write';
import { UserRepositoryRead } from '../../infraestructure/repository/identity/user.repository.read';
import { ListingRepositoryRead } from '../../infraestructure/repository/listings/listing.repository.read';
import { SealRepositoryRead } from '../../infraestructure/repository/verification/seal.repository.read';
import { EventPublisherFactory } from './messaging/event-publisher.factory';

export class FavoriteServiceFactory {
  static create() {
    return new FavoriteService({
      favoriteRepositoryRead: new FavoriteRepositoryRead(),
      favoriteRepositoryWrite: new FavoriteRepositoryWrite(),
      userRepositoryRead: new UserRepositoryRead(),
      productRepositoryRead: new ProductRepositoryRead(),
      listingRepositoryRead: new ListingRepositoryRead(),
      sealRepositoryRead: new SealRepositoryRead(),
      eventPublisher: EventPublisherFactory.create(),
    });
  }
}
