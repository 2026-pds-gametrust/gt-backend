import { IActorContext } from '../../common/types/actor-context';
import { IEventEnvelope } from '../../common/messaging/event-envelope';
import { EListingAnalysisScope } from '../entity/enums/EListingAnalysisScope';
import { IListingAnalysis } from '../entity/interfaces/listing-analysis.interface';
import { IListingAnalysisProvider } from '../provider/listing-analysis.provider.interface';
import { IListingAnalysisRepositoryRead } from '../repository/listing-analysis.repository.read';
import { IListingAnalysisRepositoryWrite } from '../repository/listing-analysis.repository.write';
import { IListingRepositoryRead } from '../../listings/repository/listing.repository.read';
import { IMediaAssetRepositoryRead } from '../../media/repository/media-asset.repository.read';
import { IObjectStorage } from '../../media/storage/object-storage.interface';
import { IEventPublisher } from '../../common/messaging/event-publisher.interface';
import { IListingRepositoryWrite } from '../../listings/repository/listing.repository.write';
import { IVerificationCaseRepositoryRead } from '../../verification/repository/verification-case.repository.read';
import { IVerificationCaseRepositoryWrite } from '../../verification/repository/verification-case.repository.write';

export interface IParamsListingAnalysisService {
  listingAnalysisRepositoryRead: IListingAnalysisRepositoryRead;
  listingAnalysisRepositoryWrite: IListingAnalysisRepositoryWrite;
  listingRepositoryRead: IListingRepositoryRead;
  listingRepositoryWrite: IListingRepositoryWrite;
  mediaAssetRepositoryRead: IMediaAssetRepositoryRead;
  objectStorage: IObjectStorage;
  verificationCaseRepositoryRead: IVerificationCaseRepositoryRead;
  verificationCaseRepositoryWrite: IVerificationCaseRepositoryWrite;
  analysisProvider: IListingAnalysisProvider;
  eventPublisher: IEventPublisher;
  analysisEnabled: boolean;
  maxPhotosToAnalyze: number;
  maxVideoBytes: number;
}

export interface IListingAnalysisService {
  requestAnalysis(
    listingId: string,
    scope: EListingAnalysisScope,
  ): Promise<IListingAnalysis | null>;
  requestAnalysisForMediaAsset(assetId: string): Promise<void>;
  getAnalysisForListing(
    listingId: string,
    actor: IActorContext,
  ): Promise<IListingAnalysis>;
  applyAnalysisToListing(listingId: string, analysisId: string): Promise<void>;
  applyAnalysisToVerificationCase(
    listingId: string,
    analysisId: string,
  ): Promise<void>;
  handleAnalyzedEvent(envelope: IEventEnvelope): Promise<void>;
}
