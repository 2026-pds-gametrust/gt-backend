import { Schema } from 'mongoose';
import { EServiceTaxonomyStatus } from '../../../../domain/catalog/entity/enums/EServiceTaxonomyStatus';
import type { IMServiceTaxonomy } from '../models/service-taxonomy.model';

export const ServiceTaxonomySchema = new Schema<IMServiceTaxonomy>(
  {
    id: { type: String, required: true, unique: true },
    slug: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true, unique: true, index: true },
    synonyms: { type: [String], default: [], index: true },
    status: {
      type: String,
      enum: Object.values(EServiceTaxonomyStatus),
      required: true,
      default: EServiceTaxonomyStatus.ACTIVE,
    },
  },
  { timestamps: true, collection: 'services' },
);
