import { IVerificationCase } from '../../../../domain/verification/entity/interfaces/verification-case.interface';
import { IMVerificationCase } from '../../../db/mongo/models/verification-case.model';

export function dbToInternal(doc: IMVerificationCase): IVerificationCase {
  return {
    id: doc.id,
    listingId: doc.listingId,
    status: doc.status,
    checklist: doc.checklist,
    decisionReason: doc.decisionReason,
    moderatorId: doc.moderatorId,
    requiredChanges: doc.requiredChanges,
    revisionBaseline: doc.revisionBaseline,
    previousCaseId: doc.previousCaseId,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };
}

export function internalToDb(
  verificationCase: IVerificationCase,
): Omit<IMVerificationCase, '_id' | 'createdAt' | 'updatedAt'> {
  return {
    id: verificationCase.id,
    listingId: verificationCase.listingId,
    status: verificationCase.status,
    checklist: verificationCase.checklist,
    decisionReason: verificationCase.decisionReason,
    moderatorId: verificationCase.moderatorId,
    requiredChanges: verificationCase.requiredChanges,
    revisionBaseline: verificationCase.revisionBaseline,
    previousCaseId: verificationCase.previousCaseId,
  };
}
