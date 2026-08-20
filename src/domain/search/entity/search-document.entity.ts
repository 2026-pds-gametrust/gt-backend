import { requireNonEmptyString } from '../../common/types/required-string';
import {
  ISearchDocument,
  TSearchFacetValue,
} from './interfaces/search-document.interface';

export class SearchDocumentServiceEntity implements ISearchDocument {
  id: string;
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
  embedding?: number[] | null;
  sourceOccurredAt: Date;
  updatedAt?: Date;

  constructor(doc: ISearchDocument) {
    this.validate(doc);
    this.id = doc.id;
    this.listingId = doc.listingId;
    this.productId = doc.productId;
    this.categoryId = doc.categoryId;
    this.sellerId = doc.sellerId;
    this.title = doc.title.trim();
    this.brand = doc.brand;
    this.model = doc.model;
    this.condition = doc.condition;
    this.status = doc.status;
    this.priceCents = doc.priceCents;
    this.listPriceCents = doc.listPriceCents;
    this.currency = doc.currency;
    this.locationApprox = doc.locationApprox;
    this.shippingModes = doc.shippingModes;
    this.freeShipping = doc.freeShipping;
    this.trustScore = doc.trustScore;
    this.sellerLevel = doc.sellerLevel;
    this.sealTypes = doc.sealTypes;
    this.facets = doc.facets;
    this.searchText = doc.searchText.trim();
    this.thumbnailUrl = doc.thumbnailUrl;
    this.embedding = doc.embedding ?? null;
    this.sourceOccurredAt = doc.sourceOccurredAt;
    this.updatedAt = doc.updatedAt;
  }

  private validate(doc: ISearchDocument): void {
    requireNonEmptyString(doc.id, 'id');
    requireNonEmptyString(doc.listingId, 'listingId');
    requireNonEmptyString(doc.productId, 'productId');
    requireNonEmptyString(doc.categoryId, 'categoryId');
    requireNonEmptyString(doc.sellerId, 'sellerId');
    requireNonEmptyString(doc.title, 'title');
    requireNonEmptyString(doc.condition, 'condition');
    requireNonEmptyString(doc.status, 'status');
    if (doc.priceCents == null || doc.priceCents < 0) {
      throw new Error('priceCents must be >= 0');
    }
    requireNonEmptyString(doc.currency, 'currency');
    requireNonEmptyString(doc.searchText, 'searchText');
    if (!doc.sourceOccurredAt) throw new Error('sourceOccurredAt is required');
  }
}
