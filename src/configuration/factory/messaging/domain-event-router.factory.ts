import { DomainEventRouter } from '../../../domain/common/messaging/domain-event-router';
import { AiListingAnalyzedHandler } from '../../../domain/ai/messaging/handlers/ai-listing-analyzed.handler';
import { AiListingMediaProcessedHandler } from '../../../domain/ai/messaging/handlers/ai-listing-media-processed.handler';
import { AiListingSubmittedHandler } from '../../../domain/ai/messaging/handlers/ai-listing-submitted.handler';
import { AiListingUpdatedHandler } from '../../../domain/ai/messaging/handlers/ai-listing-updated.handler';
import { ListingsVerificationApprovedHandler } from '../../../domain/listings/messaging/handlers/listings-verification-approved.handler';
import { ListingsVerificationChangesRequestedHandler } from '../../../domain/listings/messaging/handlers/listings-verification-changes-requested.handler';
import { ListingsVerificationRejectedHandler } from '../../../domain/listings/messaging/handlers/listings-verification-rejected.handler';
import { MediaAssetUploadedHandler } from '../../../domain/media/messaging/handlers/media-asset-uploaded.handler';
import { SearchListingEventHandler } from '../../../domain/search/messaging/handlers/search-listing-event.handler';
import { TaxonomySynonymEventHandler } from '../../../domain/search/messaging/handlers/taxonomy-synonym-event.handler';
import { VerificationListingSubmittedHandler } from '../../../domain/verification/messaging/handlers/verification-listing-submitted.handler';
import { ListingAnalysisServiceFactory } from '../listing-analysis.service.factory';
import { ListingServiceFactory } from '../listing.service.factory';
import { MediaAssetServiceFactory } from '../media-asset.service.factory';
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
    const mediaAssetService = MediaAssetServiceFactory.create();
    const listingAnalysisService = ListingAnalysisServiceFactory.create();

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
    const listingsVerificationChangesRequestedHandler =
      new ListingsVerificationChangesRequestedHandler(listingService);
    const listingsVerificationRejectedHandler =
      new ListingsVerificationRejectedHandler(listingService);
    const mediaAssetUploadedHandler = new MediaAssetUploadedHandler(
      mediaAssetService,
    );
    const aiListingMediaProcessedHandler = new AiListingMediaProcessedHandler(
      listingAnalysisService,
    );
    const aiListingSubmittedHandler = new AiListingSubmittedHandler(
      listingAnalysisService,
    );
    const aiListingUpdatedHandler = new AiListingUpdatedHandler(
      listingAnalysisService,
    );
    const aiListingAnalyzedHandler = new AiListingAnalyzedHandler(
      listingAnalysisService,
    );

    return new DomainEventRouter({
      handlersByType: {
        'media.asset.uploaded': [mediaAssetUploadedHandler],
        'media.asset.processed': [aiListingMediaProcessedHandler],
        'listings.listing.status_changed': [
          searchListingHandler,
          verificationSubmittedHandler,
        ],
        'listings.listing.published': [searchListingHandler],
        'listings.listing.paused': [searchListingHandler],
        'listings.listing.submitted': [
          verificationSubmittedHandler,
          aiListingSubmittedHandler,
        ],
        'listings.listing.updated': [aiListingUpdatedHandler],
        'ai.listing.analyzed': [aiListingAnalyzedHandler],
        'catalog.category.created': [taxonomySynonymHandler],
        'catalog.category.updated': [taxonomySynonymHandler],
        'catalog.service.created': [taxonomySynonymHandler],
        'catalog.service.updated': [taxonomySynonymHandler],
        'verification.case.approved': [listingsVerificationApprovedHandler],
        'verification.case.changes_requested': [
          listingsVerificationChangesRequestedHandler,
        ],
        'verification.case.rejected': [listingsVerificationRejectedHandler],
        'verification.seal.granted': [searchListingHandler],
        'verification.seal.revoked': [searchListingHandler],
      },
    });
  }
}
