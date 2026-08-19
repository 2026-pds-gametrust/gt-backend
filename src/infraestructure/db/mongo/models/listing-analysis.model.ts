import { Types, model } from 'mongoose';
import { IListingAnalysis } from '../../../../domain/ai/entity/interfaces/listing-analysis.interface';
import { ListingAnalysisSchema } from '../schema/listing-analysis.schema';

export interface IMListingAnalysis extends Omit<IListingAnalysis, '_id'> {
  _id: Types.ObjectId;
  updatedAt: Date;
}

export const ListingAnalysisModel = model<IMListingAnalysis>(
  'ListingAnalysis',
  ListingAnalysisSchema,
);
