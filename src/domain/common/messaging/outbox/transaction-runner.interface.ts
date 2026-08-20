import { IOutboxSession } from './outbox.repository.write';

export interface ITransactionRunner {
  runInTransaction<T>(
    work: (session: IOutboxSession) => Promise<T>,
  ): Promise<T>;
}
