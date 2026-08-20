import { IEventPublisher } from '../../common/messaging/event-publisher.interface';
import { IActorContext } from '../../common/types/actor-context';
import { IProductRepositoryRead } from '../../catalog/repository/product.repository.read';
import { IUserRepositoryRead } from '../../identity/repository/user.repository.read';
import { IListingRepositoryRead } from '../../listings/repository/listing.repository.read';
import { EListingStatus } from '../../listings/entity/enums/EListingStatus';
import { ISealRepositoryRead } from '../../verification/repository/seal.repository.read';
import { EFavoriteTargetType } from '../entity/enums/EFavoriteTargetType';
import { IFavorite } from '../entity/interfaces/favorite.interface';
import { IFavoriteRepositoryRead } from '../repository/favorite.repository.read';
import { IFavoriteRepositoryWrite } from '../repository/favorite.repository.write';

export interface IParamsCreateFavorite {
  id: string;
  /** Ignored for ownership — service forces userId from actor.actorId. */
  userId?: string;
  targetType: EFavoriteTargetType;
  targetId: string;
}

export interface IParamsFavoriteService {
  favoriteRepositoryRead: IFavoriteRepositoryRead;
  favoriteRepositoryWrite: IFavoriteRepositoryWrite;
  userRepositoryRead: IUserRepositoryRead;
  productRepositoryRead: IProductRepositoryRead;
  listingRepositoryRead: IListingRepositoryRead;
  sealRepositoryRead: ISealRepositoryRead;
  eventPublisher: IEventPublisher;
}

export interface IFavoriteService {
  createFavorite(
    params: IParamsCreateFavorite,
    actor: IActorContext,
  ): Promise<IFavorite>;
  deleteFavoriteById(id: string, actor: IActorContext): Promise<void>;
  listByUserId(userId: string): Promise<IFavorite[]>;
}
