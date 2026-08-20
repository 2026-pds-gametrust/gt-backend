import { IThrowedError, serviceLogErrorHandler } from '@sauvvitech/st-packages';
import { EErrorCode } from '../../../domain/common/errors/enums/EErrorCode';
import { IOutboxEntry } from '../../../domain/common/messaging/outbox/outbox-entry.interface';
import { IOutboxRepositoryRead } from '../../../domain/common/messaging/outbox/outbox.repository.read';
import { EOutboxStatus } from '../../../domain/common/messaging/outbox/enums/EOutboxStatus';
import { OutboxModel } from '../../db/mongo/models/outbox.model';
import { dbToInternal } from './adapters/outbox.adapter';

export class OutboxRepositoryRead implements IOutboxRepositoryRead {
  async findPending(limit: number): Promise<IOutboxEntry[]> {
    try {
      const docs = await OutboxModel.find({ status: EOutboxStatus.PENDING })
        .sort({ createdAt: 1 })
        .limit(limit);
      return docs.map((doc) => dbToInternal(doc));
    } catch (error: any) {
      serviceLogErrorHandler(error, {
        eventName: 'OutboxRepositoryRead.findPending',
        eventData: { limit },
      });
      throw {
        status: 500,
        errorCode: EErrorCode.DATABASE_ERROR,
      } as IThrowedError;
    }
  }
}
