import { Schema } from 'mongoose';
import { EEvidenceType } from '../../../../domain/verification/entity/enums/EEvidenceType';
import type { IMEvidenceItem } from '../models/evidence-item.model';

export const EvidenceItemSchema = new Schema<IMEvidenceItem>(
  {
    id: { type: String, required: true, unique: true },
    caseId: { type: String, required: true, index: true },
    type: {
      type: String,
      enum: Object.values(EEvidenceType),
      required: true,
    },
    storageKey: { type: String, required: true },
    contentHash: { type: String },
  },
  { timestamps: { createdAt: true, updatedAt: false }, collection: 'evidence_items' },
);
