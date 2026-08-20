import { Logger } from 'traceability';
import { IEventEnvelope } from '../../../common/messaging/event-envelope';
import { IEventHandler } from '../../../common/messaging/event-handler.interface';
import { EEvidenceType } from '../../../verification/entity/enums/EEvidenceType';
import { isMinProofEvidenceEligible } from '../../../verification/proof/proof-evidence-eligibility';
import { IEvidenceItemRepositoryRead } from '../../../verification/repository/evidence-item.repository.read';
import { IListingRepositoryRead } from '../../../listings/repository/listing.repository.read';
import { IVerificationCaseRepositoryRead } from '../../../verification/repository/verification-case.repository.read';
import { IProofCodeAnalysisService } from '../../service/proof-code-analysis.service.interface';

export interface IParamsProofCodeEvidenceAttachedHandler {
  proofCodeAnalysisService: IProofCodeAnalysisService;
  verificationCaseRepositoryRead: IVerificationCaseRepositoryRead;
  evidenceItemRepositoryRead: IEvidenceItemRepositoryRead;
  listingRepositoryRead: IListingRepositoryRead;
}

/**
 * After case evidence attach: enqueue possession AI when challenge + min evidence.
 * Fire-and-forget so HTTP addEvidence does not await the vision provider.
 */
export class ProofCodeEvidenceAttachedHandler implements IEventHandler {
  private readonly proofCodeAnalysisService: IProofCodeAnalysisService;
  private readonly verificationCaseRepositoryRead: IVerificationCaseRepositoryRead;
  private readonly evidenceItemRepositoryRead: IEvidenceItemRepositoryRead;
  private readonly listingRepositoryRead: IListingRepositoryRead;

  constructor(params: IParamsProofCodeEvidenceAttachedHandler) {
    this.proofCodeAnalysisService = params.proofCodeAnalysisService;
    this.verificationCaseRepositoryRead =
      params.verificationCaseRepositoryRead;
    this.evidenceItemRepositoryRead = params.evidenceItemRepositoryRead;
    this.listingRepositoryRead = params.listingRepositoryRead;
  }

  async handle(envelope: IEventEnvelope): Promise<void> {
    const caseId = String(
      envelope.payload?.caseId ?? envelope.aggregateId ?? '',
    ).trim();
    const evidenceType = String(envelope.payload?.type ?? '').trim();

    if (!caseId) {
      return;
    }

    if (
      evidenceType !== EEvidenceType.PHOTO &&
      evidenceType !== EEvidenceType.VIDEO
    ) {
      return;
    }

    const verificationCase =
      await this.verificationCaseRepositoryRead.findVerificationCaseById(
        caseId,
      );
    if (!verificationCase?.proofCodeHash) {
      return;
    }

    const listing = await this.listingRepositoryRead.findListingById(
      verificationCase.listingId,
    );
    if (!listing) {
      return;
    }

    const evidence =
      await this.evidenceItemRepositoryRead.listByCaseId(caseId);
    if (!isMinProofEvidenceEligible(evidence, listing)) {
      return;
    }

    void this.proofCodeAnalysisService
      .requestAnalysis(caseId)
      .catch((error: unknown) => {
        Logger.info('proofCodeAnalysis.evidence_attached enqueue failed', {
          eventName: 'proof_code_analysis_enqueue_failed',
          caseId,
          reason:
            error instanceof Error
              ? error.message.slice(0, 120)
              : 'enqueue_error',
        });
      });
  }
}
