import { EvidenceItemService } from '../../domain/verification/service/evidence-item.service';
import { EvidenceItemRepositoryRead } from '../../infraestructure/repository/verification/evidence-item.repository.read';
import { EvidenceItemRepositoryWrite } from '../../infraestructure/repository/verification/evidence-item.repository.write';
import { VerificationCaseRepositoryRead } from '../../infraestructure/repository/verification/verification-case.repository.read';

export class EvidenceItemServiceFactory {
  static create() {
    return new EvidenceItemService({
      evidenceItemRepositoryRead: new EvidenceItemRepositoryRead(),
      evidenceItemRepositoryWrite: new EvidenceItemRepositoryWrite(),
      verificationCaseRepositoryRead: new VerificationCaseRepositoryRead(),
    });
  }
}
