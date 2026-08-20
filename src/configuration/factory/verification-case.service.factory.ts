import { VerificationCaseService } from '../../domain/verification/service/verification-case.service';
import { ListingRepositoryRead } from '../../infraestructure/repository/listings/listing.repository.read';
import { UserRepositoryRead } from '../../infraestructure/repository/identity/user.repository.read';
import { ProfileRepositoryRead } from '../../infraestructure/repository/identity/profile.repository.read';
import { VerificationCaseRepositoryRead } from '../../infraestructure/repository/verification/verification-case.repository.read';
import { VerificationCaseRepositoryWrite } from '../../infraestructure/repository/verification/verification-case.repository.write';
import { EventPublisherFactory } from './messaging/event-publisher.factory';
import { SealServiceFactory } from './seal.service.factory';

export class VerificationCaseServiceFactory {
  static create() {
    return new VerificationCaseService({
      verificationCaseRepositoryRead: new VerificationCaseRepositoryRead(),
      verificationCaseRepositoryWrite: new VerificationCaseRepositoryWrite(),
      listingRepositoryRead: new ListingRepositoryRead(),
      userRepositoryRead: new UserRepositoryRead(),
      profileRepositoryRead: new ProfileRepositoryRead(),
      sealService: SealServiceFactory.create(),
      eventPublisher: EventPublisherFactory.create(),
    });
  }
}
