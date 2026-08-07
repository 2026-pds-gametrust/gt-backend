import { Schema } from 'mongoose';
import type { IMQueryLog } from '../models/query-log.model';

export const QueryLogSchema = new Schema<IMQueryLog>(
  {
    id: { type: String, required: true, unique: true },
    query: { type: String, required: true },
    filters: { type: Schema.Types.Mixed },
    resultCount: { type: Number, required: true },
    actorId: { type: String },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
    collection: 'query_logs',
  },
);
