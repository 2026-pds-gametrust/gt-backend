import { IListing } from '../entity/interfaces/listing.interface';

export interface IListingRepositoryWrite {
  createListing(listing: IListing): Promise<IListing>;
  updateListingById(
    id: string,
    data: Partial<IListing>,
  ): Promise<IListing | null>;
  reserveListingForOrder(params: {
    listingId: string;
    orderId: string;
    reservedAt: Date;
    reservationExpiresAt: Date;
  }): Promise<IListing | null>;
  releaseListingReservation(params: {
    listingId: string;
    orderId: string;
  }): Promise<IListing | null>;
  markListingSold(params: {
    listingId: string;
    orderId: string;
  }): Promise<IListing | null>;
  expireStaleReservations(now: Date): Promise<number>;
}
