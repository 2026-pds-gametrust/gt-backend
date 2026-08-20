import { IOrder } from '../../../../domain/orders/entity/interfaces/order.interface';
import { IMOrder } from '../../../db/mongo/models/order.model';

export function dbToInternal(doc: IMOrder): IOrder {
  return {
    id: doc.id,
    listingId: doc.listingId,
    buyerId: doc.buyerId,
    sellerId: doc.sellerId,
    shippingMode: doc.shippingMode,
    priceCents: doc.priceCents,
    currency: doc.currency,
    status: doc.status,
    reservationExpiresAt: doc.reservationExpiresAt,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };
}

export function internalToDb(order: IOrder): Partial<IMOrder> {
  return {
    id: order.id,
    listingId: order.listingId,
    buyerId: order.buyerId,
    sellerId: order.sellerId,
    shippingMode: order.shippingMode,
    priceCents: order.priceCents,
    currency: order.currency,
    status: order.status,
    reservationExpiresAt: order.reservationExpiresAt,
    createdAt: order.createdAt,
    updatedAt: order.updatedAt,
  };
}
