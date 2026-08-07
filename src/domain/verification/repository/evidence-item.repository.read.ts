import { IEvidenceItem } from '../entity/interfaces/evidence-item.interface';

export interface IEvidenceItemRepositoryRead {
  findEvidenceItemById(id: string): Promise<IEvidenceItem | null>;
  listByCaseId(caseId: string): Promise<IEvidenceItem[]>;
}
