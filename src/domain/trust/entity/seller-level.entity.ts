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
    if (!sellerLevel.id?.trim()) {
      throw new Error('id is required');
    }
    if (!sellerLevel.sellerId?.trim()) {
      throw new Error('sellerId is required');
    }
    if (!sellerLevel.level) {
      throw new Error('level is required');
    }
  }
}
