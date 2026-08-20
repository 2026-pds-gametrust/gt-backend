import { ESynonymTargetType } from '../../../domain/search/entity/enums/ESynonymTargetType';
import { TaxonomySynonymEventHandler } from '../../../domain/search/messaging/handlers/taxonomy-synonym-event.handler';
import { SearchListingEventHandler } from '../../../domain/search/messaging/handlers/search-listing-event.handler';
import { VerificationListingSubmittedHandler } from '../../../domain/verification/messaging/handlers/verification-listing-submitted.handler';
import { EListingStatus } from '../../../domain/listings/entity/enums/EListingStatus';
import { createEventEnvelope } from '../../../domain/common/messaging/event-envelope';

function envelope(
  eventType: string,
  payload: Record<string, unknown>,
  aggregateId = 'agg-1',
) {
  return createEventEnvelope({
    eventId: 'e1',
    eventType,
    aggregateId,
    producerModule: 'test',
    correlationId: 'c1',
    payload,
  });
}

describe('when taxonomy synonym handler receives events', () => {
  it('should skip when name is missing', async () => {
    const upsertFromTaxonomy = jest.fn();
    const handler = new TaxonomySynonymEventHandler({
      upsertFromTaxonomy,
    } as never);

    await handler.handle(envelope('catalog.category.created', {}));
    expect(upsertFromTaxonomy).not.toHaveBeenCalled();
  });

  it('should project category synonyms including empty synonyms default', async () => {
    const upsertFromTaxonomy = jest.fn().mockResolvedValue(undefined);
    const handler = new TaxonomySynonymEventHandler({
      upsertFromTaxonomy,
    } as never);

    await handler.handle(
      envelope('catalog.category.created', {
        categoryId: 'cat-1',
        name: 'GPUs',
      }),
    );

    expect(upsertFromTaxonomy).toHaveBeenCalledWith(
      'GPUs',
      ESynonymTargetType.CATEGORY,
      'cat-1',
      'GPUs',
    );
  });

  it('should project service synonyms using serviceId and synonym list', async () => {
    const upsertFromTaxonomy = jest.fn().mockResolvedValue(undefined);
    const handler = new TaxonomySynonymEventHandler({
      upsertFromTaxonomy,
    } as never);

    await handler.handle(
      envelope('catalog.service.created', {
        serviceId: 'svc-1',
        name: 'Boost',
        synonyms: ['elo'],
      }),
    );

    expect(upsertFromTaxonomy).toHaveBeenCalledTimes(2);
    expect(upsertFromTaxonomy).toHaveBeenCalledWith(
      'elo',
      ESynonymTargetType.SERVICE,
      'svc-1',
      'Boost',
    );
  });

  it('should fall back to aggregateId when owner ids are missing', async () => {
    const upsertFromTaxonomy = jest.fn().mockResolvedValue(undefined);
    const handler = new TaxonomySynonymEventHandler({
      upsertFromTaxonomy,
    } as never);

    await handler.handle(
      envelope(
        'catalog.service.updated',
        { name: 'Coaching' },
        'agg-service',
      ),
    );

    expect(upsertFromTaxonomy).toHaveBeenCalledWith(
      'Coaching',
      ESynonymTargetType.SERVICE,
      'agg-service',
      'Coaching',
    );
  });

  it('should skip when owner id resolves to empty', async () => {
    const upsertFromTaxonomy = jest.fn();
    const handler = new TaxonomySynonymEventHandler({
      upsertFromTaxonomy,
    } as never);

    await handler.handle(
      envelope('catalog.service.created', { name: 'X' }, ''),
    );
    expect(upsertFromTaxonomy).not.toHaveBeenCalled();
  });
});

describe('when search listing event handler receives events', () => {
  it('should skip when listing id cannot be resolved', async () => {
    const reindexListing = jest.fn();
    const handler = new SearchListingEventHandler({
      reindexListing,
      deleteOnUnpublish: jest.fn(),
    } as never);

    await handler.handle(
      envelope('listings.listing.published', {}, ''),
    );
    expect(reindexListing).not.toHaveBeenCalled();
  });

  it('should use aggregateId when payload listingId is missing', async () => {
    const reindexListing = jest.fn().mockResolvedValue(null);
    const handler = new SearchListingEventHandler({
      reindexListing,
      deleteOnUnpublish: jest.fn(),
    } as never);

    await handler.handle(
      envelope('listings.listing.published', {}, 'listing-from-agg'),
    );
    expect(reindexListing).toHaveBeenCalledWith('listing-from-agg');
  });

  it('should delete on paused and reindex on status_changed published', async () => {
    const reindexListing = jest.fn().mockResolvedValue(null);
    const deleteOnUnpublish = jest.fn().mockResolvedValue(undefined);
    const handler = new SearchListingEventHandler({
      reindexListing,
      deleteOnUnpublish,
    } as never);

    await handler.handle(
      envelope('listings.listing.paused', { listingId: 'l1' }),
    );
    expect(deleteOnUnpublish).toHaveBeenCalledWith('l1');

    await handler.handle(
      envelope('listings.listing.status_changed', {
        listingId: 'l2',
        toStatus: EListingStatus.PUBLISHED,
      }),
    );
    expect(reindexListing).toHaveBeenCalledWith('l2');

    await handler.handle(
      envelope('listings.listing.status_changed', {
        listingId: 'l3',
        toStatus: EListingStatus.PAUSED,
      }),
    );
    expect(deleteOnUnpublish).toHaveBeenCalledWith('l3');
  });
});

describe('when verification listing submitted handler receives events', () => {
  it('should skip when listing id cannot be resolved', async () => {
    const ensureOpenCaseForListing = jest.fn();
    const handler = new VerificationListingSubmittedHandler({
      ensureOpenCaseForListing,
    } as never);

    await handler.handle(envelope('listings.listing.submitted', {}, ''));
    expect(ensureOpenCaseForListing).not.toHaveBeenCalled();
  });

  it('should ensure case on submitted and on status_changed to SUBMITTED', async () => {
    const ensureOpenCaseForListing = jest.fn().mockResolvedValue({});
    const handler = new VerificationListingSubmittedHandler({
      ensureOpenCaseForListing,
    } as never);

    await handler.handle(
      envelope('listings.listing.submitted', {}, 'from-agg'),
    );
    expect(ensureOpenCaseForListing).toHaveBeenCalledWith('from-agg');

    await handler.handle(
      envelope('listings.listing.status_changed', {
        listingId: 'l9',
        toStatus: EListingStatus.SUBMITTED,
      }),
    );
    expect(ensureOpenCaseForListing).toHaveBeenCalledWith('l9');
  });
});
