import { IListingEvent } from '../entity/interfaces/listing-event.interface';

export interface IListingEventRepositoryWrite {
  appendListingEvent(event: IListingEvent): Promise<IListingEvent>;
}
