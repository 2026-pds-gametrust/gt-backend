import { IActorContext } from '../../../domain/common/types/actor-context';
import {
  IListingsClient,
  IListingCheckoutSnapshot,
} from '../../../domain/orders/client/listings.client';
import { EListingStatus } from '../../../domain/listings/entity/enums/EListingStatus';
import { ListingService } from '../../../domain/listings/service/listing.service';

export class ListingsClientAdapter implements IListingsClient {
  constructor(private readonly listingService: ListingService) {}

  async getListingForCheckout(
    listingId: string,
  ): Promise<IListingCheckoutSnapshot | null> {
    const listing =
      await this.listingService.getPublishedListingForCheckout(listingId);
    if (!listing || listing.status !== EListingStatus.PUBLISHED) {
      return null;
    }
    return {
      id: listing.id,
      sellerId: listing.sellerId,
      priceCents: listing.priceCents,
      currency: listing.currency,
      buyNowEnabled: listing.buyNowEnabled,
      shippingModes: listing.shipping.modes,
    };
  }

  async reserve(
    listingId: string,
    orderId: string,
    actor: IActorContext,
  ): Promise<void> {
    await this.listingService.reserveListingForOrder(
      listingId,
      orderId,
      actor,
    );
  }

  async release(
    listingId: string,
    orderId: string,
    actor: IActorContext,
  ): Promise<void> {
    await this.listingService.releaseListingReservation(
      listingId,
      orderId,
      actor,
    );
  }

  async markSold(
    listingId: string,
    orderId: string,
    actor: IActorContext,
  ): Promise<void> {
    await this.listingService.markListingSoldForOrder(
      listingId,
      orderId,
      actor,
    );
  }
}
