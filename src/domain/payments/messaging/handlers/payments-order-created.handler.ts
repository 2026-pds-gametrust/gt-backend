import { IEventEnvelope } from '../../../common/messaging/event-envelope';
import { IEventHandler } from '../../../common/messaging/event-handler.interface';
import { IPaymentService } from '../../service/payment.service.interface';

export class PaymentsOrderCreatedHandler implements IEventHandler {
  constructor(private readonly paymentService: IPaymentService) {}

  async handle(envelope: IEventEnvelope): Promise<void> {
    await this.paymentService.handleOrderCreated(envelope);
  }
}
