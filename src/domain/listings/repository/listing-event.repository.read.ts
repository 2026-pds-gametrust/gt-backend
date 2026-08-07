import { IListingEvent } from '../entity/interfaces/listing-event.interface';

export interface IListingEventRepositoryRead {
  listByListingId(listingId: string): Promise<IListingEvent[]>;
}
