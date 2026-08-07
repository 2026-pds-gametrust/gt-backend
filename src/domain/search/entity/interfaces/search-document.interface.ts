export type TSearchFacetValue = string | number | boolean;

export interface ISearchDocument {
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
}
