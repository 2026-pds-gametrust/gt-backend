import { Types } from 'mongoose';
import { SellerLevelServiceFactory } from '../../../../configuration/factory/seller-level.service.factory';
import { ESellerLevel } from '../../../../domain/trust/entity/enums/ESellerLevel';

const sellerLevelService = SellerLevelServiceFactory.create();

describe('when we derive seller level', () => {
  it('should map score bands to levels including negatives', async () => {
    expect(sellerLevelService.deriveLevel(-20)).toBe(ESellerLevel.NEW);
    expect(sellerLevelService.deriveLevel(0)).toBe(ESellerLevel.NEW);
    expect(sellerLevelService.deriveLevel(9)).toBe(ESellerLevel.NEW);
    expect(sellerLevelService.deriveLevel(10)).toBe(ESellerLevel.EVOLVING);
    expect(sellerLevelService.deriveLevel(49)).toBe(ESellerLevel.EVOLVING);
    expect(sellerLevelService.deriveLevel(50)).toBe(ESellerLevel.TRUSTED);
    expect(sellerLevelService.deriveLevel(99)).toBe(ESellerLevel.TRUSTED);
    expect(sellerLevelService.deriveLevel(100)).toBe(ESellerLevel.EXCELLENT);
  });
});

describe('when we upsert seller level from score', () => {
  it('should persist the derived level', async () => {
    const sellerId = new Types.ObjectId().toHexString();
    const level = await sellerLevelService.upsertFromScore(sellerId, 55);
    expect(level.sellerId).toBe(sellerId);
    expect(level.level).toBe(ESellerLevel.TRUSTED);

    const again = await sellerLevelService.upsertFromScore(sellerId, 120);
    expect(again.id).toBe(level.id);
    expect(again.level).toBe(ESellerLevel.EXCELLENT);
  });
});
