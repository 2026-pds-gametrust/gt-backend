import { ESellerLevel } from '../entity/enums/ESellerLevel';
import { ISellerLevel } from '../entity/interfaces/seller-level.interface';
import { ISellerLevelRepositoryRead } from '../repository/seller-level.repository.read';
import { ISellerLevelRepositoryWrite } from '../repository/seller-level.repository.write';

export interface IParamsSellerLevelService {
  sellerLevelRepositoryRead: ISellerLevelRepositoryRead;
  sellerLevelRepositoryWrite: ISellerLevelRepositoryWrite;
}

export interface ISellerLevelService {
  deriveLevel(score: number): ESellerLevel;
  upsertFromScore(sellerId: string, score: number): Promise<ISellerLevel>;
  getSellerLevelBySellerId(sellerId: string): Promise<ISellerLevel>;
}
