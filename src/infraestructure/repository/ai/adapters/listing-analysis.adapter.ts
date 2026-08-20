import { IListingAnalysis } from '../../../../domain/ai/entity/interfaces/listing-analysis.interface';
import { IMListingAnalysis } from '../../../db/mongo/models/listing-analysis.model';

export function dbToInternal(doc: IMListingAnalysis): IListingAnalysis {
  return {
    id: doc.id,
    listingId: doc.listingId,
    scope: doc.scope,
    status: doc.status,
    score: doc.score,
    items: doc.items ?? [],
    modelId: doc.modelId,
    promptVersion: doc.promptVersion,
    idempotencyKey: doc.idempotencyKey,
    failureReason: doc.failureReason,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };
}

export function internalToDb(
  analysis: IListingAnalysis,
): Omit<IMListingAnalysis, '_id' | 'updatedAt'> {
  return {
    id: analysis.id,
    listingId: analysis.listingId,
    scope: analysis.scope,
    status: analysis.status,
    score: analysis.score,
    items: analysis.items,
    modelId: analysis.modelId,
    promptVersion: analysis.promptVersion,
    idempotencyKey: analysis.idempotencyKey,
    failureReason: analysis.failureReason,
    createdAt: analysis.createdAt,
  };
}
