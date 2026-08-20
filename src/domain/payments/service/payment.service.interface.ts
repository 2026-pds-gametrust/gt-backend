import { IEventEnvelope } from '../../common/messaging/event-envelope';
import { IOutboxPoller } from '../../common/messaging/outbox/outbox-poller.interface';
import { OutboxService } from '../../common/messaging/outbox/outbox.service';
import { ITransactionRunner } from '../../common/messaging/outbox/transaction-runner.interface';
import { IPaymentProvider } from '../ports/payment-provider.interface';
import { IPaymentRepositoryRead } from '../repository/payment.repository.read';
import { IPaymentRepositoryWrite } from '../repository/payment.repository.write';
import { IEscrowHoldRepositoryWrite } from '../repository/escrow-hold.repository.write';

export interface IParamsPaymentService {
  paymentRepositoryRead: IPaymentRepositoryRead;
  paymentRepositoryWrite: IPaymentRepositoryWrite;
  escrowHoldRepositoryWrite: IEscrowHoldRepositoryWrite;
  paymentProvider: IPaymentProvider;
  outboxService: OutboxService;
  transactionRunner: ITransactionRunner;
  outboxPoller: IOutboxPoller;
}

export interface IPaymentService {
  handleOrderCreated(envelope: IEventEnvelope): Promise<void>;
}
