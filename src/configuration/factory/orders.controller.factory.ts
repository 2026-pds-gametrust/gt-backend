import { OrdersController } from '../../application/controllers/orders.controller';
import { OrderServiceFactory } from './order.service.factory';

export class OrdersControllerFactory {
  static create(): OrdersController {
    return new OrdersController(OrderServiceFactory.create());
  }
}
