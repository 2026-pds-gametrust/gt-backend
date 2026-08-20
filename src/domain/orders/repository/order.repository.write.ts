import { IOrder } from '../entity/interfaces/order.interface';
import { IOutboxSession } from '../../common/messaging/outbox/outbox.repository.write';
import { EOrderStatus } from '../entity/enums/EOrderStatus';

export interface IOrderRepositoryWrite {
  createOrder(order: IOrder, session?: IOutboxSession): Promise<IOrder>;
  updateOrderStatus(
    id: string,
    status: EOrderStatus,
    session?: IOutboxSession,
  ): Promise<IOrder | null>;
}
