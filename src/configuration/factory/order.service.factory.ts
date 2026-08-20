import { OrderService } from '../../domain/orders/service/order.service';
import { ListingsClientAdapter } from '../../infraestructure/client/listings/listings.client.adapter';
import { OrderRepositoryRead } from '../../infraestructure/repository/orders/order.repository.read';
import { OrderRepositoryWrite } from '../../infraestructure/repository/orders/order.repository.write';
import { ListingServiceFactory } from './listing.service.factory';
import { OutboxPollerFactory } from './messaging/outbox.poller.factory';
import { OutboxServiceFactory } from './messaging/outbox.service.factory';
import { TransactionRunnerFactory } from './messaging/transaction-runner.factory';

export class OrderServiceFactory {
  private static instance: OrderService | null = null;

  static create(): OrderService {
    if (!this.instance) {
      this.instance = new OrderService({
        orderRepositoryRead: new OrderRepositoryRead(),
        orderRepositoryWrite: new OrderRepositoryWrite(),
        listingsClient: new ListingsClientAdapter(
          ListingServiceFactory.create(),
        ),
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
