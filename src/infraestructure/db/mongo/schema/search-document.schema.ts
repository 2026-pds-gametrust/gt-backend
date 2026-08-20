import { Schema } from 'mongoose';
import type { IMSearchDocument } from '../models/search-document.model';

export const SearchDocumentSchema = new Schema<IMSearchDocument>(
  {
    id: { type: String, required: true, unique: true },
    listingId: { type: String, required: true, unique: true, index: true },
    productId: { type: String, required: true, index: true },
    categoryId: { type: String, required: true, index: true },
    sellerId: { type: String, required: true, index: true },
    title: { type: String, required: true },
    brand: { type: String },
    model: { type: String },
    condition: { type: String, required: true },
    status: { type: String, required: true, index: true },
    priceCents: { type: Number, required: true },
    listPriceCents: { type: Number },
    currency: { type: String, required: true },
    locationApprox: { type: String },
    shippingModes: { type: [String], default: undefined },
    freeShipping: { type: Boolean },
    trustScore: { type: Number },
    sellerLevel: { type: String },
    sealTypes: { type: [String], default: undefined },
    facets: { type: Schema.Types.Mixed },
    searchText: { type: String, required: true },
    thumbnailUrl: { type: String },
    embedding: { type: [Number], default: null },
    sourceOccurredAt: { type: Date, required: true },
  },
  {
    timestamps: { createdAt: false, updatedAt: true },
    collection: 'search_documents',
  },
);

SearchDocumentSchema.index({ searchText: 'text', title: 'text', brand: 'text' });
