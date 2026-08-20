import { Schema } from 'mongoose';
import { EVerificationCaseStatus } from '../../../../domain/verification/entity/enums/EVerificationCaseStatus';
import type { IMVerificationCase } from '../models/verification-case.model';

export const VerificationCaseSchema = new Schema<IMVerificationCase>(
  {
    id: { type: String, required: true, unique: true },
    listingId: { type: String, required: true, index: true },
    status: {
      type: String,
      enum: Object.values(EVerificationCaseStatus),
      required: true,
    },
    checklist: { type: Schema.Types.Mixed },
    decisionReason: { type: String },
    moderatorId: { type: String },
    requiredChanges: { type: Schema.Types.Mixed },
    revisionBaseline: { type: Schema.Types.Mixed },
    previousCaseId: { type: String },
    proofCodeHash: { type: String },
    proofCodeIssuedAt: { type: Date },
  },
  { timestamps: true, collection: 'verification_cases' },
);

VerificationCaseSchema.index(
  { listingId: 1, status: 1 },
  {
    unique: true,
    partialFilterExpression: {
      status: {
        $in: [
          EVerificationCaseStatus.PENDING,
          EVerificationCaseStatus.IN_REVIEW,
        ],
      },
    },
  },
);
