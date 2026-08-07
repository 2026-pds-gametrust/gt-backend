import { IEvidenceItem } from '../entity/interfaces/evidence-item.interface';

export interface IEvidenceItemRepositoryWrite {
  createEvidenceItem(evidence: IEvidenceItem): Promise<IEvidenceItem>;
}
