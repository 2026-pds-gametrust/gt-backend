import { ISearchDocument } from '../../../../domain/search/entity/interfaces/search-document.interface';
import { IMSearchDocument } from '../../../db/mongo/models/search-document.model';

export function dbToInternal(doc: IMSearchDocument): ISearchDocument {
  return {
    id: doc.id,
    listingId: doc.listingId,
    productId: doc.productId,
    categoryId: doc.categoryId,
    sellerId: doc.sellerId,
    title: doc.title,
    brand: doc.brand ?? undefined,
    model: doc.model ?? undefined,
    condition: doc.condition,
    status: doc.status,
    priceCents: doc.priceCents,
    listPriceCents: doc.listPriceCents ?? undefined,
    currency: doc.currency,
    locationApprox: doc.locationApprox ?? undefined,
    shippingModes: doc.shippingModes ?? undefined,
    freeShipping: doc.freeShipping ?? undefined,
    trustScore: doc.trustScore ?? undefined,
    sellerLevel: doc.sellerLevel ?? undefined,
    sealTypes: doc.sealTypes ?? undefined,
    facets: doc.facets ?? undefined,
    searchText: doc.searchText,
    thumbnailUrl: doc.thumbnailUrl ?? undefined,
    embedding: doc.embedding ?? null,
    sourceOccurredAt: doc.sourceOccurredAt,
    updatedAt: doc.updatedAt ?? undefined,
  };
}

export function internalToDb(
  doc: ISearchDocument,
): Omit<IMSearchDocument, '_id' | 'updatedAt'> {
  return {
    id: doc.id,
    listingId: doc.listingId,
    productId: doc.productId,
    categoryId: doc.categoryId,
    sellerId: doc.sellerId,
    title: doc.title,
    brand: doc.brand,
    model: doc.model,
    condition: doc.condition,
    status: doc.status,
    priceCents: doc.priceCents,
    listPriceCents: doc.listPriceCents,
    currency: doc.currency,
    locationApprox: doc.locationApprox,
    shippingModes: doc.shippingModes,
    freeShipping: doc.freeShipping,
    trustScore: doc.trustScore,
    sellerLevel: doc.sellerLevel,
    sealTypes: doc.sealTypes,
    facets: doc.facets,
    searchText: doc.searchText,
    thumbnailUrl: doc.thumbnailUrl,
    embedding: doc.embedding ?? null,
    sourceOccurredAt: doc.sourceOccurredAt,
  };
}
