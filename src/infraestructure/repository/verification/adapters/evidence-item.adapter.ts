import { IEvidenceItem } from '../../../../domain/verification/entity/interfaces/evidence-item.interface';
import { IMEvidenceItem } from '../../../db/mongo/models/evidence-item.model';

export function dbToInternal(doc: IMEvidenceItem): IEvidenceItem {
  return {
    id: doc.id,
    caseId: doc.caseId,
    type: doc.type,
    storageKey: doc.storageKey,
    assetId: doc.assetId,
    contentHash: doc.contentHash,
    createdAt: doc.createdAt,
  };
}

export function internalToDb(
  evidence: IEvidenceItem,
): Omit<IMEvidenceItem, '_id' | 'createdAt'> {
  return {
    id: evidence.id,
    caseId: evidence.caseId,
    type: evidence.type,
    storageKey: evidence.storageKey,
    assetId: evidence.assetId,
    contentHash: evidence.contentHash,
  };
}
