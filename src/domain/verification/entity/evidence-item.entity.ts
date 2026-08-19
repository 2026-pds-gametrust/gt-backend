import { requireNonEmptyString } from '../../common/types/required-string';
import { EEvidenceType } from './enums/EEvidenceType';
import { IEvidenceItem } from './interfaces/evidence-item.interface';

export class EvidenceItemServiceEntity implements IEvidenceItem {
  id: string;
  caseId: string;
  type: EEvidenceType;
  storageKey: string;
  assetId?: string;
  contentHash?: string;
  createdAt: Date;

  constructor(evidence: IEvidenceItem) {
    this.validate(evidence);
    this.id = evidence.id;
    this.caseId = evidence.caseId.trim();
    this.type = evidence.type;
    this.storageKey = evidence.storageKey.trim();
    this.assetId = evidence.assetId?.trim();
    this.contentHash = evidence.contentHash?.trim();
    this.createdAt = evidence.createdAt || new Date();
  }

  private validate(evidence: IEvidenceItem): void {
    requireNonEmptyString(evidence.id, 'id');
    requireNonEmptyString(evidence.caseId, 'caseId');
    if (!evidence.type) {
      throw new Error('type is required');
    }
    requireNonEmptyString(evidence.storageKey, 'storageKey');
  }
}
