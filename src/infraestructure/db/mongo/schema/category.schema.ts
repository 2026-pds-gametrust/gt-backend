import { Schema } from 'mongoose';
import type { IMCategory } from '../models/category.model';
import { ECategoryStatus } from '../../../../domain/catalog/entity/enums/ECategoryStatus';

export const CategorySchema = new Schema<IMCategory>(
  {
    id: { type: String, required: true, unique: true },
    slug: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true, unique: true, index: true },
    synonyms: { type: [String], default: [], index: true },
    parentId: { type: String, default: null },
    status: {
      type: String,
      enum: Object.values(ECategoryStatus),
      required: true,
      default: ECategoryStatus.ACTIVE,
    },
  },
  { timestamps: true, collection: 'categories' },
);
