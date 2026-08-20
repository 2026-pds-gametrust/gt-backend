import { IEventEnvelope } from '../../common/messaging/event-envelope';
import { IOutboxPoller } from '../../common/messaging/outbox/outbox-poller.interface';
import { OutboxService } from '../../common/messaging/outbox/outbox.service';
import { ITransactionRunner } from '../../common/messaging/outbox/transaction-runner.interface';
import { IActorContext } from '../../common/types/actor-context';
import { IPaginationQuery, IPaginatedResult } from '../../common/types/pagination';
import { EShippingMode } from '../../listings/entity/enums/EShippingMode';
import { IListingsClient } from '../client/listings.client';
import { EOrderStatus } from '../entity/enums/EOrderStatus';
import { IOrder } from '../entity/interfaces/order.interface';
import { IOrderRepositoryRead } from '../repository/order.repository.read';
import { IOrderRepositoryWrite } from '../repository/order.repository.write';

export interface IParamsCreateBuyNowOrder {
  id: string;
  listingId: string;
  shippingMode: EShippingMode;
}

export interface IParamsOrderService {
  orderRepositoryRead: IOrderRepositoryRead;
  orderRepositoryWrite: IOrderRepositoryWrite;
  listingsClient: IListingsClient;
  outboxService: OutboxService;
  transactionRunner: ITransactionRunner;
  outboxPoller: IOutboxPoller;
}

export interface IOrderService {
  createBuyNowOrder(
    params: IParamsCreateBuyNowOrder,
    actor: IActorContext,
  ): Promise<IOrder>;
  getOrderById(id: string, actor: IActorContext): Promise<IOrder>;
  listOrders(
    actor: IActorContext,
    query: IPaginationQuery & { status?: EOrderStatus },
  ): Promise<IPaginatedResult<IOrder>>;
  confirmOrderFromEscrow(envelope: IEventEnvelope): Promise<void>;
  isCompletedPurchase(orderId: string, buyerId: string): Promise<boolean>;
}
