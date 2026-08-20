import { Types, model } from 'mongoose';
import { IListingEvent } from '../../../../domain/listings/entity/interfaces/listing-event.interface';
import { ListingEventSchema } from '../schema/listing-event.schema';

export interface IMListingEvent extends Omit<IListingEvent, '_id'> {
  _id: Types.ObjectId;
}

export const ListingEventModel = model<IMListingEvent>(
  'ListingEvent',
  ListingEventSchema,
);
