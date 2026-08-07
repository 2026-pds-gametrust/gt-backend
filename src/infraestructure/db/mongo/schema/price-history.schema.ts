import { Schema } from 'mongoose';
import { EPriceHistorySource } from '../../../../domain/catalog/entity/enums/EPriceHistorySource';
import type { IMPriceHistory } from '../models/price-history.model';

export const PriceHistorySchema = new Schema<IMPriceHistory>(
  {
    id: { type: String, required: true, unique: true },
    productId: { type: String, required: true, index: true },
    priceCents: { type: Number, required: true },
    currency: { type: String, required: true },
    source: {
      type: String,
      enum: Object.values(EPriceHistorySource),
      required: true,
    },
    observedAt: { type: Date, required: true },
  },
  { timestamps: { createdAt: true, updatedAt: false }, collection: 'price_history' },
);
