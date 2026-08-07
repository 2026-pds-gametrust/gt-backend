import { randomUUID } from 'crypto';
import { createEventEnvelope } from '../../common/messaging/event-envelope';import { IEventPublisher } from '../../common/messaging/event-publisher.interface';
import { ETrustEventType } from '../entity/enums/ETrustEventType';
import { TrustScoreServiceEntity } from '../entity/trust-score.entity';
import { ITrustScore } from '../entity/interfaces/trust-score.interface';
import { ITrustEventRepositoryRead } from '../repository/trust-event.repository.read';
import { ITrustScoreRepositoryRead } from '../repository/trust-score.repository.read';
import { ITrustScoreRepositoryWrite } from '../repository/trust-score.repository.write';
import { ISellerLevelService } from './seller-level.service.interface';
import {
  IParamsTrustScoreService,
  ITrustScoreService,
} from './trust-score.service.interface';

const WEIGHTS: Record<ETrustEventType, number> = {
  [ETrustEventType.USER_VERIFIED]: 10,
  [ETrustEventType.SEAL_GRANTED]: 20,
  [ETrustEventType.SEAL_REVOKED]: -20,
  [ETrustEventType.ORDER_COMPLETED]: 15,
};

export class TrustScoreService implements ITrustScoreService {
  private readonly trustScoreRepositoryRead: ITrustScoreRepositoryRead;
  private readonly trustScoreRepositoryWrite: ITrustScoreRepositoryWrite;
  private readonly trustEventRepositoryRead: ITrustEventRepositoryRead;
  private readonly sellerLevelService: ISellerLevelService;
  private readonly eventPublisher: IEventPublisher;

  constructor({
    trustScoreRepositoryRead,
    trustScoreRepositoryWrite,
    trustEventRepositoryRead,
    sellerLevelService,
    eventPublisher,
  }: IParamsTrustScoreService) {
    this.trustScoreRepositoryRead = trustScoreRepositoryRead;
    this.trustScoreRepositoryWrite = trustScoreRepositoryWrite;
    this.trustEventRepositoryRead = trustEventRepositoryRead;
    this.sellerLevelService = sellerLevelService;
    this.eventPublisher = eventPublisher;
  }

  async recomputeForSeller(sellerId: string): Promise<ITrustScore> {
    const events =
      await this.trustEventRepositoryRead.listBySellerId(sellerId);
    const components: Record<string, number> = {};
    let score = 0;

    for (const event of events) {
      const weight = WEIGHTS[event.type] ?? 0;
      components[event.type] = (components[event.type] ?? 0) + weight;
      score += weight;
    }

    const existing =
      await this.trustScoreRepositoryRead.findTrustScoreBySellerId(sellerId);
    const entity = new TrustScoreServiceEntity({
      id: existing?.id ?? randomUUID(),
      sellerId,
      score,
      components,
      computedAt: new Date(),
      updatedAt: new Date(),
    });

    const upserted =
      await this.trustScoreRepositoryWrite.upsertTrustScore(entity);

    await this.sellerLevelService.upsertFromScore(sellerId, upserted.score);

    await this.eventPublisher.publish(
      createEventEnvelope({
        eventId: randomUUID(),
        eventType: 'trust.score.updated',
        aggregateId: upserted.sellerId,
        producerModule: 'trust',
        correlationId: randomUUID(),
        payload: {
          sellerId: upserted.sellerId,
          score: upserted.score,
        },
      }),
    );

    return upserted;
  }

  async getTrustScoreBySellerId(sellerId: string): Promise<ITrustScore> {
    const existing =
      await this.trustScoreRepositoryRead.findTrustScoreBySellerId(sellerId);
    if (existing) {
      return existing;
    }
    return {
      id: randomUUID(),
      sellerId,
      score: 0,
      components: {},
      computedAt: new Date(),
      updatedAt: new Date(),
    };
  }
}
