import { ISellerLevel } from '../../../../domain/trust/entity/interfaces/seller-level.interface';
import { IMSellerLevel } from '../../../db/mongo/models/seller-level.model';

export function dbToInternal(doc: IMSellerLevel): ISellerLevel {
  return {
    id: doc.id,
    sellerId: doc.sellerId,
    level: doc.level,
    updatedAt: doc.updatedAt,
  };
}

export function internalToDb(
  sellerLevel: ISellerLevel,
): Omit<IMSellerLevel, '_id' | 'updatedAt'> {
  return {
    id: sellerLevel.id,
    sellerId: sellerLevel.sellerId,
    level: sellerLevel.level,
  };
}
