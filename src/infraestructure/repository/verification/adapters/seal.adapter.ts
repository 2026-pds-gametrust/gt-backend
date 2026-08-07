import { ISeal } from '../../../../domain/verification/entity/interfaces/seal.interface';
import { IMSeal } from '../../../db/mongo/models/seal.model';

export function dbToInternal(doc: IMSeal): ISeal {
  return {
    id: doc.id,
    listingId: doc.listingId,
    caseId: doc.caseId,
    type: doc.type,
    status: doc.status,
    grantedAt: doc.grantedAt,
    expiresAt: doc.expiresAt,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };
}

export function internalToDb(
  seal: ISeal,
): Omit<IMSeal, '_id' | 'createdAt' | 'updatedAt'> {
  return {
    id: seal.id,
    listingId: seal.listingId,
    caseId: seal.caseId,
    type: seal.type,
    status: seal.status,
    grantedAt: seal.grantedAt,
    expiresAt: seal.expiresAt,
  };
}
