import { IListing } from '../entity/interfaces/listing.interface';

export interface IListingRepositoryRead {
  findListingById(id: string): Promise<IListing | null>;
  listListings(filter?: Partial<IListing>): Promise<IListing[]>;
}
