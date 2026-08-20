import { IEventEnvelope } from '../../../common/messaging/event-envelope';
import { IEventHandler } from '../../../common/messaging/event-handler.interface';
import { IListingService } from '../../service/listing.service.interface';

/**
 * Routes verification.case.rejected to ListingService.applyVerificationRejected (terminal listing).
 */
export class ListingsVerificationRejectedHandler implements IEventHandler {
  constructor(private readonly listingService: IListingService) {}

  async handle(envelope: IEventEnvelope): Promise<void> {
    await this.listingService.applyVerificationRejected(envelope);
  }
}
