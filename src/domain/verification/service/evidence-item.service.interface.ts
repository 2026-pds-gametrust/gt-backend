import { IMediaClient } from '../../media/client/media.client';
import { IEvidenceItem } from '../entity/interfaces/evidence-item.interface';
import { EEvidenceType } from '../entity/enums/EEvidenceType';
import { IEvidenceItemRepositoryRead } from '../repository/evidence-item.repository.read';
import { IEvidenceItemRepositoryWrite } from '../repository/evidence-item.repository.write';
import { IVerificationCaseRepositoryRead } from '../repository/verification-case.repository.read';

export interface IParamsAddEvidence {
  id: string;
  caseId: string;
  type: EEvidenceType;
  storageKey?: string;
  assetId?: string;
  contentHash?: string;
}

export interface IParamsEvidenceItemService {
  evidenceItemRepositoryRead: IEvidenceItemRepositoryRead;
  evidenceItemRepositoryWrite: IEvidenceItemRepositoryWrite;
  verificationCaseRepositoryRead: IVerificationCaseRepositoryRead;
  mediaClient?: IMediaClient;
}

export interface IEvidenceItemService {
  addEvidence(params: IParamsAddEvidence): Promise<IEvidenceItem>;
  getEvidenceItemById(id: string): Promise<IEvidenceItem>;
  listByCaseId(caseId: string): Promise<IEvidenceItem[]>;
}
