import { Schema } from 'mongoose';
import { EListingStatus } from '../../../../domain/listings/entity/enums/EListingStatus';
import type { IMListingEvent } from '../models/listing-event.model';

export const ListingEventSchema = new Schema<IMListingEvent>(
  {
    id: { type: String, required: true, unique: true },
    listingId: { type: String, required: true, index: true },
    fromStatus: {
      type: String,
      enum: Object.values(EListingStatus),
      default: null,
    },
    toStatus: {
      type: String,
      enum: Object.values(EListingStatus),
      required: true,
    },
    reason: { type: String },
    actorId: { type: String },
    occurredAt: { type: Date, required: true },
  },
  { timestamps: false, collection: 'listing_events' },
);
