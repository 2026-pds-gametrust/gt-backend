import { IEventEnvelope } from '../../../common/messaging/event-envelope';
import { IEventHandler } from '../../../common/messaging/event-handler.interface';
import { EListingStatus } from '../../../listings/entity/enums/EListingStatus';
import { IVerificationCaseService } from '../../service/verification-case.service.interface';

type TListingSubmittedPayload = {
  listingId?: string;
  toStatus?: string;
};

/**
 * Opens a verification case when a listing is submitted (idempotent).
 */
export class VerificationListingSubmittedHandler implements IEventHandler {
  constructor(
    private readonly verificationCaseService: IVerificationCaseService,
  ) {}

  async handle(envelope: IEventEnvelope): Promise<void> {
    const payload = envelope.payload as TListingSubmittedPayload;
    const listingId =
      payload.listingId ??
      (envelope.aggregateId ? String(envelope.aggregateId) : undefined);
    if (!listingId) {
      return;
    }

    if (envelope.eventType === 'listings.listing.submitted') {
      await this.verificationCaseService.ensureOpenCaseForListing(listingId);
      return;
    }

    if (
      envelope.eventType === 'listings.listing.status_changed' &&
      payload.toStatus === EListingStatus.SUBMITTED
    ) {
      await this.verificationCaseService.ensureOpenCaseForListing(listingId);
    }
  }
}
