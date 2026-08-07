import { IThrowedError } from '@sauvvitech/st-packages';
import { randomUUID } from 'crypto';
import { Logger } from 'traceability';
import { EPriceHistorySource } from '../../catalog/entity/enums/EPriceHistorySource';
import { PriceHistoryServiceEntity } from '../../catalog/entity/price-history.entity';
import { IPriceHistoryRepositoryWrite } from '../../catalog/repository/price-history.repository.write';
import { IProductRepositoryRead } from '../../catalog/repository/product.repository.read';
import {
  assertBackofficeAdminOrSystem,
  assertOwnerOrAdmin,
  systemActorContext,
} from '../../common/auth/actor-authorization';
import { EErrorCode } from '../../common/errors/enums/EErrorCode';
import {
  createEventEnvelope,
  IEventEnvelope,
} from '../../common/messaging/event-envelope';
import { IEventPublisher } from '../../common/messaging/event-publisher.interface';
import { IActorContext } from '../../common/types/actor-context';
import { IUserRepositoryRead } from '../../identity/repository/user.repository.read';
import { ListingEventServiceEntity } from '../entity/listing-event.entity';
import { ListingServiceEntity } from '../entity/listing.entity';
import { EListingStatus } from '../entity/enums/EListingStatus';
import { EShippingMode } from '../entity/enums/EShippingMode';
import { IListing } from '../entity/interfaces/listing.interface';
import { IListingEvent } from '../entity/interfaces/listing-event.interface';
import { IListingEventRepositoryRead } from '../repository/listing-event.repository.read';
import { IListingEventRepositoryWrite } from '../repository/listing-event.repository.write';
import { IListingRepositoryRead } from '../repository/listing.repository.read';
import { IListingRepositoryWrite } from '../repository/listing.repository.write';
import {
  IListingService,
  IParamsCreateListing,
  IParamsListingService,
  IParamsUpdateListing,
} from './listing.service.interface';

const ALLOWED_TRANSITIONS: Record<EListingStatus, EListingStatus[]> = {
  [EListingStatus.DRAFT]: [EListingStatus.SUBMITTED],
  [EListingStatus.SUBMITTED]: [
    EListingStatus.PUBLISHED,
    EListingStatus.DRAFT,
  ],
  [EListingStatus.PUBLISHED]: [
    EListingStatus.PAUSED,
    EListingStatus.EXPIRED,
    EListingStatus.RESERVED,
  ],
  [EListingStatus.PAUSED]: [EListingStatus.PUBLISHED],
  [EListingStatus.EXPIRED]: [],
  [EListingStatus.RESERVED]: [
    EListingStatus.SOLD,
    EListingStatus.PUBLISHED,
  ],
  [EListingStatus.SOLD]: [],
};

export class ListingService implements IListingService {
  private readonly listingRepositoryRead: IListingRepositoryRead;
  private readonly listingRepositoryWrite: IListingRepositoryWrite;
  private readonly listingEventRepositoryRead: IListingEventRepositoryRead;
  private readonly listingEventRepositoryWrite: IListingEventRepositoryWrite;
  private readonly userRepositoryRead: IUserRepositoryRead;
  private readonly productRepositoryRead: IProductRepositoryRead;
  private readonly priceHistoryRepositoryWrite: IPriceHistoryRepositoryWrite;
  private readonly eventPublisher: IEventPublisher;

  constructor({
    listingRepositoryRead,
    listingRepositoryWrite,
    listingEventRepositoryRead,
    listingEventRepositoryWrite,
    userRepositoryRead,
    productRepositoryRead,
    priceHistoryRepositoryWrite,
    eventPublisher,
  }: IParamsListingService) {
    this.listingRepositoryRead = listingRepositoryRead;
    this.listingRepositoryWrite = listingRepositoryWrite;
    this.listingEventRepositoryRead = listingEventRepositoryRead;
    this.listingEventRepositoryWrite = listingEventRepositoryWrite;
    this.userRepositoryRead = userRepositoryRead;
    this.productRepositoryRead = productRepositoryRead;
    this.priceHistoryRepositoryWrite = priceHistoryRepositoryWrite;
    this.eventPublisher = eventPublisher;
  }

