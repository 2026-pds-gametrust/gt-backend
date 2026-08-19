import { EEvidenceType } from '../enums/EEvidenceType';

export interface IEvidenceItem {
  id: string;
  caseId: string;
  type: EEvidenceType;
  storageKey: string;
  assetId?: string;
  contentHash?: string;
  createdAt: Date;
}
