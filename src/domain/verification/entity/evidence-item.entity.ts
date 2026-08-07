import { EEvidenceType } from './enums/EEvidenceType';
import { IEvidenceItem } from './interfaces/evidence-item.interface';

export class EvidenceItemServiceEntity implements IEvidenceItem {
  id: string;
  caseId: string;
  type: EEvidenceType;
  storageKey: string;
  contentHash?: string;
  createdAt: Date;

  constructor(evidence: IEvidenceItem) {
    this.validate(evidence);
    this.id = evidence.id;
    this.caseId = evidence.caseId.trim();
    this.type = evidence.type;
    this.storageKey = evidence.storageKey.trim();
    this.contentHash = evidence.contentHash?.trim();
    this.createdAt = evidence.createdAt || new Date();
  }

  private validate(evidence: IEvidenceItem): void {
    if (!evidence.id?.trim()) {
      throw new Error('id is required');
    }
    if (!evidence.caseId?.trim()) {
      throw new Error('caseId is required');
    }
    if (!evidence.type) {
      throw new Error('type is required');
    }
    if (!evidence.storageKey?.trim()) {
      throw new Error('storageKey is required');
    }
  }
}
