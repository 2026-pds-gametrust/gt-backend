import { VerificationController } from '../../application/controllers/verification.controller';
import { IController } from '../../domain/server/interfaces/IController';
import { EvidenceItemServiceFactory } from './evidence-item.service.factory';
import { SealServiceFactory } from './seal.service.factory';
import { VerificationCaseServiceFactory } from './verification-case.service.factory';

export class VerificationControllerFactory {
  static create(): IController {
    return new VerificationController(
      VerificationCaseServiceFactory.create(),
      EvidenceItemServiceFactory.create(),
      SealServiceFactory.create(),
    );
  }
}
