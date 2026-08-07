import { Types } from 'mongoose';
import { SellerLevelServiceFactory } from '../../../../configuration/factory/seller-level.service.factory';
import { ESellerLevel } from '../../../../domain/trust/entity/enums/ESellerLevel';

const sellerLevelService = SellerLevelServiceFactory.create();

describe('when we get seller level by seller id', () => {
  it('should return default NEW when missing', async () => {
    const level = await sellerLevelService.getSellerLevelBySellerId(
      `missing-level-${Date.now()}`,
    );
    expect(level.level).toBe(ESellerLevel.NEW);
  });

  it('should return persisted level after upsert', async () => {
    const sellerId = new Types.ObjectId().toHexString();
    await sellerLevelService.upsertFromScore(sellerId, 100);

    const level = await sellerLevelService.getSellerLevelBySellerId(sellerId);
    expect(level.level).toBe(ESellerLevel.EXCELLENT);
  });
});
