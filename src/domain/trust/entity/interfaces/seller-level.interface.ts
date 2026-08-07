import { ESellerLevel } from '../enums/ESellerLevel';

export interface ISellerLevel {
  id: string;
  sellerId: string;
  level: ESellerLevel;
  updatedAt?: Date;
}
