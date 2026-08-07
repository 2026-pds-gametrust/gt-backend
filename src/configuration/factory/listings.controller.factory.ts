import { ListingsController } from '../../application/controllers/listings.controller';
import { IController } from '../../domain/server/interfaces/IController';
import { ListingServiceFactory } from './listing.service.factory';

export class ListingsControllerFactory {
  static create(): IController {
    return new ListingsController(ListingServiceFactory.create());
  }
}
