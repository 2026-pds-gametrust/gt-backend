import { IListing } from '../entity/interfaces/listing.interface';

export interface IListingRepositoryWrite {
  createListing(listing: IListing): Promise<IListing>;
  updateListingById(
    id: string,
    data: Partial<IListing>,
  ): Promise<IListing | null>;
}
