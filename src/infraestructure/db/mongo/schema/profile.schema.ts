import { Schema } from 'mongoose';
import type { IMProfile } from '../models/profile.model';

const GeoPointSchema = new Schema(
  {
    type: { type: String, enum: ['Point'], required: true },
    coordinates: { type: [Number], required: true },
  },
  { _id: false },
);

const AddressSchema = new Schema(
  {
    id: { type: String, required: true },
    label: { type: String },
    recipientName: { type: String, required: true },
    postalCode: { type: String, required: true },
    street: { type: String, required: true },
    number: { type: String, required: true },
    complement: { type: String },
    district: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    country: { type: String, required: true, default: 'BR' },
    isBilling: { type: Boolean, default: false },
    isShipping: { type: Boolean, default: true },
    geo: { type: GeoPointSchema, required: false },
    geoSource: {
      type: String,
      enum: ['BRASIL_API', 'NOMINATIM'],
      required: false,
    },
  },
  { _id: false },
);

export const ProfileSchema = new Schema<IMProfile>(
  {
    id: { type: String, required: true, unique: true },
    userId: { type: String, required: true, unique: true, index: true },
    displayName: { type: String },
    bio: { type: String },
    locationApprox: { type: String },
    addresses: { type: [AddressSchema], default: [] },
    defaultShippingAddressId: { type: String },
    setupItems: { type: [Schema.Types.Mixed], default: undefined },
  },
  { timestamps: true, collection: 'profiles' },
);

ProfileSchema.index({ 'addresses.geo': '2dsphere' });
