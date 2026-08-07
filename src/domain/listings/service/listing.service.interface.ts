import { IEventEnvelope } from '../../common/messaging/event-envelope';
import { IEventPublisher } from '../../common/messaging/event-publisher.interface';
import { IActorContext } from '../../common/types/actor-context';
import { IUserRepositoryRead } from '../../identity/repository/user.repository.read';
import { IProductRepositoryRead } from '../../catalog/repository/product.repository.read';
import { IPriceHistoryRepositoryWrite } from '../../catalog/repository/price-history.repository.write';
import { EListingCondition } from '../entity/enums/EListingCondition';
import { EListingStatus } from '../entity/enums/EListingStatus';
import {
  IListing,
  IListingMedia,
  IListingShipping,
  IListingWarranty,
  TListingAttributeValue,
} from '../entity/interfaces/listing.interface';
import { IListingEvent } from '../entity/interfaces/listing-event.interface';
import { IListingEventRepositoryRead } from '../repository/listing-event.repository.read';
import { IListingEventRepositoryWrite } from '../repository/listing-event.repository.write';
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
}

export interface IListingService {
  createListing(
    params: IParamsCreateListing,
    actor: IActorContext,
  ): Promise<IListing>;
  getListingById(id: string): Promise<IListing>;
  listListings(filter?: Partial<IListing>): Promise<IListing[]>;
  updateListingById(
    id: string,
    params: IParamsUpdateListing,
    actor: IActorContext,
  ): Promise<IListing>;
  submitListing(id: string, actor: IActorContext): Promise<IListing>;
  publishListing(id: string, actor: IActorContext): Promise<IListing>;
  pauseListing(id: string, actor: IActorContext): Promise<IListing>;
  listEvents(listingId: string): Promise<IListingEvent[]>;
  applyVerificationApproved(envelope: IEventEnvelope): Promise<void>;
}
