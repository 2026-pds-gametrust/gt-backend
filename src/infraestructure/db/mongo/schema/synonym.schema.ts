import { Schema } from 'mongoose';
import { ESynonymTargetType } from '../../../../domain/search/entity/enums/ESynonymTargetType';
import type { IMSynonym } from '../models/synonym.model';

export const SynonymSchema = new Schema<IMSynonym>(
  {
    id: { type: String, required: true, unique: true },
    normalizedTerm: { type: String, required: true, unique: true },
    targetType: {
      type: String,
      enum: Object.values(ESynonymTargetType),
      required: true,
    },
    targetId: { type: String, required: true, index: true },
    canonicalName: { type: String, required: true },
  },
  {
    timestamps: { createdAt: false, updatedAt: true },
    collection: 'synonyms',
  },
);
