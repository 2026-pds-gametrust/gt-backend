import { IThrowedError, serviceLogErrorHandler } from '@sauvvitech/st-packages';
import { EErrorCode } from '../../../domain/common/errors/enums/EErrorCode';
import { getMongooseSession } from '../../messaging/outbox/outbox.repository.write';
import { IOutboxSession } from '../../../domain/common/messaging/outbox/outbox.repository.write';
import { IEscrowHold } from '../../../domain/payments/entity/interfaces/escrow-hold.interface';
import {
  IEscrowHoldRepositoryRead,
  IEscrowHoldRepositoryWrite,
} from '../../../domain/payments/repository/escrow-hold.repository.write';
import { EscrowHoldModel } from '../../db/mongo/models/escrow-hold.model';
import { dbToInternal, internalToDb } from './adapters/escrow-hold.adapter';

export class EscrowHoldRepositoryRead implements IEscrowHoldRepositoryRead {
  async findByOrderId(orderId: string): Promise<IEscrowHold | null> {
    try {
      const doc = await EscrowHoldModel.findOne({ orderId });
      return doc ? dbToInternal(doc) : null;
    } catch (error: any) {
      serviceLogErrorHandler(error, {
        eventName: 'EscrowHoldRepositoryRead.findByOrderId',
        eventData: { orderId },
      });
      throw {
        status: 500,
        errorCode: EErrorCode.DATABASE_ERROR,
      } as IThrowedError;
    }
  }
}

export class EscrowHoldRepositoryWrite implements IEscrowHoldRepositoryWrite {
  async createEscrowHold(
    escrowHold: IEscrowHold,
    session?: IOutboxSession,
  ): Promise<IEscrowHold> {
    try {
      const mongooseSession = getMongooseSession(session);
      const doc = await EscrowHoldModel.create(
        [internalToDb(escrowHold)],
        mongooseSession ? { session: mongooseSession } : {},
      );
      return dbToInternal(doc[0]!);
    } catch (error: any) {
      serviceLogErrorHandler(error, {
        eventName: 'EscrowHoldRepositoryWrite.createEscrowHold',
        eventData: { escrowHoldId: escrowHold.id },
      });
      throw {
        status: 500,
        errorCode: EErrorCode.DATABASE_ERROR,
      } as IThrowedError;
    }
  }
}
