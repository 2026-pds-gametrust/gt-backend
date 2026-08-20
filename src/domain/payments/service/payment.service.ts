import { randomUUID } from 'crypto';
import { IThrowedError } from '@sauvvitech/st-packages';
import { EErrorCode } from '../../common/errors/enums/EErrorCode';
import {
  createEventEnvelope,
  IEventEnvelope,
} from '../../common/messaging/event-envelope';
import { EEscrowHoldStatus } from '../entity/enums/EEscrowHoldStatus';
import { EPaymentStatus } from '../entity/enums/EPaymentStatus';
import {
  IPaymentService,
  IParamsPaymentService,
} from './payment.service.interface';

type TOrderCreatedPayload = {
  orderId?: string;
  priceCents?: number;
  currency?: string;
};

export class PaymentService implements IPaymentService {
  private readonly paymentRepositoryRead: IParamsPaymentService['paymentRepositoryRead'];
  private readonly paymentRepositoryWrite: IParamsPaymentService['paymentRepositoryWrite'];
  private readonly escrowHoldRepositoryWrite: IParamsPaymentService['escrowHoldRepositoryWrite'];
  private readonly paymentProvider: IParamsPaymentService['paymentProvider'];
  private readonly outboxService: IParamsPaymentService['outboxService'];
  private readonly transactionRunner: IParamsPaymentService['transactionRunner'];
  private readonly outboxPoller: IParamsPaymentService['outboxPoller'];

  constructor(params: IParamsPaymentService) {
    this.paymentRepositoryRead = params.paymentRepositoryRead;
    this.paymentRepositoryWrite = params.paymentRepositoryWrite;
    this.escrowHoldRepositoryWrite = params.escrowHoldRepositoryWrite;
    this.paymentProvider = params.paymentProvider;
    this.outboxService = params.outboxService;
    this.transactionRunner = params.transactionRunner;
    this.outboxPoller = params.outboxPoller;
  }

  async handleOrderCreated(envelope: IEventEnvelope): Promise<void> {
    const payload = envelope.payload as TOrderCreatedPayload;
    const orderId = payload.orderId ?? envelope.aggregateId;
    const amountCents = payload.priceCents;
    const currency = payload.currency ?? 'BRL';

    if (!orderId || amountCents == null) {
      return;
    }

    const existingPayment =
      await this.paymentRepositoryRead.findByOrderId(orderId);
    if (existingPayment) {
      return;
    }

    const providerResult = await this.paymentProvider.holdEscrow({
      orderId,
      amountCents,
      currency,
    });

    if (!providerResult.success) {
      throw {
        status: 402,
        errorCode: EErrorCode.PAYMENT_INSUFFICIENT_FUNDS,
        message: providerResult.failureReason ?? 'Payment failed',
        details: { orderId },
      } as IThrowedError;
    }

    const paymentId = randomUUID();
    const escrowId = randomUUID();
    const now = new Date();

    await this.transactionRunner.runInTransaction(async (session) => {
      await this.paymentRepositoryWrite.createPayment(
        {
          id: paymentId,
          orderId,
          amountCents,
          currency,
          status: EPaymentStatus.COMPLETED,
          createdAt: now,
        },
        session,
      );

      await this.escrowHoldRepositoryWrite.createEscrowHold(
        {
          id: escrowId,
          orderId,
          paymentId,
          amountCents,
          currency,
          status: EEscrowHoldStatus.HELD,
          createdAt: now,
        },
        session,
      );

      await this.outboxService.enqueue(
        createEventEnvelope({
          eventId: randomUUID(),
          eventType: 'payments.escrow.held',
          aggregateId: orderId,
          producerModule: 'payments',
          correlationId: envelope.correlationId,
          payload: {
            orderId,
            paymentId,
            escrowHoldId: escrowId,
            amountCents,
            currency,
          },
        }),
        session,
      );
    });

    await this.outboxPoller.drainPending();
  }
}
