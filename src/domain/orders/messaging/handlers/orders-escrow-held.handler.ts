import { IEventEnvelope } from '../../../common/messaging/event-envelope';
import { IEventHandler } from '../../../common/messaging/event-handler.interface';
import { IOrderService } from '../../service/order.service.interface';

export class OrdersEscrowHeldHandler implements IEventHandler {
  constructor(private readonly orderService: IOrderService) {}

  async handle(envelope: IEventEnvelope): Promise<void> {
    await this.orderService.confirmOrderFromEscrow(envelope);
  }
}
