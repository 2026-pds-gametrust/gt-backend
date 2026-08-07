import { IThrowedError } from '@sauvvitech/st-packages';
import { EErrorCode } from '../../common/errors/enums/EErrorCode';
import { TrustEventServiceEntity } from '../entity/trust-event.entity';
import { ITrustEvent } from '../entity/interfaces/trust-event.interface';
import { ITrustEventRepositoryRead } from '../repository/trust-event.repository.read';
import { ITrustEventRepositoryWrite } from '../repository/trust-event.repository.write';
import {
  IParamsAppendTrustEvent,
  IParamsTrustEventService,
  ITrustEventService,
} from './trust-event.service.interface';

const FORBIDDEN_PAYLOAD_KEYS = new Set([
  'cpf',
  'street',
  'address',
  'fullAddress',
]);

export class TrustEventService implements ITrustEventService {
  private readonly trustEventRepositoryRead: ITrustEventRepositoryRead;
  private readonly trustEventRepositoryWrite: ITrustEventRepositoryWrite;

  constructor({
    trustEventRepositoryRead,
    trustEventRepositoryWrite,
  }: IParamsTrustEventService) {
    this.trustEventRepositoryRead = trustEventRepositoryRead;
    this.trustEventRepositoryWrite = trustEventRepositoryWrite;
  }

  async appendTrustEvent(
    params: IParamsAppendTrustEvent,
  ): Promise<ITrustEvent> {
    this.assertPayloadSafe(params.payload);

    const existing =
      await this.trustEventRepositoryRead.findBySourceEventId(
        params.sourceEventId,
      );
    if (existing) {
      return existing;
    }

    const entity = new TrustEventServiceEntity({
      id: params.id,
      sellerId: params.sellerId,
      type: params.type,
      sourceEventId: params.sourceEventId,
      payload: params.payload,
      occurredAt: params.occurredAt ?? new Date(),
      createdAt: new Date(),
    });

    return this.trustEventRepositoryWrite.appendTrustEvent(entity);
  }

  async listBySellerId(sellerId: string): Promise<ITrustEvent[]> {
    return this.trustEventRepositoryRead.listBySellerId(sellerId);
  }

  async getTrustEventById(id: string): Promise<ITrustEvent> {
    const event = await this.trustEventRepositoryRead.findTrustEventById(id);
    if (!event) {
      throw {
        status: 404,
        errorCode: EErrorCode.RESOURCE_NOT_FOUND,
        message: 'Trust event not found',
        details: { id },
      } as IThrowedError;
    }
    return event;
  }

  private assertPayloadSafe(payload: Record<string, unknown>): void {
    for (const key of Object.keys(payload)) {
      if (FORBIDDEN_PAYLOAD_KEYS.has(key.toLowerCase())) {
        throw {
          status: 400,
          errorCode: EErrorCode.FIELD_INVALID,
          message: 'Trust event payload must not include PII fields',
          details: { field: key },
        } as IThrowedError;
      }
    }
  }
}
