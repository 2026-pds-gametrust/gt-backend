import { IThrowedError } from '@sauvvitech/st-packages';
import { randomUUID } from 'crypto';
import {
  assertActorPresent,
  assertOwnerOrAdmin,
} from '../../common/auth/actor-authorization';
import { EErrorCode } from '../../common/errors/enums/EErrorCode';
import { createEventEnvelope } from '../../common/messaging/event-envelope';
import { IActorContext } from '../../common/types/actor-context';
import { EFavoriteTargetType } from '../entity/enums/EFavoriteTargetType';
import { FavoriteServiceEntity } from '../entity/favorite.entity';
import { IFavorite } from '../entity/interfaces/favorite.interface';
import { EListingStatus } from '../../listings/entity/enums/EListingStatus';
import {
  IFavoriteService,
  IParamsCreateFavorite,
  IParamsFavoriteService,
} from './favorite.service.interface';

export class FavoriteService implements IFavoriteService {
  private readonly favoriteRepositoryRead: IParamsFavoriteService['favoriteRepositoryRead'];
  private readonly favoriteRepositoryWrite: IParamsFavoriteService['favoriteRepositoryWrite'];
  private readonly userRepositoryRead: IParamsFavoriteService['userRepositoryRead'];
  private readonly productRepositoryRead: IParamsFavoriteService['productRepositoryRead'];
  private readonly listingRepositoryRead: IParamsFavoriteService['listingRepositoryRead'];
  private readonly sealRepositoryRead: IParamsFavoriteService['sealRepositoryRead'];
  private readonly eventPublisher: IParamsFavoriteService['eventPublisher'];

  constructor(params: IParamsFavoriteService) {
    this.favoriteRepositoryRead = params.favoriteRepositoryRead;
    this.favoriteRepositoryWrite = params.favoriteRepositoryWrite;
    this.userRepositoryRead = params.userRepositoryRead;
    this.productRepositoryRead = params.productRepositoryRead;
    this.listingRepositoryRead = params.listingRepositoryRead;
    this.sealRepositoryRead = params.sealRepositoryRead;
    this.eventPublisher = params.eventPublisher;
  }

  async createFavorite(
    params: IParamsCreateFavorite,
    actor: IActorContext,
  ): Promise<IFavorite> {
    assertActorPresent(actor);
    const userId = actor.actorId;

    const user = await this.userRepositoryRead.findUserById(userId);
    if (!user) {
      throw {
        status: 404,
        errorCode: EErrorCode.RESOURCE_NOT_FOUND,
        message: 'User not found',
        details: { userId },
      } as IThrowedError;
    }

    await this.assertTargetExists(params.targetType, params.targetId);

    const existing = await this.favoriteRepositoryRead.findByUserTarget(
      userId,
      params.targetType,
      params.targetId,
    );
    if (existing) {
      throw {
        status: 409,
        errorCode: EErrorCode.RESOURCE_CONFLICT,
        message: 'Favorite already exists',
        details: {
          userId,
          targetType: params.targetType,
          targetId: params.targetId,
        },
      } as IThrowedError;
    }

    const entity = new FavoriteServiceEntity({
      id: params.id,
      userId,
      targetType: params.targetType,
      targetId: params.targetId,
      createdAt: new Date(),
    });

    const created =
      await this.favoriteRepositoryWrite.createFavorite(entity);

    await this.eventPublisher.publish(
      createEventEnvelope({
        eventId: randomUUID(),
        eventType: 'favorites.favorite.created',
        aggregateId: created.id,
        producerModule: 'favorites',
        correlationId: actor.correlationId ?? randomUUID(),
        payload: {
          favoriteId: created.id,
          userId: created.userId,
          targetType: created.targetType,
          targetId: created.targetId,
        },
      }),
    );

    return created;
  }

  async deleteFavoriteById(id: string, actor: IActorContext): Promise<void> {
    const existing = await this.favoriteRepositoryRead.findFavoriteById(id);
    if (!existing) {
      throw {
        status: 404,
        errorCode: EErrorCode.RESOURCE_NOT_FOUND,
        message: 'Favorite not found',
        details: { id },
      } as IThrowedError;
    }
    assertOwnerOrAdmin(actor, existing.userId);
    await this.favoriteRepositoryWrite.deleteFavoriteById(id);
  }

  async listByUserId(userId: string): Promise<IFavorite[]> {
    return this.favoriteRepositoryRead.listByUserId(userId);
  }

  private async assertTargetExists(
    targetType: EFavoriteTargetType,
    targetId: string,
  ): Promise<void> {
    if (targetType === EFavoriteTargetType.PRODUCT) {
      const product =
        await this.productRepositoryRead.findProductById(targetId);
      if (!product) {
        throw {
          status: 404,
          errorCode: EErrorCode.RESOURCE_NOT_FOUND,
          message: 'Product not found',
          details: { targetId },
        } as IThrowedError;
      }
      return;
    }

    const listing =
      await this.listingRepositoryRead.findListingById(targetId);
    if (!listing) {
      throw {
        status: 404,
        errorCode: EErrorCode.RESOURCE_NOT_FOUND,
        message: 'Listing not found',
        details: { targetId },
      } as IThrowedError;
    }

    if (listing.status !== EListingStatus.PUBLISHED) {
      throw {
        status: 404,
        errorCode: EErrorCode.RESOURCE_NOT_FOUND,
        message: 'Listing not found',
        details: { targetId },
      } as IThrowedError;
    }

    const activeSeal =
      await this.sealRepositoryRead.findActiveSealByListingId(targetId);
    if (!activeSeal) {
      throw {
        status: 404,
        errorCode: EErrorCode.RESOURCE_NOT_FOUND,
        message: 'Listing not found',
        details: { targetId },
      } as IThrowedError;
    }
  }
}
