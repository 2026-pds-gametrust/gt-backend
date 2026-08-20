import { Schema } from 'mongoose';
import type { IMListingAnalysis } from '../models/listing-analysis.model';

const AnalysisChecklistItemSchema = new Schema(
  {
    id: { type: String, required: true },
    status: { type: String, required: true },
    weight: { type: Number, required: true },
    reason: { type: String, required: true },
    evidenceRef: { type: String },
  },
  { _id: false },
);

export const ListingAnalysisSchema = new Schema<IMListingAnalysis>(
  {
    id: { type: String, required: true, unique: true },
    listingId: { type: String, required: true, index: true },
    scope: { type: String, required: true },
    status: { type: String, required: true },
    score: { type: Number, required: true },
    items: { type: [AnalysisChecklistItemSchema], default: [] },
    modelId: { type: String },
    promptVersion: { type: String, required: true },
    idempotencyKey: { type: String, required: true },
    failureReason: { type: String },
  },
  { timestamps: true, collection: 'listing_analyses' },
);

ListingAnalysisSchema.index({ listingId: 1, scope: 1, createdAt: -1 });
