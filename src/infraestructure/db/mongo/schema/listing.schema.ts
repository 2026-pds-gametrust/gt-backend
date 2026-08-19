import { Schema } from 'mongoose';
import { EListingCondition } from '../../../../domain/listings/entity/enums/EListingCondition';
import { EListingStatus } from '../../../../domain/listings/entity/enums/EListingStatus';
import { EShippingMode } from '../../../../domain/listings/entity/enums/EShippingMode';
import { EWarrantyType } from '../../../../domain/listings/entity/enums/EWarrantyType';
import type { IMListing } from '../models/listing.model';

const MediaSchema = new Schema(
  {
    photoUrls: { type: [String], default: [] },
    videoUrl: { type: String },
    coverPhotoUrl: { type: String },
    assetIds: { type: [String], default: undefined },
    videoAssetId: { type: String },
  },
  { _id: false },
);

const ShippingSchema = new Schema(
  {
    modes: {
      type: [String],
      enum: Object.values(EShippingMode),
      required: true,
    },
    packageWeightGrams: { type: Number },
    packageLengthCm: { type: Number },
    packageWidthCm: { type: Number },
    packageHeightCm: { type: Number },
    freeShipping: { type: Boolean },
  },
  { _id: false },
);

const WarrantySchema = new Schema(
  {
    type: {
      type: String,
      enum: Object.values(EWarrantyType),
      required: true,
    },
    months: { type: Number },
  },
  { _id: false },
);

export const ListingSchema = new Schema<IMListing>(
  {
    id: { type: String, required: true, unique: true },
    sellerId: { type: String, required: true, index: true },
    productId: { type: String, required: true, index: true },
    title: { type: String, required: true },
    description: { type: String },
    condition: {
      type: String,
      enum: Object.values(EListingCondition),
      required: true,
    },
    priceCents: { type: Number, required: true },
    listPriceCents: { type: Number },
    currency: { type: String, required: true, default: 'BRL' },
    attributes: { type: Schema.Types.Mixed },
    media: { type: MediaSchema, required: true },
    shipping: { type: ShippingSchema, required: true },
    locationApprox: { type: String },
    warranty: { type: WarrantySchema },
    acceptsOffers: { type: Boolean, required: true, default: false },
    buyNowEnabled: { type: Boolean, required: true, default: true },
    quantity: { type: Number, required: true, default: 1 },
    status: {
      type: String,
      enum: Object.values(EListingStatus),
      required: true,
      default: EListingStatus.DRAFT,
    },
    qualityHints: { type: Schema.Types.Mixed },
  },
  { timestamps: true, collection: 'listings' },
);
