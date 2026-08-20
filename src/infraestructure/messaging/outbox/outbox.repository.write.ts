import { randomUUID } from 'crypto';
import { IThrowedError, serviceLogErrorHandler } from '@sauvvitech/st-packages';
import { ClientSession } from 'mongoose';
import { EErrorCode } from '../../../domain/common/errors/enums/EErrorCode';
import { IEventEnvelope } from '../../../domain/common/messaging/event-envelope';
import { IOutboxEntry } from '../../../domain/common/messaging/outbox/outbox-entry.interface';
import {
  IOutboxRepositoryWrite,
  IOutboxSession,
} from '../../../domain/common/messaging/outbox/outbox.repository.write';
import { EOutboxStatus } from '../../../domain/common/messaging/outbox/enums/EOutboxStatus';
import { OutboxModel } from '../../db/mongo/models/outbox.model';
import { dbToInternal, internalToDb } from './adapters/outbox.adapter';

export function mongooseSessionToOutboxSession(
  session: ClientSession,
): IOutboxSession {
  return { token: session };
}

export function getMongooseSession(session?: IOutboxSession): ClientSession | undefined {
  return session?.token as ClientSession | undefined;
}

export class OutboxRepositoryWrite implements IOutboxRepositoryWrite {
  async enqueue(
    envelope: IEventEnvelope,
    session?: IOutboxSession,
  ): Promise<IOutboxEntry> {
    try {
      const mongooseSession = getMongooseSession(session);
      const doc = await OutboxModel.create(
        [
          internalToDb({
            id: randomUUID(),
            envelope,
            status: EOutboxStatus.PENDING,
            attempts: 0,
          }),
        ],
        mongooseSession ? { session: mongooseSession } : {},
      );
      return dbToInternal(doc[0]!);
    } catch (error: any) {
      serviceLogErrorHandler(error, {
        eventName: 'OutboxRepositoryWrite.enqueue',
        eventData: { eventType: envelope.eventType },
      });
      throw {
        status: 500,
        errorCode: EErrorCode.DATABASE_ERROR,
      } as IThrowedError;
    }
  }

  async markPublished(id: string, publishedAt: Date): Promise<void> {
    try {
      await OutboxModel.updateOne(
        { id },
        {
          $set: {
            status: EOutboxStatus.PUBLISHED,
            publishedAt,
          },
        },
      );
    } catch (error: any) {
      serviceLogErrorHandler(error, {
        eventName: 'OutboxRepositoryWrite.markPublished',
        eventData: { id },
      });
      throw {
        status: 500,
        errorCode: EErrorCode.DATABASE_ERROR,
      } as IThrowedError;
    }
  }

  async markFailed(id: string, attempts: number): Promise<void> {
    try {
      await OutboxModel.updateOne(
        { id },
        {
          $set: {
            status: EOutboxStatus.FAILED,
            attempts,
          },
        },
      );
    } catch (error: any) {
      serviceLogErrorHandler(error, {
        eventName: 'OutboxRepositoryWrite.markFailed',
        eventData: { id },
      });
      throw {
        status: 500,
        errorCode: EErrorCode.DATABASE_ERROR,
      } as IThrowedError;
    }
  }

  async updateStatus(
    id: string,
    status: EOutboxStatus,
    session?: IOutboxSession,
  ): Promise<void> {
    try {
      const mongooseSession = getMongooseSession(session);
      await OutboxModel.updateOne(
        { id },
        { $set: { status } },
        mongooseSession ? { session: mongooseSession } : {},
      );
    } catch (error: any) {
      serviceLogErrorHandler(error, {
        eventName: 'OutboxRepositoryWrite.updateStatus',
        eventData: { id, status },
      });
      throw {
        status: 500,
        errorCode: EErrorCode.DATABASE_ERROR,
      } as IThrowedError;
    }
  }

  async incrementAttempts(id: string, attempts: number): Promise<void> {
    try {
      await OutboxModel.updateOne({ id }, { $set: { attempts } });
    } catch (error: any) {
      serviceLogErrorHandler(error, {
        eventName: 'OutboxRepositoryWrite.incrementAttempts',
        eventData: { id, attempts },
      });
      throw {
        status: 500,
        errorCode: EErrorCode.DATABASE_ERROR,
      } as IThrowedError;
    }
  }
}