  async createListing(
    params: IParamsCreateListing,
    actor: IActorContext,
  ): Promise<IListing> {
    assertOwnerOrAdmin(actor, params.sellerId);
    await this.assertSellerExists(params.sellerId);
    await this.assertProductExists(params.productId);

    const entity = new ListingServiceEntity({
      id: params.id,
      sellerId: params.sellerId,
      productId: params.productId,
      title: params.title,
      description: params.description,
      condition: params.condition,
      priceCents: params.priceCents,
      listPriceCents: params.listPriceCents,
      currency: params.currency ?? 'BRL',
      attributes: params.attributes,
      media: params.media,
      shipping: params.shipping,
      locationApprox: params.locationApprox,
      warranty: params.warranty,
      acceptsOffers: params.acceptsOffers ?? false,
      buyNowEnabled: params.buyNowEnabled ?? true,
      quantity: 1,
      status: EListingStatus.DRAFT,
      createdAt: new Date(),
    });

    const created = await this.listingRepositoryWrite.createListing(entity);

    await this.appendStatusEvent({
      listingId: created.id,
      fromStatus: null,
      toStatus: EListingStatus.DRAFT,
      actorId: actor.actorId,
      reason: 'created',
    });

    await this.eventPublisher.publish(
      createEventEnvelope({
        eventId: randomUUID(),
        eventType: 'listings.listing.created',
        aggregateId: created.id,
        producerModule: 'listings',
        correlationId: actor.correlationId ?? randomUUID(),
        payload: {
          listingId: created.id,
          productId: created.productId,
          sellerId: created.sellerId,
          status: created.status,
        },
      }),
    );

    return created;
  }

  async getListingById(id: string): Promise<IListing> {
    const listing = await this.listingRepositoryRead.findListingById(id);
    if (!listing) {
      throw {
        status: 404,
        errorCode: EErrorCode.RESOURCE_NOT_FOUND,
        message: 'Listing not found',
        details: { id },
      } as IThrowedError;
    }
    return listing;
  }

  async listListings(filter: Partial<IListing> = {}): Promise<IListing[]> {
    return this.listingRepositoryRead.listListings(filter);
  }

  async updateListingById(
    id: string,
    params: IParamsUpdateListing,
    actor: IActorContext,
  ): Promise<IListing> {
    const existing = await this.getListingById(id);
    assertOwnerOrAdmin(actor, existing.sellerId);

    if (
      existing.status !== EListingStatus.DRAFT &&
      existing.status !== EListingStatus.SUBMITTED
    ) {
      throw {
        status: 409,
        errorCode: EErrorCode.RESOURCE_CONFLICT,
        message: 'Listing cannot be updated in current status',
        details: { id, status: existing.status },
      } as IThrowedError;
    }

    const candidate = new ListingServiceEntity({
      ...existing,
      ...params.listingData,
      quantity: 1,
      status: existing.status,
    });

    const updated = await this.listingRepositoryWrite.updateListingById(id, {
      title: candidate.title,
      description: candidate.description,
      condition: candidate.condition,
      priceCents: candidate.priceCents,
      listPriceCents: candidate.listPriceCents,
      currency: candidate.currency,
      attributes: candidate.attributes,
      media: candidate.media,
      shipping: candidate.shipping,
      locationApprox: candidate.locationApprox,
      warranty: candidate.warranty,
      acceptsOffers: candidate.acceptsOffers,
      buyNowEnabled: candidate.buyNowEnabled,
    });

    if (!updated) {
      throw {
        status: 404,
        errorCode: EErrorCode.RESOURCE_NOT_FOUND,
        message: 'Listing not found',
        details: { id },
      } as IThrowedError;
    }

    if (updated.priceCents !== existing.priceCents) {
      await this.appendListingPrice(updated, EPriceHistorySource.MANUAL);
    }

    return updated;
  }

