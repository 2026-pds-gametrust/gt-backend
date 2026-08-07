import { IEventPublisher } from '../../common/messaging/event-publisher.interface';
import { IProductRepositoryRead } from '../../catalog/repository/product.repository.read';
import { IListingRepositoryRead } from '../../listings/repository/listing.repository.read';
import { ISellerLevelRepositoryRead } from '../../trust/repository/seller-level.repository.read';
import { ITrustScoreRepositoryRead } from '../../trust/repository/trust-score.repository.read';
import { ISealRepositoryRead } from '../../verification/repository/seal.repository.read';
import { ISearchEngine } from '../engine/search-engine.interface';
import { ISearchDocument } from '../entity/interfaces/search-document.interface';
import { TSearchFacetValue } from '../entity/interfaces/search-document.interface';
import { ISearchDocumentRepositoryRead } from '../repository/search-document.repository.read';
import { ISearchDocumentRepositoryWrite } from '../repository/search-document.repository.write';
import { IQueryLogService } from './query-log.service.interface';
import { ISynonymService } from './synonym.service.interface';

export interface IListingSearchSnapshot {
  listingId: string;
  productId: string;
  categoryId: string;
  sellerId: string;
  title: string;
  brand?: string;
  model?: string;
  condition: string;
  status: string;
  priceCents: number;
  listPriceCents?: number;
  currency: string;
  locationApprox?: string;
  shippingModes?: string[];
  freeShipping?: boolean;
  trustScore?: number;
  sellerLevel?: string;
  sealTypes?: string[];
  facets?: Record<string, TSearchFacetValue>;
  searchText: string;
  thumbnailUrl?: string;
  sourceOccurredAt: Date;
}

export interface IParamsSearch {
  q?: string;
  categoryId?: string;
  filters?: Record<string, TSearchFacetValue>;
  userId?: string;
}

export interface IParamsSearchDocumentService {
  searchDocumentRepositoryRead: ISearchDocumentRepositoryRead;
  searchDocumentRepositoryWrite: ISearchDocumentRepositoryWrite;
  listingRepositoryRead: IListingRepositoryRead;
  productRepositoryRead: IProductRepositoryRead;
  trustScoreRepositoryRead: ITrustScoreRepositoryRead;
  sellerLevelRepositoryRead: ISellerLevelRepositoryRead;
  sealRepositoryRead: ISealRepositoryRead;
  searchEngine: ISearchEngine;
  synonymService: ISynonymService;
  queryLogService: IQueryLogService;
  eventPublisher: IEventPublisher;
}

export interface ISearchDocumentService {
  upsertFromListingSnapshot(
    snapshot: IListingSearchSnapshot,
  ): Promise<ISearchDocument>;
  deleteOnUnpublish(listingId: string): Promise<void>;
  reindexListing(listingId: string): Promise<ISearchDocument | null>;
  search(params: IParamsSearch): Promise<ISearchDocument[]>;
}
