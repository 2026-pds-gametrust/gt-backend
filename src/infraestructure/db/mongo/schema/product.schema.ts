import { Schema } from 'mongoose';
import { EProductStatus } from '../../../../domain/catalog/entity/enums/EProductStatus';
import type { IMProduct } from '../models/product.model';

export const ProductSchema = new Schema<IMProduct>(
  {
    id: { type: String, required: true, unique: true },
    categoryId: { type: String, required: true, index: true },
    brand: { type: String, required: true },
    model: { type: String, required: true },
    series: { type: String },
    slug: { type: String, required: true, unique: true, index: true },
    mpn: { type: String },
    ean: { type: String },
    sku: { type: String, sparse: true, unique: true },
    specs: { type: Schema.Types.Mixed },
    imageUrls: { type: [String], default: undefined },
    imageAssetIds: { type: [String], default: undefined },
    referencePriceCents: { type: Number },
    currency: { type: String },
    status: {
      type: String,
      enum: Object.values(EProductStatus),
      required: true,
      default: EProductStatus.ACTIVE,
    },
  },
  { timestamps: true, collection: 'products' },
);
