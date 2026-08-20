import { Schema } from 'mongoose';
import { EEscrowHoldStatus } from '../../../../domain/payments/entity/enums/EEscrowHoldStatus';
import type { IMEscrowHold } from '../models/escrow-hold.model';

export const EscrowHoldSchema = new Schema<IMEscrowHold>(
  {
    id: { type: String, required: true, unique: true },
    orderId: { type: String, required: true, unique: true, index: true },
    paymentId: { type: String, required: true, index: true },
    amountCents: { type: Number, required: true },
    currency: { type: String, required: true, default: 'BRL' },
    status: {
      type: String,
      enum: Object.values(EEscrowHoldStatus),
      required: true,
    },
  },
  { timestamps: true, collection: 'escrow_holds' },
);
