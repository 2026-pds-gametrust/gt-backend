import { handleTranslatedError } from '@sauvvitech/st-packages';
import { randomUUID } from 'crypto';
import { Request, Response, Router } from 'express';
import { EOrderStatus } from '../../domain/orders/entity/enums/EOrderStatus';
import { OrderService } from '../../domain/orders/service/order.service';
import { IController } from '../../domain/server/interfaces/IController';
import { ErrorCatalog } from '../../infraestructure/i18n/error-catalog';
import { requireAccessToken } from '../middleware/require-access-token';

export class OrdersController implements IController {
  router: Router;
  private readonly orderService: OrderService;

  constructor(orderService: OrderService) {
    this.orderService = orderService;
    this.router = Router();
    this.initRoutes();
  }

  initRoutes() {
    this.router.post('/orders', requireAccessToken, this.createOrder);
    this.router.get('/orders', requireAccessToken, this.listOrders);
    this.router.get('/orders/:id', requireAccessToken, this.getOrderById);
  }

  createOrder = async (req: Request, res: Response): Promise<void> => {
    try {
      const created = await this.orderService.createBuyNowOrder(
        {
          id: req.body.id ?? randomUUID(),
          listingId: req.body.listingId,
          shippingMode: req.body.shippingMode,
        },
        req.actor,
      );
      res.status(201).json(created);
    } catch (error) {
      handleTranslatedError(error, ErrorCatalog, res);
    }
  };

  listOrders = async (req: Request, res: Response): Promise<void> => {
    try {
      const page = Math.max(1, Number(req.query.page ?? 1));
      const pageSize = Math.min(
        50,
        Math.max(1, Number(req.query.pageSize ?? 20)),
      );
      const status = req.query.status as EOrderStatus | undefined;
      const orderPage = await this.orderService.listOrders(req.actor, {
        page,
        pageSize,
        status,
      });
      res.status(200).json(orderPage);
    } catch (error) {
      handleTranslatedError(error, ErrorCatalog, res);
    }
  };

  getOrderById = async (
    req: Request<{ id: string }>,
    res: Response,
  ): Promise<void> => {
    try {
      const order = await this.orderService.getOrderById(
        req.params.id,
        req.actor,
      );
      res.status(200).json(order);
    } catch (error) {
      handleTranslatedError(error, ErrorCatalog, res);
    }
  };

  public getRoutes(): Router {
    return this.router;
  }
}
