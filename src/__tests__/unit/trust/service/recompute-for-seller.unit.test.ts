import { Types } from 'mongoose';
import { ETrustEventType } from '../../../../domain/trust/entity/enums/ETrustEventType';
import { ITrustEvent } from '../../../../domain/trust/entity/interfaces/trust-event.interface';
import { ITrustScore } from '../../../../domain/trust/entity/interfaces/trust-score.interface';
import { ESellerLevel } from '../../../../domain/trust/entity/enums/ESellerLevel';
import { ISellerLevel } from '../../../../domain/trust/entity/interfaces/seller-level.interface';
import { TrustScoreService } from '../../../../domain/trust/service/trust-score.service';
import { ISellerLevelService } from '../../../../domain/trust/service/seller-level.service.interface';
import { IEventPublisher } from '../../../../domain/common/messaging/event-publisher.interface';
import { validTrustEventMock } from '../../../__mocks__/trust.mock';

function buildService(events: ITrustEvent[]) {
  const scores = new Map<string, ITrustScore>();
  const publisher: IEventPublisher = {
    publish: jest.fn().mockResolvedValue(undefined),
  };
  const sellerLevelService: ISellerLevelService = {
    deriveLevel: jest.fn().mockReturnValue(ESellerLevel.NEW),
    upsertFromScore: jest
      .fn()
      .mockImplementation(async (sellerId: string, score: number) => {
        return {
          id: new Types.ObjectId().toHexString(),
          sellerId,
          level: ESellerLevel.NEW,
          updatedAt: new Date(),
          score,
        } as ISellerLevel & { score?: number };
      }),
    getSellerLevelBySellerId: jest.fn(),
  };

  const service = new TrustScoreService({
    trustEventRepositoryRead: {
      listBySellerId: async (sellerId: string) =>
        events.filter((event) => event.sellerId === sellerId),
      findTrustEventById: async () => null,
      findBySourceEventId: async () => null,
    },
    trustScoreRepositoryRead: {
      findTrustScoreBySellerId: async (sellerId: string) =>
        scores.get(sellerId) ?? null,
      findTrustScoreById: async () => null,
    },
    trustScoreRepositoryWrite: {
      upsertTrustScore: async (score: ITrustScore) => {
        scores.set(score.sellerId, score);
        return score;
      },
      createTrustScore: async (score: ITrustScore) => score,
      updateTrustScoreBySellerId: async () => null,
    },
    sellerLevelService,
    eventPublisher: publisher,
  });

  return { service, publisher, sellerLevelService, scores };
}

describe('when recomputing trust score for a seller', () => {
  it('should return score 0 and empty components for an empty ledger', async () => {
    const sellerId = new Types.ObjectId().toHexString();
    const { service, publisher } = buildService([]);

    const score = await service.recomputeForSeller(sellerId);

    expect(score.score).toBe(0);
    expect(score.components).toEqual({});
    expect(publisher.publish).toHaveBeenCalledWith(
      expect.objectContaining({
        eventType: 'trust.score.updated',
        payload: expect.objectContaining({ sellerId, score: 0 }),
      }),
    );
  });

  it('should apply ORDER_COMPLETED weight of +15', async () => {
    const sellerId = new Types.ObjectId().toHexString();
    const { service } = buildService([
      validTrustEventMock({
        sellerId,
        type: ETrustEventType.ORDER_COMPLETED,
        payload: { orderId: 'o1' },
      }),
    ]);

    const score = await service.recomputeForSeller(sellerId);

    expect(score.score).toBe(15);
    expect(score.components.ORDER_COMPLETED).toBe(15);
  });

  it('should allow a negative score when only SEAL_REVOKED exists', async () => {
    const sellerId = new Types.ObjectId().toHexString();
    const { service } = buildService([
      validTrustEventMock({
        sellerId,
        type: ETrustEventType.SEAL_REVOKED,
        payload: { sealId: 's1' },
      }),
    ]);

    const score = await service.recomputeForSeller(sellerId);

    expect(score.score).toBe(-20);
    expect(score.components.SEAL_REVOKED).toBe(-20);
  });

  it('should sum multiple SEAL_GRANTED events linearly', async () => {
    const sellerId = new Types.ObjectId().toHexString();
    const { service } = buildService([
      validTrustEventMock({
        sellerId,
        type: ETrustEventType.SEAL_GRANTED,
        payload: { sealId: 's1' },
      }),
      validTrustEventMock({
        sellerId,
        type: ETrustEventType.SEAL_GRANTED,
        payload: { sealId: 's2' },
      }),
    ]);

    const score = await service.recomputeForSeller(sellerId);

    expect(score.score).toBe(40);
    expect(score.components.SEAL_GRANTED).toBe(40);
  });

  it('should net grant and revoke to zero for those components', async () => {
    const sellerId = new Types.ObjectId().toHexString();
    const { service } = buildService([
      validTrustEventMock({
        sellerId,
        type: ETrustEventType.SEAL_GRANTED,
        payload: { sealId: 's1' },
      }),
      validTrustEventMock({
        sellerId,
        type: ETrustEventType.SEAL_REVOKED,
        payload: { sealId: 's1' },
      }),
    ]);

    const score = await service.recomputeForSeller(sellerId);

    expect(score.score).toBe(0);
    expect(score.components.SEAL_GRANTED).toBe(20);
    expect(score.components.SEAL_REVOKED).toBe(-20);
  });

  it('should treat unknown event types as weight 0', async () => {
    const sellerId = new Types.ObjectId().toHexString();
    const { service } = buildService([
      validTrustEventMock({
        sellerId,
        type: 'UNKNOWN_TYPE' as ETrustEventType,
        payload: {},
      }),
      validTrustEventMock({
        sellerId,
        type: ETrustEventType.USER_VERIFIED,
        payload: { userId: sellerId },
      }),
    ]);

    const score = await service.recomputeForSeller(sellerId);

    expect(score.score).toBe(10);
    expect(score.components.UNKNOWN_TYPE).toBe(0);
    expect(score.components.USER_VERIFIED).toBe(10);
  });

  it('should combine all known weights into components', async () => {
    const sellerId = new Types.ObjectId().toHexString();
    const { service, sellerLevelService } = buildService([
      validTrustEventMock({
        sellerId,
        type: ETrustEventType.USER_VERIFIED,
        payload: { userId: sellerId },
      }),
      validTrustEventMock({
        sellerId,
        type: ETrustEventType.SEAL_GRANTED,
        payload: { sealId: 's1' },
      }),
      validTrustEventMock({
        sellerId,
        type: ETrustEventType.SEAL_REVOKED,
        payload: { sealId: 's1' },
      }),
      validTrustEventMock({
        sellerId,
        type: ETrustEventType.ORDER_COMPLETED,
        payload: { orderId: 'o1' },
      }),
    ]);

    const score = await service.recomputeForSeller(sellerId);

    expect(score.score).toBe(25);
    expect(sellerLevelService.upsertFromScore).toHaveBeenCalledWith(
      sellerId,
      25,
    );
  });
});
