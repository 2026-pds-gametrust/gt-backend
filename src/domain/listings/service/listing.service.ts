import { IThrowedError } from '@sauvvitech/st-packages';
import { randomUUID } from 'crypto';
import { Logger } from 'traceability';
import { EPriceHistorySource } from '../../catalog/entity/enums/EPriceHistorySource';
import { PriceHistoryServiceEntity } from '../../catalog/entity/price-history.entity';
import { IPriceHistoryRepositoryWrite } from '../../catalog/repository/price-history.repository.write';
import { IProductRepositoryRead } from '../../catalog/repository/product.repository.read';
import {
  assertBackofficeAdminOrSystem,
  assertActorPresent,
  assertOwnerOrAdmin,
  isBackofficeOrAdmin,
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
import {
  IListing,
  IListingMedia,
} from '../entity/interfaces/listing.interface';
import { IListingEvent } from '../entity/interfaces/listing-event.interface';
import { IListingEventRepositoryRead } from '../repository/listing-event.repository.read';
import { IListingEventRepositoryWrite } from '../repository/listing-event.repository.write';
import { IListingRepositoryRead } from '../repository/listing.repository.read';
import { IListingRepositoryWrite } from '../repository/listing.repository.write';
import { IVerificationCase } from '../../verification/entity/interfaces/verification-case.interface';
import { EVerificationCaseStatus } from '../../verification/entity/enums/EVerificationCaseStatus';
import { IVerificationCaseRepositoryRead } from '../../verification/repository/verification-case.repository.read';
import { assertRequiredChangesApplied } from '../../verification/revision/revision-change.validation';
import { ISealRepositoryRead } from '../../verification/repository/seal.repository.read';
import {
  ISellerListing,
  ISellerVerificationSummary,
  SELLER_LISTINGS_DEFAULT_LIMIT,
  SELLER_LISTINGS_MAX_LIMIT,
} from '../entity/interfaces/seller-listing.interface';
import { IMediaClient } from '../../media/client/media.client';
import { EMediaPurpose } from '../../media/entity/enums/EMediaPurpose';
import {
  isImageContentType,
  isVideoContentType,
} from '../../media/entity/media-asset.entity';
import {
  IListingService,
  IParamsCreateListing,
  IParamsListListingsForViewer,
  IParamsListMyListings,
  IParamsListingService,
  IParamsUpdateListing,
} from './listing.service.interface';

const ALLOWED_TRANSITIONS: Record<EListingStatus, EListingStatus[]> = {
  [EListingStatus.DRAFT]: [EListingStatus.SUBMITTED],
  [EListingStatus.SUBMITTED]: [
    EListingStatus.PUBLISHED,
    EListingStatus.DRAFT,
    EListingStatus.REJECTED,
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
  [EListingStatus.REJECTED]: [],
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
  private readonly sealRepositoryRead: ISealRepositoryRead;
  private readonly mediaClient?: IMediaClient;
  private readonly verificationCaseRepositoryRead?: IVerificationCaseRepositoryRead;

  constructor({
    listingRepositoryRead,
    listingRepositoryWrite,
    listingEventRepositoryRead,
    listingEventRepositoryWrite,
    userRepositoryRead,
    productRepositoryRead,
    priceHistoryRepositoryWrite,
    eventPublisher,
    sealRepositoryRead,
    mediaClient,
    verificationCaseRepositoryRead,
  }: IParamsListingService) {
    this.listingRepositoryRead = listingRepositoryRead;
    this.listingRepositoryWrite = listingRepositoryWrite;
    this.listingEventRepositoryRead = listingEventRepositoryRead;
    this.listingEventRepositoryWrite = listingEventRepositoryWrite;
    this.userRepositoryRead = userRepositoryRead;
    this.productRepositoryRead = productRepositoryRead;
    this.priceHistoryRepositoryWrite = priceHistoryRepositoryWrite;
    this.eventPublisher = eventPublisher;
    this.sealRepositoryRead = sealRepositoryRead;
    this.mediaClient = mediaClient;
    this.verificationCaseRepositoryRead = verificationCaseRepositoryRead;
  }

  async createListing(
    params: IParamsCreateListing,
    actor: IActorContext,
  ): Promise<IListing> {
    assertOwnerOrAdmin(actor, params.sellerId);
    await this.assertSellerExists(params.sellerId);
    await this.assertProductExists(params.productId);
    const media = await this.resolveListingMedia(
      params.media,
      params.sellerId,
    );

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
      media,
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

  async getListingById(id: string, actor?: IActorContext): Promise<IListing> {
    const listing = await this.loadListingById(id);
    await this.assertListingVisible(listing, actor);
    return listing;
  }

  private async assertListingVisible(
    listing: IListing,
    actor?: IActorContext,
  ): Promise<void> {
    if (actor === undefined) {
      return;
    }
    if (
      isBackofficeOrAdmin(actor) ||
      (actor.actorId?.trim() && actor.actorId === listing.sellerId)
    ) {
      return;
    }
    if (await this.isPubliclyVisible(listing)) {
      return;
    }
    throw {
      status: 404,
      errorCode: EErrorCode.RESOURCE_NOT_FOUND,
      message: 'Listing not found',
      details: { id: listing.id },
    } as IThrowedError;
  }

  private async isPubliclyVisible(listing: IListing): Promise<boolean> {
    if (listing.status !== EListingStatus.PUBLISHED) {
      return false;
    }
    const activeSeal =
      await this.sealRepositoryRead.findActiveSealByListingId(listing.id);
    return activeSeal !== null;
  }

  private async filterPubliclyVisible(
    listings: IListing[],
  ): Promise<IListing[]> {
    if (listings.length === 0) {
      return [];
    }
    const published = listings.filter(
      (listing) => listing.status === EListingStatus.PUBLISHED,
    );
    if (published.length === 0) {
      return [];
    }
    const seals = await this.sealRepositoryRead.listActiveSealsByListingIds(
      published.map((listing) => listing.id),
    );
    const sealedListingIds = new Set(seals.map((seal) => seal.listingId));
    return published.filter((listing) => sealedListingIds.has(listing.id));
  }

  private parsePagination(params: IParamsListMyListings): {
    limit: number;
    offset: number;
  } {
    const requestedLimit = Number(params.limit ?? SELLER_LISTINGS_DEFAULT_LIMIT);
    if (!Number.isFinite(requestedLimit) || requestedLimit <= 0) {
      throw {
        status: 400,
        errorCode: EErrorCode.FIELD_INVALID,
        message: 'limit must be a positive number',
      } as IThrowedError;
    }
    const limit = Math.min(
      Math.floor(requestedLimit),
      SELLER_LISTINGS_MAX_LIMIT,
    );

    const requestedOffset = Number(params.offset ?? 0);
    if (!Number.isFinite(requestedOffset) || requestedOffset < 0) {
      throw {
        status: 400,
        errorCode: EErrorCode.FIELD_INVALID,
        message: 'offset must be a non-negative number',
      } as IThrowedError;
    }
    const offset = Math.floor(requestedOffset);

    return { limit, offset };
  }

  private parseListingStatusFilter(
    status?: EListingStatus | string,
  ): EListingStatus | undefined {
    if (status === undefined || status === '') {
      return undefined;
    }
    const normalized = String(status).trim().toUpperCase();
    const allowed = Object.values(EListingStatus) as string[];
    if (!allowed.includes(normalized)) {
      throw {
        status: 400,
        errorCode: EErrorCode.FIELD_INVALID,
        message: 'status filter is invalid',
        details: { status },
      } as IThrowedError;
    }
    return normalized as EListingStatus;
  }

  private async loadLatestVerificationByListingIds(
    listingIds: string[],
  ): Promise<Map<string, ISellerVerificationSummary>> {
    const summariesByListingId = new Map<string, ISellerVerificationSummary>();
    if (!this.verificationCaseRepositoryRead || listingIds.length === 0) {
      return summariesByListingId;
    }

    const cases =
      await this.verificationCaseRepositoryRead.findCasesByListingIds(
        listingIds,
      );
    const latestByListing = new Map<string, IVerificationCase>();
    for (const verificationCase of cases) {
      if (latestByListing.has(verificationCase.listingId)) {
        continue;
      }
      latestByListing.set(verificationCase.listingId, verificationCase);
    }

    for (const [listingId, verificationCase] of latestByListing) {
      summariesByListingId.set(
        listingId,
        this.toSellerVerificationSummary(verificationCase),
      );
    }

    return summariesByListingId;
  }

  private toSellerVerificationSummary(
    verificationCase: IVerificationCase,
  ): ISellerVerificationSummary {
    const summary: ISellerVerificationSummary = {
      id: verificationCase.id,
      status: verificationCase.status,
      updatedAt: verificationCase.updatedAt ?? verificationCase.createdAt,
    };
    if (verificationCase.previousCaseId?.trim()) {
      summary.previousCaseId = verificationCase.previousCaseId.trim();
    }
    if (
      verificationCase.status === EVerificationCaseStatus.REJECTED &&
      verificationCase.decisionReason?.trim()
    ) {
      summary.decisionReason = verificationCase.decisionReason.trim();
    }
    if (
      verificationCase.status === EVerificationCaseStatus.CHANGES_REQUESTED
    ) {
      if (verificationCase.decisionReason?.trim()) {
        summary.decisionReason = verificationCase.decisionReason.trim();
      }
      if (verificationCase.requiredChanges?.length) {
        summary.requiredChanges = verificationCase.requiredChanges;
      }
    }
    return summary;
  }

  async listPublicListings(params: IParamsListMyListings = {}) {
    const { limit, offset } = this.parsePagination(params);
    const published = await this.listingRepositoryRead.listListings({
      status: EListingStatus.PUBLISHED,
    });
    const verified = await this.filterPubliclyVisible(published);
    const total = verified.length;
    const items = verified.slice(offset, offset + limit);
    return { items, total, limit, offset };
  }

  async listListingsForViewer(
    actor: IActorContext,
    options: IParamsListListingsForViewer = {},
  ): Promise<IListing[]> {
    const sellerId = options.sellerId?.trim();
    if (sellerId) {
      const listings = await this.listListings({ sellerId });
      if (
        isBackofficeOrAdmin(actor) ||
        (actor.actorId?.trim() && actor.actorId === sellerId)
      ) {
        return listings;
      }
      return this.filterPubliclyVisible(listings);
    }

    const published = await this.listListings({
      status: EListingStatus.PUBLISHED,
    });
    return this.filterPubliclyVisible(published);
  }

  async listMyListings(
    actor: IActorContext,
    params: IParamsListMyListings = {},
  ) {
    assertActorPresent(actor);
    const status = this.parseListingStatusFilter(params.status);
    const { limit, offset } = this.parsePagination(params);
    const sellerId = actor.actorId;

    const [listings, total] = await Promise.all([
      this.listingRepositoryRead.listSellerListings({
        sellerId,
        status,
        limit,
        offset,
      }),
      this.listingRepositoryRead.countSellerListings(sellerId, status),
    ]);

    const verificationByListing = await this.loadLatestVerificationByListingIds(
      listings.map((listing) => listing.id),
    );

    const items: ISellerListing[] = listings.map((listing) => ({
      ...listing,
      verificationCase: verificationByListing.get(listing.id),
    }));

    return { items, total, limit, offset };
  }

  async listListings(filter: Partial<IListing> = {}): Promise<IListing[]> {
    return this.listingRepositoryRead.listListings(filter);
  }

  private async loadListingById(id: string): Promise<IListing> {
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

  async updateListingById(
    id: string,
    params: IParamsUpdateListing,
    actor: IActorContext,
  ): Promise<IListing> {
    const existing = await this.loadListingById(id);
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

    const listingData = { ...params.listingData };
    if (listingData.media) {
      listingData.media = await this.resolveListingMedia(
        listingData.media,
        existing.sellerId,
      );
    }

    const candidate = new ListingServiceEntity({
      ...existing,
      ...listingData,
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

    await this.eventPublisher.publish(
      createEventEnvelope({
        eventId: randomUUID(),
        eventType: 'listings.listing.updated',
        aggregateId: updated.id,
        producerModule: 'listings',
        correlationId: actor.correlationId ?? randomUUID(),
        payload: {
          listingId: updated.id,
          productId: updated.productId,
          sellerId: updated.sellerId,
          status: updated.status,
        },
      }),
    );

    return updated;
  }

  async submitListing(id: string, actor: IActorContext): Promise<IListing> {
    const existing = await this.loadListingById(id);
    assertOwnerOrAdmin(actor, existing.sellerId);
    this.assertTransition(existing.status, EListingStatus.SUBMITTED);
    this.assertSubmitReady(existing);
    await this.assertRevisionChangesApplied(existing);

    return this.transitionStatus(
      existing,
      EListingStatus.SUBMITTED,
      actor.actorId,
      'submit',
    );
  }

  async publishListing(id: string, actor: IActorContext): Promise<IListing> {
    assertBackofficeAdminOrSystem(actor);
    const existing = await this.loadListingById(id);
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
    const existing = await this.loadListingById(id);
    assertOwnerOrAdmin(actor, existing.sellerId);
    this.assertTransition(existing.status, EListingStatus.PAUSED);
    return this.transitionStatus(
      existing,
      EListingStatus.PAUSED,
      actor.actorId,
      'pause',
    );
  }

  async listEvents(
    listingId: string,
    actor?: IActorContext,
  ): Promise<IListingEvent[]> {
    await this.getListingById(listingId, actor);
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

  async applyVerificationChangesRequested(
    envelope: IEventEnvelope,
  ): Promise<void> {
    const payload = envelope.payload as {
      listingId?: string;
      caseId?: string;
    };
    const listingId = payload.listingId;

    if (!listingId) {
      Logger.info('listings.applyVerificationChangesRequested skip', {
        eventName: 'listings.apply_verification_changes_requested_skip',
        reason: 'missing_listing_id',
        eventType: envelope.eventType,
        aggregateId: envelope.aggregateId,
      });
      return;
    }

    const listing =
      await this.listingRepositoryRead.findListingById(listingId);
    if (!listing) {
      Logger.info('listings.applyVerificationChangesRequested skip', {
        eventName: 'listings.apply_verification_changes_requested_skip',
        reason: 'listing_not_found',
        listingId,
      });
      return;
    }

    if (listing.status === EListingStatus.DRAFT) {
      return;
    }

    if (listing.status === EListingStatus.SUBMITTED) {
      await this.transitionStatus(
        listing,
        EListingStatus.DRAFT,
        undefined,
        'verification_changes_requested',
      );
      return;
    }

    Logger.info('listings.applyVerificationChangesRequested skip', {
      eventName: 'listings.apply_verification_changes_requested_skip',
      reason: 'status_not_eligible',
      listingId,
      status: listing.status,
    });
  }

  async applyVerificationRejected(envelope: IEventEnvelope): Promise<void> {
    const payload = envelope.payload as {
      listingId?: string;
      caseId?: string;
      reason?: string;
    };
    const listingId = payload.listingId;

    if (!listingId) {
      Logger.info('listings.applyVerificationRejected skip', {
        eventName: 'listings.apply_verification_rejected_skip',
        reason: 'missing_listing_id',
        eventType: envelope.eventType,
        aggregateId: envelope.aggregateId,
      });
      return;
    }

    const listing =
      await this.listingRepositoryRead.findListingById(listingId);
    if (!listing) {
      Logger.info('listings.applyVerificationRejected skip', {
        eventName: 'listings.apply_verification_rejected_skip',
        reason: 'listing_not_found',
        listingId,
      });
      return;
    }

    if (listing.status === EListingStatus.REJECTED) {
      return;
    }

    if (listing.status === EListingStatus.SUBMITTED) {
      await this.transitionStatus(
        listing,
        EListingStatus.REJECTED,
        undefined,
        payload.reason ?? 'verification_rejected',
      );
      return;
    }

    Logger.info('listings.applyVerificationRejected skip', {
      eventName: 'listings.apply_verification_rejected_skip',
      reason: 'status_not_eligible',
      listingId,
      status: listing.status,
    });
  }

  private async assertRevisionChangesApplied(listing: IListing): Promise<void> {
    if (!this.verificationCaseRepositoryRead) {
      return;
    }
    if (listing.status !== EListingStatus.DRAFT) {
      return;
    }

    const changesRequestedCase =
      await this.verificationCaseRepositoryRead.findLatestChangesRequestedCaseByListingId(
        listing.id,
      );
    if (!changesRequestedCase) {
      return;
    }

    assertRequiredChangesApplied(listing, changesRequestedCase);
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

  private async publishListingStatusChange(
    existing: IListing,
    updated: IListing,
    toStatus: EListingStatus,
    actorId: string,
    reason?: string,
  ): Promise<IListing> {
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
    if (toStatus === EListingStatus.RESERVED) {
      return 'listings.listing.reserved';
    }
    if (toStatus === EListingStatus.SOLD) {
      return 'listings.listing.sold';
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
    if (!listing.media.videoUrl?.trim()) {
      throw {
        status: 400,
        errorCode: EErrorCode.FIELD_INVALID,
        message: 'A video is required to submit',
        details: { field: 'media.videoUrl' },
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

  private async resolveListingMedia(
    media: IListingMedia,
    sellerId: string,
  ): Promise<IListingMedia> {
    if (!this.mediaClient) {
      return media;
    }

    const hasPhotoAssets = Boolean(media.assetIds?.length);
    const hasVideoAsset = Boolean(media.videoAssetId?.trim());
    if (!hasPhotoAssets && !hasVideoAsset) {
      return media;
    }

    let photoUrls = media.photoUrls ?? [];
    let coverPhotoUrl = media.coverPhotoUrl;
    let videoUrl = media.videoUrl;
    let assetIds = media.assetIds;
    let videoAssetId = media.videoAssetId?.trim();

    if (hasPhotoAssets && media.assetIds) {
      photoUrls = [];
      for (const assetId of media.assetIds) {
        const asset = await this.mediaClient.assertAttachableAsset({
          assetId,
          purpose: EMediaPurpose.LISTING,
          ownerId: sellerId,
        });
        if (!isImageContentType(asset.contentType)) {
          throw {
            status: 400,
            errorCode: EErrorCode.FIELD_INVALID,
            message: 'media.assetIds must reference image assets only',
            details: { field: 'media.assetIds', assetId },
          } as IThrowedError;
        }
        const urls = await this.mediaClient.resolvePublicVariantUrls(assetId);
        if (urls[0]) {
          photoUrls.push(urls[0]);
        }
      }
      coverPhotoUrl = media.coverPhotoUrl || photoUrls[0];
      assetIds = media.assetIds;
    }

    if (hasVideoAsset && videoAssetId) {
      const asset = await this.mediaClient.assertAttachableAsset({
        assetId: videoAssetId,
        purpose: EMediaPurpose.LISTING,
        ownerId: sellerId,
      });
      if (!isVideoContentType(asset.contentType)) {
        throw {
          status: 400,
          errorCode: EErrorCode.FIELD_INVALID,
          message: 'media.videoAssetId must reference a video asset',
          details: { field: 'media.videoAssetId', assetId: videoAssetId },
        } as IThrowedError;
      }
      const resolvedVideoUrl =
        await this.mediaClient.resolvePublicVideoUrl(videoAssetId);
      if (!resolvedVideoUrl) {
        throw {
          status: 400,
          errorCode: EErrorCode.FIELD_INVALID,
          message: 'media.videoAssetId has no public video URL',
          details: { field: 'media.videoAssetId', assetId: videoAssetId },
        } as IThrowedError;
      }
      videoUrl = resolvedVideoUrl;
    }

    return {
      ...media,
      photoUrls,
      coverPhotoUrl,
      videoUrl,
      assetIds,
      videoAssetId,
    };
  }

  async getPublishedListingForCheckout(
    listingId: string,
  ): Promise<IListing | null> {
    const listing = await this.listingRepositoryRead.findListingById(listingId);
    if (!listing || listing.status !== EListingStatus.PUBLISHED) {
      return null;
    }
    return listing;
  }

  async reserveListingForOrder(
    listingId: string,
    orderId: string,
    actor: IActorContext,
  ): Promise<IListing> {
    assertActorPresent(actor);
    await this.listingRepositoryWrite.expireStaleReservations(new Date());

    const existing = await this.listingRepositoryRead.findListingById(listingId);
    if (!existing) {
      throw {
        status: 404,
        errorCode: EErrorCode.RESOURCE_NOT_FOUND,
        message: 'Listing not found',
        details: { listingId },
      } as IThrowedError;
    }

    if (
      existing.status !== EListingStatus.PUBLISHED ||
      !existing.buyNowEnabled
    ) {
      throw {
        status: 409,
        errorCode: EErrorCode.LISTING_NOT_AVAILABLE_FOR_PURCHASE,
        message: 'Listing is not available for buy now',
        details: { listingId, status: existing.status },
      } as IThrowedError;
    }

    const reservedAt = new Date();
    const reservationExpiresAt = new Date(
      reservedAt.getTime() + 15 * 60 * 1000,
    );

    const reserved = await this.listingRepositoryWrite.reserveListingForOrder({
      listingId,
      orderId,
      reservedAt,
      reservationExpiresAt,
    });

    if (!reserved) {
      throw {
        status: 409,
        errorCode: EErrorCode.LISTING_ALREADY_RESERVED,
        message: 'Listing is already reserved or sold',
        details: { listingId },
      } as IThrowedError;
    }

    return this.publishListingStatusChange(
      existing,
      reserved,
      EListingStatus.RESERVED,
      actor.actorId,
      'Reserved for order',
    );
  }

  async releaseListingReservation(
    listingId: string,
    orderId: string,
    actor: IActorContext,
  ): Promise<IListing> {
    assertActorPresent(actor);
    const existing = await this.listingRepositoryRead.findListingById(listingId);
    if (!existing) {
      throw {
        status: 404,
        errorCode: EErrorCode.RESOURCE_NOT_FOUND,
        message: 'Listing not found',
        details: { listingId },
      } as IThrowedError;
    }

    const released =
      await this.listingRepositoryWrite.releaseListingReservation({
        listingId,
        orderId,
      });

    if (!released) {
      throw {
        status: 409,
        errorCode: EErrorCode.RESOURCE_CONFLICT,
        message: 'Listing reservation could not be released',
        details: { listingId, orderId },
      } as IThrowedError;
    }

    return this.publishListingStatusChange(
      existing,
      released,
      EListingStatus.PUBLISHED,
      actor.actorId,
      'Reservation released',
    );
  }

  async markListingSoldForOrder(
    listingId: string,
    orderId: string,
    actor: IActorContext,
  ): Promise<IListing> {
    assertActorPresent(actor);
    const existing = await this.listingRepositoryRead.findListingById(listingId);
    if (!existing) {
      throw {
        status: 404,
        errorCode: EErrorCode.RESOURCE_NOT_FOUND,
        message: 'Listing not found',
        details: { listingId },
      } as IThrowedError;
    }

    const sold = await this.listingRepositoryWrite.markListingSold({
      listingId,
      orderId,
    });

    if (!sold) {
      throw {
        status: 409,
        errorCode: EErrorCode.RESOURCE_CONFLICT,
        message: 'Listing could not be marked sold',
        details: { listingId, orderId },
      } as IThrowedError;
    }

    return this.publishListingStatusChange(
      existing,
      sold,
      EListingStatus.SOLD,
      actor.actorId,
      'Sold via order',
    );
  }
}
