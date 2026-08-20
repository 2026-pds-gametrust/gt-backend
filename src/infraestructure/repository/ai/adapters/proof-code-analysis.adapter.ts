import { IProofCodeAnalysis } from '../../../../domain/ai/entity/interfaces/proof-code-analysis.interface';
import { IMProofCodeAnalysis } from '../../../db/mongo/models/proof-code-analysis.model';

export function dbToInternal(doc: IMProofCodeAnalysis): IProofCodeAnalysis {
  return {
    id: doc.id,
    caseId: doc.caseId,
    listingId: doc.listingId,
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
  analysis: IProofCodeAnalysis,
): Omit<IMProofCodeAnalysis, '_id' | 'updatedAt'> {
  return {
    id: analysis.id,
    caseId: analysis.caseId,
    listingId: analysis.listingId,
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
