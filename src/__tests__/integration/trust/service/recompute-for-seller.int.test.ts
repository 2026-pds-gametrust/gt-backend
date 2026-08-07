import { Types } from 'mongoose';
import { TrustEventServiceFactory } from '../../../../configuration/factory/trust-event.service.factory';
import { TrustScoreServiceFactory } from '../../../../configuration/factory/trust-score.service.factory';
import { SellerLevelServiceFactory } from '../../../../configuration/factory/seller-level.service.factory';
import { TrustScoreService } from '../../../../domain/trust/service/trust-score.service';
import { ETrustEventType } from '../../../../domain/trust/entity/enums/ETrustEventType';
import { ESellerLevel } from '../../../../domain/trust/entity/enums/ESellerLevel';
import { TrustEventRepositoryRead } from '../../../../infraestructure/repository/trust/trust-event.repository.read';
import { TrustScoreRepositoryRead } from '../../../../infraestructure/repository/trust/trust-score.repository.read';
import { TrustScoreRepositoryWrite } from '../../../../infraestructure/repository/trust/trust-score.repository.write';
import { SellerLevelRepositoryRead } from '../../../../infraestructure/repository/trust/seller-level.repository.read';
import { SellerLevelRepositoryWrite } from '../../../../infraestructure/repository/trust/seller-level.repository.write';
import { SellerLevelService } from '../../../../domain/trust/service/seller-level.service';
import { validTrustEventMock } from '../../../__mocks__/trust.mock';

const trustEventService = TrustEventServiceFactory.create();
const trustScoreService = TrustScoreServiceFactory.create();
const sellerLevelService = SellerLevelServiceFactory.create();

describe('when we recompute trust score for a seller', () => {
  it('should add weights and update seller level', async () => {
    const sellerId = new Types.ObjectId().toHexString();
    await trustEventService.appendTrustEvent(
      validTrustEventMock({
        sellerId,
        type: ETrustEventType.USER_VERIFIED,
        payload: { userId: sellerId },
      }),
    );
    await trustEventService.appendTrustEvent(
      validTrustEventMock({
        sellerId,
        type: ETrustEventType.SEAL_GRANTED,
        payload: { sealId: 's1' },
      }),
    );

    const score = await trustScoreService.recomputeForSeller(sellerId);
    expect(score.score).toBe(30);
    expect(score.components.USER_VERIFIED).toBe(10);
    expect(score.components.SEAL_GRANTED).toBe(20);

    const level = await sellerLevelService.getSellerLevelBySellerId(sellerId);
    expect(level.level).toBe(ESellerLevel.EVOLVING);
  });

  it('should publish trust.score.updated via event publisher', async () => {
    const publisher = {
      publish: jest.fn().mockResolvedValue(undefined),
    };
    const service = new TrustScoreService({
      trustScoreRepositoryRead: new TrustScoreRepositoryRead(),
      trustScoreRepositoryWrite: new TrustScoreRepositoryWrite(),
      trustEventRepositoryRead: new TrustEventRepositoryRead(),
      sellerLevelService: new SellerLevelService({
        sellerLevelRepositoryRead: new SellerLevelRepositoryRead(),
        sellerLevelRepositoryWrite: new SellerLevelRepositoryWrite(),
      }),
      eventPublisher: publisher,
    });

    const sellerId = new Types.ObjectId().toHexString();
    await service.recomputeForSeller(sellerId);

    expect(publisher.publish).toHaveBeenCalledWith(
      expect.objectContaining({
        eventType: 'trust.score.updated',
        payload: expect.objectContaining({ sellerId, score: 0 }),
      }),
    );
  });

  it('should recompute idempotently for the same ledger', async () => {
    const sellerId = new Types.ObjectId().toHexString();
    await trustEventService.appendTrustEvent(
      validTrustEventMock({
        sellerId,
        type: ETrustEventType.ORDER_COMPLETED,
        payload: { orderId: 'o1' },
      }),
    );

    const first = await trustScoreService.recomputeForSeller(sellerId);
    const second = await trustScoreService.recomputeForSeller(sellerId);

    expect(first.score).toBe(15);
    expect(second.score).toBe(15);
    expect(second.id).toBe(first.id);
  });
});
