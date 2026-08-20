import { EShippingMode } from '../../listings/entity/enums/EShippingMode';
import { IActorContext } from '../../common/types/actor-context';

export interface IListingCheckoutSnapshot {
  id: string;
  sellerId: string;
  priceCents: number;
  currency: string;
  buyNowEnabled: boolean;
  shippingModes: EShippingMode[];
}

export interface IListingsClient {
  getListingForCheckout(listingId: string): Promise<IListingCheckoutSnapshot | null>;
  reserve(
    listingId: string,
    orderId: string,
    actor: IActorContext,
  ): Promise<void>;
  release(
    listingId: string,
    orderId: string,
    actor: IActorContext,
  ): Promise<void>;
  markSold(
    listingId: string,
    orderId: string,
    actor: IActorContext,
  ): Promise<void>;
}
