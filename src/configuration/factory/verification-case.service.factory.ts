import { VerificationCaseService } from '../../domain/verification/service/verification-case.service';
import { ListingRepositoryRead } from '../../infraestructure/repository/listings/listing.repository.read';
import { UserRepositoryRead } from '../../infraestructure/repository/identity/user.repository.read';
import { ProfileRepositoryRead } from '../../infraestructure/repository/identity/profile.repository.read';
import { EvidenceItemRepositoryRead } from '../../infraestructure/repository/verification/evidence-item.repository.read';
import { VerificationCaseRepositoryRead } from '../../infraestructure/repository/verification/verification-case.repository.read';
import { VerificationCaseRepositoryWrite } from '../../infraestructure/repository/verification/verification-case.repository.write';
import { EventPublisherFactory } from './messaging/event-publisher.factory';
import { PossessionProofCodeIssuerFactory } from './possession-proof-code-issuer.factory';
import { ProofCodeAnalysisServiceFactory } from './proof-code-analysis.service.factory';
import { SealServiceFactory } from './seal.service.factory';
import { ProofCodeAnalysisRepositoryRead } from '../../infraestructure/repository/ai/proof-code-analysis.repository.read';

export class VerificationCaseServiceFactory {
  static create() {
    const proofCodeAnalysisService = ProofCodeAnalysisServiceFactory.create();
    const proofCodeAnalysisRepositoryRead =
      new ProofCodeAnalysisRepositoryRead();

    return new VerificationCaseService({
      verificationCaseRepositoryRead: new VerificationCaseRepositoryRead(),
      verificationCaseRepositoryWrite: new VerificationCaseRepositoryWrite(),
      evidenceItemRepositoryRead: new EvidenceItemRepositoryRead(),
      listingRepositoryRead: new ListingRepositoryRead(),
      userRepositoryRead: new UserRepositoryRead(),
      profileRepositoryRead: new ProfileRepositoryRead(),
      sealService: SealServiceFactory.create(),
      eventPublisher: EventPublisherFactory.create(),
      proofCodeIssuer: PossessionProofCodeIssuerFactory.create(),
      proofCodeAnalysisEnqueue: {
        requestAnalysis: (caseId) =>
          proofCodeAnalysisService.requestAnalysis(caseId),
        findLatestStatus: async (caseId) => {
          const latest =
            await proofCodeAnalysisRepositoryRead.findLatestByCaseId(caseId);
          return latest?.status ?? null;
        },
      },
    });
  }
}
