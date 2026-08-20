import { IActorContext } from '../../common/types/actor-context';
import { IEventPublisher } from '../../common/messaging/event-publisher.interface';
import { IEvidenceItemRepositoryRead } from '../../verification/repository/evidence-item.repository.read';
import { IListingRepositoryRead } from '../../listings/repository/listing.repository.read';
import { IMediaAssetRepositoryRead } from '../../media/repository/media-asset.repository.read';
import { IObjectStorage } from '../../media/storage/object-storage.interface';
import { IVerificationCaseRepositoryRead } from '../../verification/repository/verification-case.repository.read';
import { IVerificationCaseRepositoryWrite } from '../../verification/repository/verification-case.repository.write';
import { IProofCodeAnalysis } from '../entity/interfaces/proof-code-analysis.interface';
import { IProofCodeAnalysisProvider } from '../provider/proof-code-analysis.provider.interface';
import { IProofCodeAnalysisRepositoryRead } from '../repository/proof-code-analysis.repository.read';
import { IProofCodeAnalysisRepositoryWrite } from '../repository/proof-code-analysis.repository.write';

export interface IParamsRequestProofCodeAnalysis {
  force?: boolean;
}

export interface IParamsProofCodeAnalysisService {
  proofCodeAnalysisRepositoryRead: IProofCodeAnalysisRepositoryRead;
  proofCodeAnalysisRepositoryWrite: IProofCodeAnalysisRepositoryWrite;
  verificationCaseRepositoryRead: IVerificationCaseRepositoryRead;
  verificationCaseRepositoryWrite: IVerificationCaseRepositoryWrite;
  evidenceItemRepositoryRead: IEvidenceItemRepositoryRead;
  listingRepositoryRead: IListingRepositoryRead;
  mediaAssetRepositoryRead: IMediaAssetRepositoryRead;
  objectStorage: IObjectStorage;
  analysisProvider: IProofCodeAnalysisProvider;
  eventPublisher: IEventPublisher;
  analysisEnabled: boolean;
  maxPhotosToAnalyze: number;
  maxVideoBytes: number;
}

export interface IProofCodeAnalysisService {
  requestAnalysis(
    caseId: string,
    opts?: IParamsRequestProofCodeAnalysis,
  ): Promise<IProofCodeAnalysis | null>;
  getAnalysisForCase(
    caseId: string,
    actor: IActorContext,
  ): Promise<IProofCodeAnalysis>;
  requestForcedAnalysisForModerator(
    caseId: string,
    actor: IActorContext,
  ): Promise<IProofCodeAnalysis | null>;
  assertModeratorMayReanalyze(
    caseId: string,
    actor: IActorContext,
  ): Promise<void>;
  applyAnalysisToVerificationCase(
    caseId: string,
    analysisId: string,
  ): Promise<void>;
}
