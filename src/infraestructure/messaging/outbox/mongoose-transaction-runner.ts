import mongoose from 'mongoose';
import { IOutboxSession } from '../../../domain/common/messaging/outbox/outbox.repository.write';
import { ITransactionRunner } from '../../../domain/common/messaging/outbox/transaction-runner.interface';
import {
  getMongooseSession,
  mongooseSessionToOutboxSession,
} from './outbox.repository.write';

export class MongooseTransactionRunner implements ITransactionRunner {
  async runInTransaction<T>(
    work: (session: IOutboxSession) => Promise<T>,
  ): Promise<T> {
    const session = await mongoose.startSession();
    try {
      let result!: T;
      await session.withTransaction(async () => {
        result = await work(mongooseSessionToOutboxSession(session));
      });
      return result;
    } finally {
      await session.endSession();
    }
  }
}

export { getMongooseSession, mongooseSessionToOutboxSession };
