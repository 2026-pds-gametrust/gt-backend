import {
  GEMINI_API_KEY,
  GEMINI_ANALYSIS_MODEL,
  GEMINI_ANALYSIS_TIMEOUT_MS,
  GEMINI_PROOF_CODE_ANALYSIS_ENABLED,
  GEMINI_PROOF_CODE_ANALYSIS_MAX_PHOTOS,
  GEMINI_PROOF_CODE_ANALYSIS_MAX_VIDEO_BYTES,
} from '../env-constants/gemini.env';
import { ProofCodeAnalysisService } from '../../domain/ai/service/proof-code-analysis.service';
import { GeminiProofCodeAnalysisProvider } from '../../infraestructure/ai/gemini-proof-code-analysis.provider';
import { ProofCodeAnalysisRepositoryRead } from '../../infraestructure/repository/ai/proof-code-analysis.repository.read';
import { ProofCodeAnalysisRepositoryWrite } from '../../infraestructure/repository/ai/proof-code-analysis.repository.write';
import { ListingRepositoryRead } from '../../infraestructure/repository/listings/listing.repository.read';
import { MediaAssetRepositoryRead } from '../../infraestructure/repository/media/media-asset.repository.read';
import { EvidenceItemRepositoryRead } from '../../infraestructure/repository/verification/evidence-item.repository.read';
import { VerificationCaseRepositoryRead } from '../../infraestructure/repository/verification/verification-case.repository.read';
import { VerificationCaseRepositoryWrite } from '../../infraestructure/repository/verification/verification-case.repository.write';
import { EventPublisherFactory } from './messaging/event-publisher.factory';
import { ObjectStorageFactory } from './object-storage.factory';

export class ProofCodeAnalysisServiceFactory {
  static create() {
    return new ProofCodeAnalysisService({
      proofCodeAnalysisRepositoryRead: new ProofCodeAnalysisRepositoryRead(),
      proofCodeAnalysisRepositoryWrite: new ProofCodeAnalysisRepositoryWrite(),
      verificationCaseRepositoryRead: new VerificationCaseRepositoryRead(),
      verificationCaseRepositoryWrite: new VerificationCaseRepositoryWrite(),
      evidenceItemRepositoryRead: new EvidenceItemRepositoryRead(),
      listingRepositoryRead: new ListingRepositoryRead(),
      mediaAssetRepositoryRead: new MediaAssetRepositoryRead(),
      objectStorage: ObjectStorageFactory.create(),
      analysisProvider: new GeminiProofCodeAnalysisProvider({
        apiKey: GEMINI_API_KEY,
        modelId: GEMINI_ANALYSIS_MODEL,
        timeoutMs: GEMINI_ANALYSIS_TIMEOUT_MS,
      }),
      eventPublisher: EventPublisherFactory.create(),
      analysisEnabled: GEMINI_PROOF_CODE_ANALYSIS_ENABLED,
      maxPhotosToAnalyze: GEMINI_PROOF_CODE_ANALYSIS_MAX_PHOTOS,
      maxVideoBytes: GEMINI_PROOF_CODE_ANALYSIS_MAX_VIDEO_BYTES,
    });
  }
}
