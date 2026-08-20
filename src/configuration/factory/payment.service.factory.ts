import { PaymentService } from '../../domain/payments/service/payment.service';
import { SimulatedPaymentProvider } from '../../infraestructure/payments/simulated-payment-provider';
import {
  EscrowHoldRepositoryWrite,
} from '../../infraestructure/repository/payments/escrow-hold.repository.write';
import { PaymentRepositoryRead } from '../../infraestructure/repository/payments/payment.repository.read';
import { PaymentRepositoryWrite } from '../../infraestructure/repository/payments/payment.repository.write';
import { OutboxPollerFactory } from './messaging/outbox.poller.factory';
import { OutboxServiceFactory } from './messaging/outbox.service.factory';
import { TransactionRunnerFactory } from './messaging/transaction-runner.factory';

export class PaymentServiceFactory {
  private static instance: PaymentService | null = null;

  static create(): PaymentService {
    if (!this.instance) {
      this.instance = new PaymentService({
        paymentRepositoryRead: new PaymentRepositoryRead(),
        paymentRepositoryWrite: new PaymentRepositoryWrite(),
        escrowHoldRepositoryWrite: new EscrowHoldRepositoryWrite(),
        paymentProvider: new SimulatedPaymentProvider(),
        outboxService: OutboxServiceFactory.create(),
        transactionRunner: TransactionRunnerFactory.create(),
        outboxPoller: OutboxPollerFactory.create(),
      });
    }
    return this.instance;
  }

  static resetForTests(): void {
    this.instance = null;
  }
}
