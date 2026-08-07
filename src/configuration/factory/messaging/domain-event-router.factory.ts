import { DomainEventRouter } from '../../../domain/common/messaging/domain-event-router';
import { ListingsVerificationApprovedHandler } from '../../../domain/listings/messaging/handlers/listings-verification-approved.handler';
import { SearchListingEventHandler } from '../../../domain/search/messaging/handlers/search-listing-event.handler';
import { TaxonomySynonymEventHandler } from '../../../domain/search/messaging/handlers/taxonomy-synonym-event.handler';
import { VerificationListingSubmittedHandler } from '../../../domain/verification/messaging/handlers/verification-listing-submitted.handler';
import { ListingServiceFactory } from '../listing.service.factory';
import { SearchDocumentServiceFactory } from '../search-document.service.factory';
import { SynonymServiceFactory } from '../synonym.service.factory';
import { VerificationCaseServiceFactory } from '../verification-case.service.factory';

/**
 * Builds DomainEventRouter with handlers after services exist.
 * Called lazily from EventPublisherFactory to avoid circular init.
 */
export class DomainEventRouterFactory {
  static create(): DomainEventRouter {
    const searchDocumentService = SearchDocumentServiceFactory.create();
    const synonymService = SynonymServiceFactory.create();
    const verificationCaseService = VerificationCaseServiceFactory.create();
    const listingService = ListingServiceFactory.create();

    const searchListingHandler = new SearchListingEventHandler(
      searchDocumentService,
    );
    const taxonomySynonymHandler = new TaxonomySynonymEventHandler(
      synonymService,
    );
    const verificationSubmittedHandler =
      new VerificationListingSubmittedHandler(verificationCaseService);
    const listingsVerificationApprovedHandler =
      new ListingsVerificationApprovedHandler(listingService);

    return new DomainEventRouter({
      handlersByType: {
        'listings.listing.status_changed': [
          searchListingHandler,
          verificationSubmittedHandler,
        ],
        'listings.listing.published': [searchListingHandler],
        'listings.listing.paused': [searchListingHandler],
        'listings.listing.submitted': [verificationSubmittedHandler],
        'catalog.category.created': [taxonomySynonymHandler],
        'catalog.category.updated': [taxonomySynonymHandler],
        'catalog.service.created': [taxonomySynonymHandler],
        'catalog.service.updated': [taxonomySynonymHandler],
        'verification.case.approved': [listingsVerificationApprovedHandler],
      },
    });
  }
}
