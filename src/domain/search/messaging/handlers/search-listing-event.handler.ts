import { IEventEnvelope } from '../../../common/messaging/event-envelope';
import { IEventHandler } from '../../../common/messaging/event-handler.interface';
import { EListingStatus } from '../../../listings/entity/enums/EListingStatus';
import { ISearchDocumentService } from '../../service/search-document.service.interface';

type TListingStatusPayload = {
  listingId?: string;
  toStatus?: string;
};

type TSealEventPayload = {
  listingId?: string;
  sealId?: string;
};

/**
 * Search projection for listing lifecycle events.
 */
export class SearchListingEventHandler implements IEventHandler {
  constructor(private readonly searchDocumentService: ISearchDocumentService) {}

  async handle(envelope: IEventEnvelope): Promise<void> {
    const payload = envelope.payload as TListingStatusPayload &
      TSealEventPayload;
    const listingId =
      payload.listingId ??
      (envelope.aggregateId ? String(envelope.aggregateId) : undefined);
    if (!listingId) {
      return;
    }

    if (
      envelope.eventType === 'verification.seal.granted' ||
      envelope.eventType === 'verification.seal.revoked'
    ) {
      await this.searchDocumentService.reindexListing(listingId);
      return;
    }

    if (envelope.eventType === 'listings.listing.published') {
      await this.searchDocumentService.reindexListing(listingId);
      return;
    }

    if (envelope.eventType === 'listings.listing.paused') {
      await this.searchDocumentService.deleteOnUnpublish(listingId);
      return;
    }

    if (envelope.eventType === 'listings.listing.status_changed') {
      const toStatus = payload.toStatus;
      if (toStatus === EListingStatus.PUBLISHED) {
        await this.searchDocumentService.reindexListing(listingId);
        return;
      }
      if (toStatus === EListingStatus.PAUSED) {
        await this.searchDocumentService.deleteOnUnpublish(listingId);
      }
    }
  }
}
