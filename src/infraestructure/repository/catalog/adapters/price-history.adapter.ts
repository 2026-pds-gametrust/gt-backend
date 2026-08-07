import { IPriceHistory } from '../../../../domain/catalog/entity/interfaces/price-history.interface';
import { IMPriceHistory } from '../../../db/mongo/models/price-history.model';

export function dbToInternal(doc: IMPriceHistory): IPriceHistory {
  return {
    id: doc.id,
    productId: doc.productId,
    priceCents: doc.priceCents,
    currency: doc.currency,
    source: doc.source,
    observedAt: doc.observedAt,
    createdAt: doc.createdAt,
  };
}

export function internalToDb(
  entry: IPriceHistory,
): Omit<IMPriceHistory, '_id' | 'createdAt'> {
  return {
    id: entry.id,
    productId: entry.productId,
    priceCents: entry.priceCents,
    currency: entry.currency,
    source: entry.source,
    observedAt: entry.observedAt,
  };
}
