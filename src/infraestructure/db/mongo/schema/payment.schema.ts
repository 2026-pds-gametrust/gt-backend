import { Schema } from 'mongoose';
import { EPaymentStatus } from '../../../../domain/payments/entity/enums/EPaymentStatus';
import type { IMPayment } from '../models/payment.model';

export const PaymentSchema = new Schema<IMPayment>(
  {
    id: { type: String, required: true, unique: true },
    orderId: { type: String, required: true, unique: true, index: true },
    amountCents: { type: Number, required: true },
    currency: { type: String, required: true, default: 'BRL' },
    status: {
      type: String,
      enum: Object.values(EPaymentStatus),
      required: true,
    },
  },
  { timestamps: true, collection: 'payments' },
);
