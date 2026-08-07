import { FavoritesController } from '../../application/controllers/favorites.controller';
import { IController } from '../../domain/server/interfaces/IController';
import { FavoriteServiceFactory } from './favorite.service.factory';

export class FavoritesControllerFactory {
  static create(): IController {
    return new FavoritesController(FavoriteServiceFactory.create());
  }
}
