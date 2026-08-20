import { Schema } from 'mongoose';
import { EShippingMode } from '../../../../domain/listings/entity/enums/EShippingMode';
import { EOrderStatus } from '../../../../domain/orders/entity/enums/EOrderStatus';
import type { IMOrder } from '../models/order.model';

export const OrderSchema = new Schema<IMOrder>(
  {
    id: { type: String, required: true, unique: true },
    listingId: { type: String, required: true, index: true },
    buyerId: { type: String, required: true, index: true },
    sellerId: { type: String, required: true, index: true },
    shippingMode: {
      type: String,
      enum: Object.values(EShippingMode),
      required: true,
    },
    priceCents: { type: Number, required: true },
    currency: { type: String, required: true, default: 'BRL' },
    status: {
      type: String,
      enum: Object.values(EOrderStatus),
      required: true,
    },
    reservationExpiresAt: { type: Date, required: true },
  },
  { timestamps: true, collection: 'orders' },
);

OrderSchema.index({ buyerId: 1, createdAt: -1 });
OrderSchema.index({ sellerId: 1, createdAt: -1 });
