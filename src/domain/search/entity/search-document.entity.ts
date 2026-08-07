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
    if (!doc.id?.trim()) throw new Error('id is required');
    if (!doc.listingId?.trim()) throw new Error('listingId is required');
    if (!doc.productId?.trim()) throw new Error('productId is required');
    if (!doc.categoryId?.trim()) throw new Error('categoryId is required');
    if (!doc.sellerId?.trim()) throw new Error('sellerId is required');
    if (!doc.title?.trim()) throw new Error('title is required');
    if (!doc.condition?.trim()) throw new Error('condition is required');
    if (!doc.status?.trim()) throw new Error('status is required');
    if (doc.priceCents == null || doc.priceCents < 0) {
      throw new Error('priceCents must be >= 0');
    }
    if (!doc.currency?.trim()) throw new Error('currency is required');
    if (!doc.searchText?.trim()) throw new Error('searchText is required');
    if (!doc.sourceOccurredAt) throw new Error('sourceOccurredAt is required');
  }
}
