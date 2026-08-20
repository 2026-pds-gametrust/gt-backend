import { randomUUID } from 'crypto';
import { createEventEnvelope } from '../../common/messaging/event-envelope';
import { isBlank } from '../../common/types/required-string';
import { EListingStatus } from '../../listings/entity/enums/EListingStatus';
import { ESealStatus } from '../../verification/entity/enums/ESealStatus';
import { SearchDocumentServiceEntity } from '../entity/search-document.entity';
import { ISearchDocument } from '../entity/interfaces/search-document.interface';
import {
  IListingSearchSnapshot,
  IParamsSearch,
  IParamsSearchDocumentService,
  ISearchDocumentService,
} from './search-document.service.interface';

export class SearchDocumentService implements ISearchDocumentService {
  private readonly searchDocumentRepositoryRead: IParamsSearchDocumentService['searchDocumentRepositoryRead'];
  private readonly searchDocumentRepositoryWrite: IParamsSearchDocumentService['searchDocumentRepositoryWrite'];
  private readonly listingRepositoryRead: IParamsSearchDocumentService['listingRepositoryRead'];
  private readonly productRepositoryRead: IParamsSearchDocumentService['productRepositoryRead'];
  private readonly trustScoreRepositoryRead: IParamsSearchDocumentService['trustScoreRepositoryRead'];
  private readonly sellerLevelRepositoryRead: IParamsSearchDocumentService['sellerLevelRepositoryRead'];
  private readonly sealRepositoryRead: IParamsSearchDocumentService['sealRepositoryRead'];
  private readonly searchEngine: IParamsSearchDocumentService['searchEngine'];
  private readonly synonymService: IParamsSearchDocumentService['synonymService'];
  private readonly queryLogService: IParamsSearchDocumentService['queryLogService'];
  private readonly eventPublisher: IParamsSearchDocumentService['eventPublisher'];

  constructor(params: IParamsSearchDocumentService) {
    this.searchDocumentRepositoryRead = params.searchDocumentRepositoryRead;
    this.searchDocumentRepositoryWrite = params.searchDocumentRepositoryWrite;
    this.listingRepositoryRead = params.listingRepositoryRead;
    this.productRepositoryRead = params.productRepositoryRead;
    this.trustScoreRepositoryRead = params.trustScoreRepositoryRead;
    this.sellerLevelRepositoryRead = params.sellerLevelRepositoryRead;
    this.sealRepositoryRead = params.sealRepositoryRead;
    this.searchEngine = params.searchEngine;
    this.synonymService = params.synonymService;
    this.queryLogService = params.queryLogService;
    this.eventPublisher = params.eventPublisher;
  }

  async upsertFromListingSnapshot(
    snapshot: IListingSearchSnapshot,
  ): Promise<ISearchDocument> {
    const existing =
      await this.searchDocumentRepositoryRead.findByListingId(
        snapshot.listingId,
      );

    if (
      existing &&
      existing.sourceOccurredAt.getTime() >=
        snapshot.sourceOccurredAt.getTime()
    ) {
      return existing;
    }

    const entity = new SearchDocumentServiceEntity({
      id: existing?.id ?? snapshot.listingId,
      listingId: snapshot.listingId,
      productId: snapshot.productId,
      categoryId: snapshot.categoryId,
      sellerId: snapshot.sellerId,
      title: snapshot.title,
      brand: snapshot.brand,
      model: snapshot.model,
      condition: snapshot.condition,
      status: snapshot.status,
      priceCents: snapshot.priceCents,
      listPriceCents: snapshot.listPriceCents,
      currency: snapshot.currency,
      locationApprox: snapshot.locationApprox,
      shippingModes: snapshot.shippingModes,
      freeShipping: snapshot.freeShipping,
      trustScore: snapshot.trustScore,
      sellerLevel: snapshot.sellerLevel,
      sealTypes: snapshot.sealTypes,
      facets: snapshot.facets,
      searchText: snapshot.searchText,
      thumbnailUrl: snapshot.thumbnailUrl,
      embedding: null,
      sourceOccurredAt: snapshot.sourceOccurredAt,
      updatedAt: new Date(),
    });

    return this.searchDocumentRepositoryWrite.upsertSearchDocument(entity);
  }

