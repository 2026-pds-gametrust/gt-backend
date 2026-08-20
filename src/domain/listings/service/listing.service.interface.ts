import { IEventEnvelope } from '../../common/messaging/event-envelope';
import { IEventPublisher } from '../../common/messaging/event-publisher.interface';
import { IActorContext } from '../../common/types/actor-context';
import { IUserRepositoryRead } from '../../identity/repository/user.repository.read';
import { IProductRepositoryRead } from '../../catalog/repository/product.repository.read';
import { IPriceHistoryRepositoryWrite } from '../../catalog/repository/price-history.repository.write';
import { IVerificationCaseRepositoryRead } from '../../verification/repository/verification-case.repository.read';
import { ISealRepositoryRead } from '../../verification/repository/seal.repository.read';
import { EListingCondition } from '../entity/enums/EListingCondition';
import { EListingStatus } from '../entity/enums/EListingStatus';
import {
  IListing,
  IListingMedia,
  IListingShipping,
  IListingWarranty,
  TListingAttributeValue,
} from '../entity/interfaces/listing.interface';
import {
  IListingPage,
  ISellerListingPage,
} from '../entity/interfaces/seller-listing.interface';
import { IListingEvent } from '../entity/interfaces/listing-event.interface';
import { IListingEventRepositoryRead } from '../repository/listing-event.repository.read';
import { IListingEventRepositoryWrite } from '../repository/listing-event.repository.write';
import { IMediaClient } from '../../media/client/media.client';
import { IListingRepositoryRead } from '../repository/listing.repository.read';
import { IListingRepositoryWrite } from '../repository/listing.repository.write';

export interface IParamsCreateListing {
  id: string;
  sellerId: string;
  productId: string;
  title: string;
  description?: string;
  condition: EListingCondition;
  priceCents: number;
  listPriceCents?: number;
  currency?: string;
  attributes?: Record<string, TListingAttributeValue>;
  media: IListingMedia;
  shipping: IListingShipping;
  locationApprox?: string;
  warranty?: IListingWarranty;
  acceptsOffers?: boolean;
  buyNowEnabled?: boolean;
  quantity?: number;
}

export interface IParamsUpdateListing {
  listingData: Partial<
    Pick<
      IListing,
      | 'title'
      | 'description'
      | 'condition'
      | 'priceCents'
      | 'listPriceCents'
      | 'currency'
      | 'attributes'
      | 'media'
      | 'shipping'
      | 'locationApprox'
      | 'warranty'
      | 'acceptsOffers'
      | 'buyNowEnabled'
    >
  >;
}

export interface IParamsListingService {
  listingRepositoryRead: IListingRepositoryRead;
  listingRepositoryWrite: IListingRepositoryWrite;
  listingEventRepositoryRead: IListingEventRepositoryRead;
  listingEventRepositoryWrite: IListingEventRepositoryWrite;
  userRepositoryRead: IUserRepositoryRead;
  productRepositoryRead: IProductRepositoryRead;
  priceHistoryRepositoryWrite: IPriceHistoryRepositoryWrite;
  eventPublisher: IEventPublisher;
  sealRepositoryRead: ISealRepositoryRead;
  mediaClient?: IMediaClient;
  verificationCaseRepositoryRead?: IVerificationCaseRepositoryRead;
}

export interface IParamsListMyListings {
  status?: EListingStatus;
  limit?: number;
  offset?: number;
}

export interface IParamsListListingsForViewer {
  sellerId?: string;
}

export interface IListingService {
  createListing(
    params: IParamsCreateListing,
    actor: IActorContext,
  ): Promise<IListing>;
  getListingById(id: string, actor?: IActorContext): Promise<IListing>;
  listPublicListings(params?: IParamsListMyListings): Promise<IListingPage>;
  listMyListings(
    actor: IActorContext,
    params?: IParamsListMyListings,
  ): Promise<ISellerListingPage>;
  listListingsForViewer(
    actor: IActorContext,
    options?: IParamsListListingsForViewer,
  ): Promise<IListing[]>;
  listListings(filter?: Partial<IListing>): Promise<IListing[]>;
  updateListingById(
    id: string,
    params: IParamsUpdateListing,
    actor: IActorContext,
  ): Promise<IListing>;
  submitListing(id: string, actor: IActorContext): Promise<IListing>;
  publishListing(id: string, actor: IActorContext): Promise<IListing>;
  pauseListing(id: string, actor: IActorContext): Promise<IListing>;
  listEvents(listingId: string, actor?: IActorContext): Promise<IListingEvent[]>;
  applyVerificationApproved(envelope: IEventEnvelope): Promise<void>;
  applyVerificationChangesRequested(envelope: IEventEnvelope): Promise<void>;
  applyVerificationRejected(envelope: IEventEnvelope): Promise<void>;
  reserveListingForOrder(
    listingId: string,
    orderId: string,
    actor: IActorContext,
  ): Promise<IListing>;
  releaseListingReservation(
    listingId: string,
    orderId: string,
    actor: IActorContext,
  ): Promise<IListing>;
  markListingSoldForOrder(
    listingId: string,
    orderId: string,
    actor: IActorContext,
  ): Promise<IListing>;
  getPublishedListingForCheckout(listingId: string): Promise<IListing | null>;
}
