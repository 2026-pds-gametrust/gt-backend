import { Types, model } from 'mongoose';
import { IListing } from '../../../../domain/listings/entity/interfaces/listing.interface';
import { ListingSchema } from '../schema/listing.schema';

export interface IMListing extends Omit<IListing, '_id'> {
  _id: Types.ObjectId;
  updatedAt: Date;
}

export const ListingModel = model<IMListing>('Listing', ListingSchema);