  async deleteOnUnpublish(listingId: string): Promise<void> {
    await this.searchDocumentRepositoryWrite.deleteByListingId(listingId);
  }

  async reindexListing(listingId: string): Promise<ISearchDocument | null> {
    const listing =
      await this.listingRepositoryRead.findListingById(listingId);
    if (!listing) {
      return null;
    }

    if (listing.status !== EListingStatus.PUBLISHED) {
      await this.deleteOnUnpublish(listingId);
      return null;
    }

    const product = await this.productRepositoryRead.findProductById(
      listing.productId,
    );
    if (!product) {
      return null;
    }

    const [trustScore, sellerLevel, seals] = await Promise.all([
      this.trustScoreRepositoryRead.findTrustScoreBySellerId(listing.sellerId),
      this.sellerLevelRepositoryRead.findSellerLevelBySellerId(
        listing.sellerId,
      ),
      this.sealRepositoryRead.listSealsByListingId(listingId),
    ]);

    const sealTypes = seals
      .filter((seal) => seal.status === ESealStatus.GRANTED)
      .map((seal) => seal.type);

    if (sealTypes.length === 0) {
      await this.deleteOnUnpublish(listingId);
      return null;
    }

    const facets: IListingSearchSnapshot['facets'] = {
      ...(product.specs ?? {}),
      ...(listing.attributes ?? {}),
    };
    if (product.brand) {
      facets.brand = product.brand;
    }

    const searchText = [
      listing.title,
      product.brand,
      product.model,
      product.series,
      ...Object.values(facets).map(String),
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase();

    return this.upsertFromListingSnapshot({
      listingId: listing.id,
      productId: listing.productId,
      categoryId: product.categoryId,
      sellerId: listing.sellerId,
      title: listing.title,
      brand: product.brand,
      model: product.model,
      condition: listing.condition,
      status: listing.status,
      priceCents: listing.priceCents,
      listPriceCents: listing.listPriceCents,
      currency: listing.currency,
      locationApprox: listing.locationApprox,
      shippingModes: listing.shipping?.modes,
      freeShipping: listing.shipping?.freeShipping,
      trustScore: trustScore?.score,
      sellerLevel: sellerLevel?.level,
      sealTypes,
      facets,
      searchText,
      thumbnailUrl:
        listing.media?.coverPhotoUrl ?? listing.media?.photoUrls?.[0],
      sourceOccurredAt: listing.updatedAt ?? listing.createdAt ?? new Date(),
    });
  }

  async search(params: IParamsSearch): Promise<ISearchDocument[]> {
    const expandedQuery = await this.expandQueryWithSynonyms(params.q);

    const results = await this.searchEngine.search({
      q: expandedQuery,
      categoryId: params.categoryId,
      filters: params.filters,
      status: EListingStatus.PUBLISHED,
    });

    await this.queryLogService.appendQueryLog({
      query: params.q ?? '',
      filters: {
        categoryId: params.categoryId,
        ...(params.filters ?? {}),
      },
      resultCount: results.length,
      actorId: params.userId,
    });

    if (results.length === 0) {
      await this.eventPublisher.publish(
        createEventEnvelope({
          eventId: randomUUID(),
          eventType: 'search.zero-result.recorded',
          aggregateId: randomUUID(),
          producerModule: 'search',
          correlationId: randomUUID(),
          payload: {
            query: params.q ?? '',
            categoryId: params.categoryId,
            filters: params.filters ?? {},
          },
        }),
      );
    }

    return results;
  }

  private async expandQueryWithSynonyms(
    q?: string,
  ): Promise<string | undefined> {
    if (isBlank(q)) {
      return q;
    }

    const original = q.trim();
    const synonyms = await this.synonymService.listSynonyms(original);
    if (synonyms.length === 0) {
      return original;
    }

    const extras = new Set<string>();
    for (const synonym of synonyms) {
      if (!isBlank(synonym.canonicalName)) {
        extras.add(synonym.canonicalName.trim());
      }
      if (!isBlank(synonym.normalizedTerm)) {
        extras.add(synonym.normalizedTerm.trim());
      }
    }

    const appended = [...extras].filter(
      (term) => term.toLowerCase() !== original.toLowerCase(),
    );
    if (appended.length === 0) {
      return original;
    }

    return [original, ...appended].join(' ');
  }
}
