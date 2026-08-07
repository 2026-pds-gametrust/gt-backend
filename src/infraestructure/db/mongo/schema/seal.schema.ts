import { Schema } from 'mongoose';
import { ESealStatus } from '../../../../domain/verification/entity/enums/ESealStatus';
import { ESealType } from '../../../../domain/verification/entity/enums/ESealType';
import type { IMSeal } from '../models/seal.model';

export const SealSchema = new Schema<IMSeal>(
  {
    id: { type: String, required: true, unique: true },
    listingId: { type: String, required: true, index: true },
    caseId: { type: String, required: true, index: true },
    type: {
      type: String,
      enum: Object.values(ESealType),
      required: true,
    },
    status: {
      type: String,
      enum: Object.values(ESealStatus),
      required: true,
    },
    grantedAt: { type: Date },
    expiresAt: { type: Date },
  },
  { timestamps: true, collection: 'seals' },
);

SealSchema.index(
  { listingId: 1 },
  {
    unique: true,
    partialFilterExpression: { status: ESealStatus.GRANTED },
  },
);
