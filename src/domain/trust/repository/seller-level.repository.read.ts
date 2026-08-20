import { ISellerLevel } from '../entity/interfaces/seller-level.interface';

export interface ISellerLevelRepositoryRead {
  findSellerLevelBySellerId(sellerId: string): Promise<ISellerLevel | null>;
}