  async submitListing(id: string, actor: IActorContext): Promise<IListing> {
    const existing = await this.getListingById(id);
    assertOwnerOrAdmin(actor, existing.sellerId);
    this.assertTransition(existing.status, EListingStatus.SUBMITTED);
    this.assertSubmitReady(existing);

    return this.transitionStatus(
      existing,
      EListingStatus.SUBMITTED,
      actor.actorId,
      'submit',
    );
  }

  async publishListing(id: string, actor: IActorContext): Promise<IListing> {
    assertBackofficeAdminOrSystem(actor);
    const existing = await this.getListingById(id);
    this.assertTransition(existing.status, EListingStatus.PUBLISHED);
    this.assertPublishReady(existing);

    const published = await this.transitionStatus(
      existing,
      EListingStatus.PUBLISHED,
      actor.actorId,
      'publish',
    );

    await this.appendListingPrice(
      published,
      EPriceHistorySource.LISTING_PUBLISHED,
    );

    return published;
  }

  async pauseListing(id: string, actor: IActorContext): Promise<IListing> {
    const existing = await this.getListingById(id);
    assertOwnerOrAdmin(actor, existing.sellerId);
    this.assertTransition(existing.status, EListingStatus.PAUSED);
    return this.transitionStatus(
      existing,
      EListingStatus.PAUSED,
      actor.actorId,
      'pause',
    );
  }

  async listEvents(listingId: string): Promise<IListingEvent[]> {
    await this.getListingById(listingId);
    return this.listingEventRepositoryRead.listByListingId(listingId);
  }

  async applyVerificationApproved(envelope: IEventEnvelope): Promise<void> {
    const payload = envelope.payload as {
      listingId?: string;
      caseId?: string;
    };
    const listingId = payload.listingId;

    if (!listingId) {
      Logger.info('listings.applyVerificationApproved skip', {
        eventName: 'listings.apply_verification_approved_skip',
        reason: 'missing_listing_id',
        eventType: envelope.eventType,
        aggregateId: envelope.aggregateId,
      });
      return;
    }

    const listing =
      await this.listingRepositoryRead.findListingById(listingId);
    if (!listing) {
      Logger.info('listings.applyVerificationApproved skip', {
        eventName: 'listings.apply_verification_approved_skip',
        reason: 'listing_not_found',
        listingId,
      });
      return;
    }

    if (listing.status === EListingStatus.PUBLISHED) {
      return;
    }

    if (listing.status === EListingStatus.SUBMITTED) {
      await this.publishListing(listingId, systemActorContext());
      return;
    }

    Logger.info('listings.applyVerificationApproved skip', {
      eventName: 'listings.apply_verification_approved_skip',
      reason: 'status_not_eligible',
      listingId,
      status: listing.status,
    });
  }

  private async transitionStatus(
    existing: IListing,
    toStatus: EListingStatus,
    actorId?: string,
    reason?: string,
  ): Promise<IListing> {
    const updated = await this.listingRepositoryWrite.updateListingById(
      existing.id,
      { status: toStatus },
    );
    if (!updated) {
      throw {
        status: 404,
        errorCode: EErrorCode.RESOURCE_NOT_FOUND,
        message: 'Listing not found',
        details: { id: existing.id },
      } as IThrowedError;
    }

    await this.appendStatusEvent({
      listingId: updated.id,
      fromStatus: existing.status,
      toStatus,
      actorId,
      reason,
    });

    const correlationId = randomUUID();
    const statusPayload = {
      listingId: updated.id,
      productId: updated.productId,
      sellerId: updated.sellerId,
      fromStatus: existing.status,
      toStatus,
    };

    await this.eventPublisher.publish(
      createEventEnvelope({
        eventId: randomUUID(),
        eventType: 'listings.listing.status_changed',
        aggregateId: updated.id,
        producerModule: 'listings',
        correlationId,
        payload: statusPayload,
      }),
    );

    const specificEventType = this.specificStatusEventType(toStatus);
    if (specificEventType) {
      await this.eventPublisher.publish(
        createEventEnvelope({
          eventId: randomUUID(),
          eventType: specificEventType,
          aggregateId: updated.id,
          producerModule: 'listings',
          correlationId,
          payload: statusPayload,
        }),
      );
    }

    return updated;
  }

