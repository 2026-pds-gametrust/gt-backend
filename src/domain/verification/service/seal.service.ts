import { IThrowedError } from '@sauvvitech/st-packages';
import { randomUUID } from 'crypto';
import { EErrorCode } from '../../common/errors/enums/EErrorCode';
import { createEventEnvelope } from '../../common/messaging/event-envelope';
import { IEventPublisher } from '../../common/messaging/event-publisher.interface';
import { ETrustEventType } from '../../trust/entity/enums/ETrustEventType';
import { ITrustEventService } from '../../trust/service/trust-event.service.interface';
import { ITrustScoreService } from '../../trust/service/trust-score.service.interface';
import { SealServiceEntity } from '../entity/seal.entity';
import { ESealStatus } from '../entity/enums/ESealStatus';
import { ISeal } from '../entity/interfaces/seal.interface';
import { ISealRepositoryRead } from '../repository/seal.repository.read';
import { ISealRepositoryWrite } from '../repository/seal.repository.write';
import {
  IParamsGrantSeal,
  IParamsSealService,
  ISealService,
} from './seal.service.interface';

export class SealService implements ISealService {
  private readonly sealRepositoryRead: ISealRepositoryRead;
  private readonly sealRepositoryWrite: ISealRepositoryWrite;
  private readonly trustEventService: ITrustEventService;
  private readonly trustScoreService: ITrustScoreService;
  private readonly eventPublisher: IEventPublisher;

  constructor({
    sealRepositoryRead,
    sealRepositoryWrite,
    trustEventService,
    trustScoreService,
    eventPublisher,
  }: IParamsSealService) {
    this.sealRepositoryRead = sealRepositoryRead;
    this.sealRepositoryWrite = sealRepositoryWrite;
    this.trustEventService = trustEventService;
    this.trustScoreService = trustScoreService;
    this.eventPublisher = eventPublisher;
  }

  async grantSeal(params: IParamsGrantSeal): Promise<ISeal> {
    const active = await this.sealRepositoryRead.findActiveSealByListingId(
      params.listingId,
    );
    if (active) {
      throw {
        status: 409,
        errorCode: EErrorCode.RESOURCE_CONFLICT,
        message: 'Listing already has an active seal',
        details: { listingId: params.listingId, sealId: active.id },
      } as IThrowedError;
    }

    const now = new Date();
    const entity = new SealServiceEntity({
      id: params.id,
      listingId: params.listingId,
      caseId: params.caseId,
      type: params.type,
      status: ESealStatus.GRANTED,
      grantedAt: now,
      createdAt: now,
    });

    const created = await this.sealRepositoryWrite.createSeal(entity);

    await this.eventPublisher.publish(
      createEventEnvelope({
        eventId: randomUUID(),
        eventType: 'verification.seal.granted',
        aggregateId: created.id,
        producerModule: 'verification',
        correlationId: randomUUID(),
        payload: {
          sealId: created.id,
          listingId: created.listingId,
          type: created.type,
        },
      }),
    );

    await this.trustEventService.appendTrustEvent({
      id: randomUUID(),
      sellerId: params.sellerId,
      type: ETrustEventType.SEAL_GRANTED,
      sourceEventId: params.sourceEventId,
      payload: {
        sealId: created.id,
        listingId: created.listingId,
        type: created.type,
      },
    });
    await this.trustScoreService.recomputeForSeller(params.sellerId);

    return created;
  }

  async revokeSeal(id: string, sellerId: string): Promise<ISeal> {
    const existing = await this.getSealById(id);
    if (existing.status !== ESealStatus.GRANTED) {
      throw {
        status: 409,
        errorCode: EErrorCode.RESOURCE_CONFLICT,
        message: 'Only GRANTED seals can be revoked',
        details: { id, status: existing.status },
      } as IThrowedError;
    }

    const updated = await this.sealRepositoryWrite.updateSealById(id, {
      status: ESealStatus.REVOKED,
    });
    if (!updated) {
      throw {
        status: 404,
        errorCode: EErrorCode.RESOURCE_NOT_FOUND,
        message: 'Seal not found',
        details: { id },
      } as IThrowedError;
    }

    const sourceEventId = randomUUID();
    await this.eventPublisher.publish(
      createEventEnvelope({
        eventId: sourceEventId,
        eventType: 'verification.seal.revoked',
        aggregateId: updated.id,
        producerModule: 'verification',
        correlationId: randomUUID(),
        payload: {
          sealId: updated.id,
          listingId: updated.listingId,
          type: updated.type,
        },
      }),
    );

    await this.trustEventService.appendTrustEvent({
      id: randomUUID(),
      sellerId,
      type: ETrustEventType.SEAL_REVOKED,
      sourceEventId,
      payload: {
        sealId: updated.id,
        listingId: updated.listingId,
        type: updated.type,
      },
    });
    await this.trustScoreService.recomputeForSeller(sellerId);

    return updated;
  }

  async getSealById(id: string): Promise<ISeal> {
    const seal = await this.sealRepositoryRead.findSealById(id);
    if (!seal) {
      throw {
        status: 404,
        errorCode: EErrorCode.RESOURCE_NOT_FOUND,
        message: 'Seal not found',
        details: { id },
      } as IThrowedError;
    }
    return seal;
  }

  async listSealsByListingId(listingId: string): Promise<ISeal[]> {
    return this.sealRepositoryRead.listSealsByListingId(listingId);
  }
}
