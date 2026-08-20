import { ISellerLevel } from '../entity/interfaces/seller-level.interface';

export interface ISellerLevelRepositoryWrite {
  upsertSellerLevel(sellerLevel: ISellerLevel): Promise<ISellerLevel>;
}
