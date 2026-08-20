import { IListing } from '../../../../domain/listings/entity/interfaces/listing.interface';
import { IMListing } from '../../../db/mongo/models/listing.model';

export function dbToInternal(doc: IMListing): IListing {
  return {
    id: doc.id,
    sellerId: doc.sellerId,
    productId: doc.productId,
    title: doc.title,
    description: doc.description,
    condition: doc.condition,
    priceCents: doc.priceCents,
    listPriceCents: doc.listPriceCents,
    currency: doc.currency,
    attributes: doc.attributes,
    media: doc.media,
    shipping: doc.shipping,
    locationApprox: doc.locationApprox,
    warranty: doc.warranty,
    acceptsOffers: doc.acceptsOffers,
    buyNowEnabled: doc.buyNowEnabled,
    quantity: doc.quantity,
    status: doc.status,
    reservedByOrderId: doc.reservedByOrderId,
    reservedAt: doc.reservedAt,
    reservationExpiresAt: doc.reservationExpiresAt,
    qualityHints: doc.qualityHints,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };
}

export function internalToDb(
  listing: IListing,
): Omit<IMListing, '_id' | 'createdAt' | 'updatedAt'> {
  return {
    id: listing.id,
    sellerId: listing.sellerId,
    productId: listing.productId,
    title: listing.title,
    description: listing.description,
    condition: listing.condition,
    priceCents: listing.priceCents,
    listPriceCents: listing.listPriceCents,
    currency: listing.currency,
    attributes: listing.attributes,
    media: listing.media,
    shipping: listing.shipping,
    locationApprox: listing.locationApprox,
    warranty: listing.warranty,
    acceptsOffers: listing.acceptsOffers,
    buyNowEnabled: listing.buyNowEnabled,
    quantity: listing.quantity,
    status: listing.status,
    reservedByOrderId: listing.reservedByOrderId,
    reservedAt: listing.reservedAt,
    reservationExpiresAt: listing.reservationExpiresAt,
    qualityHints: listing.qualityHints,
  };
}
