import { Types } from 'mongoose';
import { EVerificationCaseStatus } from '../../domain/verification/entity/enums/EVerificationCaseStatus';
import { IVerificationCase } from '../../domain/verification/entity/interfaces/verification-case.interface';
import { EEvidenceType } from '../../domain/verification/entity/enums/EEvidenceType';
import { IEvidenceItem } from '../../domain/verification/entity/interfaces/evidence-item.interface';
import { ESealStatus } from '../../domain/verification/entity/enums/ESealStatus';
import { ESealType } from '../../domain/verification/entity/enums/ESealType';
import { ISeal } from '../../domain/verification/entity/interfaces/seal.interface';

export const validVerificationCaseMock = (
  override?: Partial<IVerificationCase>,
): IVerificationCase => ({
  id: new Types.ObjectId().toHexString(),
  listingId: new Types.ObjectId().toHexString(),
  status: EVerificationCaseStatus.PENDING,
  createdAt: new Date(),
  ...override,
});

export const validEvidenceItemMock = (
  override?: Partial<IEvidenceItem>,
): IEvidenceItem => ({
  id: new Types.ObjectId().toHexString(),
  caseId: new Types.ObjectId().toHexString(),
  type: EEvidenceType.PHOTO,
  storageKey: `private/evidence/${Date.now()}.jpg`,
  createdAt: new Date(),
  ...override,
});

export const validSealMock = (override?: Partial<ISeal>): ISeal => ({
  id: new Types.ObjectId().toHexString(),
  listingId: new Types.ObjectId().toHexString(),
  caseId: new Types.ObjectId().toHexString(),
  type: ESealType.POSSESSION,
  status: ESealStatus.GRANTED,
  grantedAt: new Date(),
  createdAt: new Date(),
  ...override,
});