  private specificStatusEventType(
    toStatus: EListingStatus,
  ): string | undefined {
    if (toStatus === EListingStatus.SUBMITTED) {
      return 'listings.listing.submitted';
    }
    if (toStatus === EListingStatus.PUBLISHED) {
      return 'listings.listing.published';
    }
    if (toStatus === EListingStatus.PAUSED) {
      return 'listings.listing.paused';
    }
    return undefined;
  }

  private assertTransition(
    from: EListingStatus,
    to: EListingStatus,
  ): void {
    const allowed = ALLOWED_TRANSITIONS[from] ?? [];
    if (!allowed.includes(to)) {
      throw {
        status: 409,
        errorCode: EErrorCode.RESOURCE_CONFLICT,
        message: 'Invalid listing status transition',
        details: { from, to },
      } as IThrowedError;
    }
  }

  private assertSubmitReady(listing: IListing): void {
    if (!listing.media?.photoUrls?.length) {
      throw {
        status: 400,
        errorCode: EErrorCode.FIELD_INVALID,
        message: 'At least one photo is required to submit',
        details: { field: 'media.photoUrls' },
      } as IThrowedError;
    }
    if (!listing.shipping?.modes?.length) {
      throw {
        status: 400,
        errorCode: EErrorCode.FIELD_INVALID,
        message: 'shipping.modes is required to submit',
        details: { field: 'shipping.modes' },
      } as IThrowedError;
    }
  }

  private assertPublishReady(listing: IListing): void {
    this.assertSubmitReady(listing);
    if (listing.shipping.modes.includes(EShippingMode.SHIPPING)) {
      const {
        packageWeightGrams,
        packageLengthCm,
        packageWidthCm,
        packageHeightCm,
      } = listing.shipping;
      if (
        !packageWeightGrams ||
        !packageLengthCm ||
        !packageWidthCm ||
        !packageHeightCm
      ) {
        throw {
          status: 400,
          errorCode: EErrorCode.FIELD_INVALID,
          message:
            'SHIPPING mode requires package weight and dimensions before publish',
          details: { field: 'shipping' },
        } as IThrowedError;
      }
    }
  }

  private async appendStatusEvent(params: {
    listingId: string;
    fromStatus: EListingStatus | null;
    toStatus: EListingStatus;
    actorId?: string;
    reason?: string;
  }): Promise<void> {
    const event = new ListingEventServiceEntity({
      id: randomUUID(),
      listingId: params.listingId,
      fromStatus: params.fromStatus,
      toStatus: params.toStatus,
      actorId: params.actorId,
      reason: params.reason,
      occurredAt: new Date(),
    });
    await this.listingEventRepositoryWrite.appendListingEvent(event);
  }

  private async appendListingPrice(
    listing: IListing,
    source: EPriceHistorySource,
  ): Promise<void> {
    const entry = new PriceHistoryServiceEntity({
      id: randomUUID(),
      productId: listing.productId,
      priceCents: listing.priceCents,
      currency: listing.currency,
      source,
      observedAt: new Date(),
      createdAt: new Date(),
    });
    await this.priceHistoryRepositoryWrite.appendPriceHistory(entry);
  }

  private async assertSellerExists(sellerId: string): Promise<void> {
    const user = await this.userRepositoryRead.findUserById(sellerId);
    if (!user) {
      throw {
        status: 404,
        errorCode: EErrorCode.RESOURCE_NOT_FOUND,
        message: 'Seller not found',
        details: { sellerId },
      } as IThrowedError;
    }
  }

  private async assertProductExists(productId: string): Promise<void> {
    const product = await this.productRepositoryRead.findProductById(productId);
    if (!product) {
      throw {
        status: 404,
        errorCode: EErrorCode.RESOURCE_NOT_FOUND,
        message: 'Product not found',
        details: { productId },
      } as IThrowedError;
    }
  }
}
