import { requireNonEmptyString } from '../../common/types/required-string';
import { ESellerLevel } from './enums/ESellerLevel';
import { ISellerLevel } from './interfaces/seller-level.interface';

export class SellerLevelServiceEntity implements ISellerLevel {
  id: string;
  sellerId: string;
  level: ESellerLevel;
  updatedAt?: Date;

  constructor(sellerLevel: ISellerLevel) {
    this.validate(sellerLevel);
    this.id = sellerLevel.id;
    this.sellerId = sellerLevel.sellerId.trim();
    this.level = sellerLevel.level;
    this.updatedAt = sellerLevel.updatedAt;
  }

  private validate(sellerLevel: ISellerLevel): void {
    requireNonEmptyString(sellerLevel.id, 'id');
    requireNonEmptyString(sellerLevel.sellerId, 'sellerId');
    if (!sellerLevel.level) {
      throw new Error('level is required');
    }
  }
}
