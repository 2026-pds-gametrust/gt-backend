import { MongooseTransactionRunner } from '../../../infraestructure/messaging/outbox/mongoose-transaction-runner';
import { ITransactionRunner } from '../../../domain/common/messaging/outbox/transaction-runner.interface';

export class TransactionRunnerFactory {
  private static instance: ITransactionRunner | null = null;

  static create(): ITransactionRunner {
    if (!this.instance) {
      this.instance = new MongooseTransactionRunner();
    }
    return this.instance;
  }

  static resetForTests(): void {
    this.instance = null;
  }
}
