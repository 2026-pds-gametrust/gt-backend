import { randomUUID } from 'crypto';
import { ESellerLevel } from '../entity/enums/ESellerLevel';
import { SellerLevelServiceEntity } from '../entity/seller-level.entity';
import { ISellerLevel } from '../entity/interfaces/seller-level.interface';
import { ISellerLevelRepositoryRead } from '../repository/seller-level.repository.read';
import { ISellerLevelRepositoryWrite } from '../repository/seller-level.repository.write';
import {
  IParamsSellerLevelService,
  ISellerLevelService,
} from './seller-level.service.interface';

/** Thresholds: NEW 0–9, EVOLVING 10–49, TRUSTED 50–99, EXCELLENT ≥100 */
export function deriveSellerLevelFromScore(score: number): ESellerLevel {
  if (score >= 100) return ESellerLevel.EXCELLENT;
  if (score >= 50) return ESellerLevel.TRUSTED;
  if (score >= 10) return ESellerLevel.EVOLVING;
  return ESellerLevel.NEW;
}

export class SellerLevelService implements ISellerLevelService {
  private readonly sellerLevelRepositoryRead: ISellerLevelRepositoryRead;
  private readonly sellerLevelRepositoryWrite: ISellerLevelRepositoryWrite;

  constructor({
    sellerLevelRepositoryRead,
    sellerLevelRepositoryWrite,
  }: IParamsSellerLevelService) {
    this.sellerLevelRepositoryRead = sellerLevelRepositoryRead;
    this.sellerLevelRepositoryWrite = sellerLevelRepositoryWrite;
  }

  deriveLevel(score: number): ESellerLevel {
    return deriveSellerLevelFromScore(score);
  }

  async upsertFromScore(
    sellerId: string,
    score: number,
  ): Promise<ISellerLevel> {
    const existing =
      await this.sellerLevelRepositoryRead.findSellerLevelBySellerId(sellerId);
    const level = this.deriveLevel(score);
    const entity = new SellerLevelServiceEntity({
      id: existing?.id ?? randomUUID(),
      sellerId,
      level,
      updatedAt: new Date(),
    });
    return this.sellerLevelRepositoryWrite.upsertSellerLevel(entity);
  }

  async getSellerLevelBySellerId(sellerId: string): Promise<ISellerLevel> {
    const existing =
      await this.sellerLevelRepositoryRead.findSellerLevelBySellerId(sellerId);
    if (existing) {
      return existing;
    }
    return {
      id: randomUUID(),
      sellerId,
      level: ESellerLevel.NEW,
      updatedAt: new Date(),
    };
  }
}
