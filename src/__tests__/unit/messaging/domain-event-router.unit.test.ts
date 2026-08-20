import { createEventEnvelope } from '../../../domain/common/messaging/event-envelope';
import { DomainEventRouter } from '../../../domain/common/messaging/domain-event-router';
import { DispatchingEventPublisher } from '../../../domain/common/messaging/dispatching-event-publisher';
import { SearchListingEventHandler } from '../../../domain/search/messaging/handlers/search-listing-event.handler';
import { ListingsVerificationApprovedHandler } from '../../../domain/listings/messaging/handlers/listings-verification-approved.handler';
import { EListingStatus } from '../../../domain/listings/entity/enums/EListingStatus';

describe('when DomainEventRouter receives listings.listing.status_changed PUBLISHED', () => {
  it('should reindex via SearchListingEventHandler', async () => {
    const searchDocumentService = {
      reindexListing: jest.fn().mockResolvedValue({}),
      deleteOnUnpublish: jest.fn().mockResolvedValue(undefined),
      upsertFromListingSnapshot: jest.fn(),
      search: jest.fn(),
    };
    const handler = new SearchListingEventHandler(searchDocumentService as never);
    const router = new DomainEventRouter({
      handlersByType: {
        'listings.listing.status_changed': [handler],
      },
    });

    await router.handle(
      createEventEnvelope({
        eventId: 'evt-1',
        eventType: 'listings.listing.status_changed',
        aggregateId: 'listing-1',
        producerModule: 'listings',
        correlationId: 'corr-1',
        payload: {
          listingId: 'listing-1',
          toStatus: EListingStatus.PUBLISHED,
        },
      }),
    );

    expect(searchDocumentService.reindexListing).toHaveBeenCalledWith(
      'listing-1',
    );
  });
});

describe('when DomainEventRouter receives verification.case.approved', () => {
  it('should call applyVerificationApproved without throwing', async () => {
    const listingService = {
      applyVerificationApproved: jest.fn().mockResolvedValue(undefined),
    };
    const handler = new ListingsVerificationApprovedHandler(
      listingService as never,
    );
    const router = new DomainEventRouter({
      handlersByType: {
        'verification.case.approved': [handler],
      },
    });

    await expect(
      router.handle(
        createEventEnvelope({
          eventId: 'evt-2',
          eventType: 'verification.case.approved',
          aggregateId: 'case-1',
          producerModule: 'verification',
          correlationId: 'corr-2',
          payload: { caseId: 'case-1', listingId: 'listing-1' },
        }),
      ),
    ).resolves.toBeUndefined();

    expect(listingService.applyVerificationApproved).toHaveBeenCalledTimes(1);
  });
});

describe('when DispatchingEventPublisher publishes with in-process dispatch', () => {
  it('should call transport then domain handler', async () => {
    const transport = { publish: jest.fn().mockResolvedValue(undefined) };
    const domainHandler = { handle: jest.fn().mockResolvedValue(undefined) };
    const publisher = new DispatchingEventPublisher({
      transport,
      getHandler: () => domainHandler,
      inProcessDispatch: true,
    });

    const envelope = createEventEnvelope({
      eventId: 'evt-3',
      eventType: 'catalog.category.created',
      aggregateId: 'cat-1',
      producerModule: 'catalog',
      correlationId: 'corr-3',
      payload: { categoryId: 'cat-1', name: 'GPUs' },
    });

    await publisher.publish(envelope);

    expect(transport.publish).toHaveBeenCalledWith(envelope);
    expect(domainHandler.handle).toHaveBeenCalledWith(envelope);
  });
});

describe('when DispatchingEventPublisher has in-process disabled', () => {
  it('should not call domain handler', async () => {
    const transport = { publish: jest.fn().mockResolvedValue(undefined) };
    const domainHandler = { handle: jest.fn().mockResolvedValue(undefined) };
    const publisher = new DispatchingEventPublisher({
      transport,
      getHandler: () => domainHandler,
      inProcessDispatch: false,
    });

    await publisher.publish(
      createEventEnvelope({
        eventId: 'evt-4',
        eventType: 'catalog.category.created',
        aggregateId: 'cat-2',
        producerModule: 'catalog',
        correlationId: 'corr-4',
        payload: {},
      }),
    );

    expect(transport.publish).toHaveBeenCalled();
    expect(domainHandler.handle).not.toHaveBeenCalled();
  });
});
