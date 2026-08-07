import { ISynonym } from '../../../../domain/search/entity/interfaces/synonym.interface';
import { IMSynonym } from '../../../db/mongo/models/synonym.model';

export function dbToInternal(doc: IMSynonym): ISynonym {
  return {
    id: doc.id,
    normalizedTerm: doc.normalizedTerm,
    targetType: doc.targetType,
    targetId: doc.targetId,
    canonicalName: doc.canonicalName,
    updatedAt: doc.updatedAt,
  };
}

export function internalToDb(
  synonym: ISynonym,
): Omit<IMSynonym, '_id' | 'updatedAt'> {
  return {
    id: synonym.id,
    normalizedTerm: synonym.normalizedTerm,
    targetType: synonym.targetType,
    targetId: synonym.targetId,
    canonicalName: synonym.canonicalName,
  };
}
