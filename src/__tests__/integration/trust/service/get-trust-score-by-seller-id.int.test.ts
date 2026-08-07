import { Types } from 'mongoose';
import { TrustEventServiceFactory } from '../../../../configuration/factory/trust-event.service.factory';
import { TrustScoreServiceFactory } from '../../../../configuration/factory/trust-score.service.factory';
import { ETrustEventType } from '../../../../domain/trust/entity/enums/ETrustEventType';
import { validTrustEventMock } from '../../../__mocks__/trust.mock';

const trustEventService = TrustEventServiceFactory.create();
const trustScoreService = TrustScoreServiceFactory.create();

describe('when we get trust score by seller id', () => {
  it('should return default score 0 when missing', async () => {
    const score = await trustScoreService.getTrustScoreBySellerId(
      `missing-seller-${Date.now()}`,
    );
    expect(score.score).toBe(0);
    expect(score.components).toEqual({});
  });

  it('should return persisted score after recompute', async () => {
    const sellerId = new Types.ObjectId().toHexString();
    await trustEventService.appendTrustEvent(
      validTrustEventMock({
        sellerId,
        type: ETrustEventType.USER_VERIFIED,
        payload: { userId: sellerId },
      }),
    );
    await trustScoreService.recomputeForSeller(sellerId);

    const score = await trustScoreService.getTrustScoreBySellerId(sellerId);
    expect(score.score).toBe(10);
  });
});
