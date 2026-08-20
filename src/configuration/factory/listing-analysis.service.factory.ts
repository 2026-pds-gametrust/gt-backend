import {
  GEMINI_ANALYSIS_ENABLED,
  GEMINI_ANALYSIS_MAX_PHOTOS,
  GEMINI_ANALYSIS_MAX_VIDEO_BYTES,
  GEMINI_ANALYSIS_MODEL,
  GEMINI_ANALYSIS_TIMEOUT_MS,
  GEMINI_API_KEY,
} from '../env-constants/gemini.env';
import { ListingAnalysisService } from '../../domain/ai/service/listing-analysis.service';
import { GeminiListingAnalysisProvider } from '../../infraestructure/ai/gemini-listing-analysis.provider';
import { ListingAnalysisRepositoryRead } from '../../infraestructure/repository/ai/listing-analysis.repository.read';
import { ListingAnalysisRepositoryWrite } from '../../infraestructure/repository/ai/listing-analysis.repository.write';
import { ListingRepositoryRead } from '../../infraestructure/repository/listings/listing.repository.read';
import { ListingRepositoryWrite } from '../../infraestructure/repository/listings/listing.repository.write';
import { MediaAssetRepositoryRead } from '../../infraestructure/repository/media/media-asset.repository.read';
import { VerificationCaseRepositoryRead } from '../../infraestructure/repository/verification/verification-case.repository.read';
import { VerificationCaseRepositoryWrite } from '../../infraestructure/repository/verification/verification-case.repository.write';
import { EventPublisherFactory } from './messaging/event-publisher.factory';
import { ObjectStorageFactory } from './object-storage.factory';

export class ListingAnalysisServiceFactory {
  static create() {
    return new ListingAnalysisService({
      listingAnalysisRepositoryRead: new ListingAnalysisRepositoryRead(),
      listingAnalysisRepositoryWrite: new ListingAnalysisRepositoryWrite(),
      listingRepositoryRead: new ListingRepositoryRead(),
      listingRepositoryWrite: new ListingRepositoryWrite(),
      mediaAssetRepositoryRead: new MediaAssetRepositoryRead(),
      objectStorage: ObjectStorageFactory.create(),
      verificationCaseRepositoryRead: new VerificationCaseRepositoryRead(),
      verificationCaseRepositoryWrite: new VerificationCaseRepositoryWrite(),
      analysisProvider: new GeminiListingAnalysisProvider({
        apiKey: GEMINI_API_KEY,
        modelId: GEMINI_ANALYSIS_MODEL,
        timeoutMs: GEMINI_ANALYSIS_TIMEOUT_MS,
      }),
      eventPublisher: EventPublisherFactory.create(),
      analysisEnabled: GEMINI_ANALYSIS_ENABLED,
      maxPhotosToAnalyze: GEMINI_ANALYSIS_MAX_PHOTOS,
      maxVideoBytes: GEMINI_ANALYSIS_MAX_VIDEO_BYTES,
    });
  }
}
