import { IThrowedError } from '@sauvvitech/st-packages';
import { randomUUID } from 'crypto';
import {
  assertActorPresent,
  systemActorContext,
} from '../../common/auth/actor-authorization';
import { EErrorCode } from '../../common/errors/enums/EErrorCode';
import {
  createEventEnvelope,
  IEventEnvelope,
} from '../../common/messaging/event-envelope';
import { IActorContext } from '../../common/types/actor-context';
import { IOrder } from '../entity/interfaces/order.interface';
import { OrderServiceEntity } from '../entity/order.entity';
import { EOrderStatus } from '../entity/enums/EOrderStatus';
import {
  IOrderService,
  IParamsCreateBuyNowOrder,
  IParamsOrderService,
} from './order.service.interface';

const MAX_PAGE_SIZE = 50;

type TEscrowHeldPayload = {
  orderId?: string;
};

export class OrderService implements IOrderService {
  private readonly orderRepositoryRead: IParamsOrderService['orderRepositoryRead'];
  private readonly orderRepositoryWrite: IParamsOrderService['orderRepositoryWrite'];
  private readonly listingsClient: IParamsOrderService['listingsClient'];
  private readonly outboxService: IParamsOrderService['outboxService'];
  private readonly transactionRunner: IParamsOrderService['transactionRunner'];
  private readonly outboxPoller: IParamsOrderService['outboxPoller'];

  constructor(params: IParamsOrderService) {
    this.orderRepositoryRead = params.orderRepositoryRead;
    this.orderRepositoryWrite = params.orderRepositoryWrite;
    this.listingsClient = params.listingsClient;
    this.outboxService = params.outboxService;
    this.transactionRunner = params.transactionRunner;
    this.outboxPoller = params.outboxPoller;
  }

  async createBuyNowOrder(
    params: IParamsCreateBuyNowOrder,
    actor: IActorContext,
  ): Promise<IOrder> {
    assertActorPresent(actor);
    const buyerId = actor.actorId;

    const listing = await this.listingsClient.getListingForCheckout(
      params.listingId,
    );
    if (!listing) {
      throw {
        status: 404,
        errorCode: EErrorCode.RESOURCE_NOT_FOUND,
        message: 'Listing not found or not available',
        details: { listingId: params.listingId },
      } as IThrowedError;
    }

    if (!listing.buyNowEnabled) {
      throw {
        status: 409,
        errorCode: EErrorCode.LISTING_NOT_AVAILABLE_FOR_PURCHASE,
        message: 'Listing is not available for buy now',
        details: { listingId: params.listingId },
      } as IThrowedError;
    }

    if (listing.sellerId === buyerId) {
      throw {
        status: 403,
        errorCode: EErrorCode.FIELD_INVALID,
        message: 'Buyer cannot purchase own listing',
        details: { listingId: params.listingId },
      } as IThrowedError;
    }

    if (!listing.shippingModes.includes(params.shippingMode)) {
      throw {
        status: 400,
        errorCode: EErrorCode.FIELD_INVALID,
        message: 'shippingMode is not offered for this listing',
        details: {
          shippingMode: params.shippingMode,
          allowed: listing.shippingModes,
        },
      } as IThrowedError;
    }

    const orderId = params.id;
    const reservationExpiresAt = new Date(Date.now() + 15 * 60 * 1000);

    await this.listingsClient.reserve(params.listingId, orderId, actor);

    const orderEntity = new OrderServiceEntity({
      id: orderId,
      listingId: params.listingId,
      buyerId,
      sellerId: listing.sellerId,
      shippingMode: params.shippingMode,
      priceCents: listing.priceCents,
      currency: listing.currency,
      status: EOrderStatus.AWAITING_PAYMENT,
      reservationExpiresAt,
      createdAt: new Date(),
    });

    try {
      const order = await this.transactionRunner.runInTransaction(
        async (session) => {
          const created = await this.orderRepositoryWrite.createOrder(
            orderEntity,
            session,
          );
          await this.outboxService.enqueue(
            createEventEnvelope({
              eventId: randomUUID(),
              eventType: 'orders.order.created',
              aggregateId: created.id,
              producerModule: 'orders',
              correlationId: orderId,
              payload: {
                orderId: created.id,
                listingId: created.listingId,
                buyerId: created.buyerId,
                sellerId: created.sellerId,
                priceCents: created.priceCents,
                currency: created.currency,
              },
            }),
            session,
          );
          return created;
        },
      );

      await this.outboxPoller.drainPending();
      const refreshed = await this.orderRepositoryRead.findOrderById(order.id);
      return refreshed ?? order;
    } catch (error) {
      await this.listingsClient
        .release(params.listingId, orderId, actor)
        .catch(() => undefined);
      throw error;
    }
  }

  async getOrderById(id: string, actor: IActorContext): Promise<IOrder> {
    assertActorPresent(actor);
    const order = await this.orderRepositoryRead.findOrderById(id);
    if (!order || !this.canActorViewOrder(order, actor)) {
      throw {
        status: 404,
        errorCode: EErrorCode.RESOURCE_NOT_FOUND,
        message: 'Order not found',
        details: { id },
      } as IThrowedError;
    }
    return order;
  }

  async listOrders(
    actor: IActorContext,
    query: { page: number; pageSize: number; status?: EOrderStatus },
  ) {
    assertActorPresent(actor);
    const pageSize = Math.min(query.pageSize, MAX_PAGE_SIZE);
    if (pageSize < 1) {
      throw {
        status: 400,
        errorCode: EErrorCode.INVALID_PAGE_SIZE,
        message: 'pageSize must be between 1 and 50',
      } as IThrowedError;
    }
    return this.orderRepositoryRead.listOrdersByActor({
      actorId: actor.actorId,
      page: query.page,
      pageSize,
      status: query.status,
    });
  }

  async confirmOrderFromEscrow(envelope: IEventEnvelope): Promise<void> {
    const payload = envelope.payload as TEscrowHeldPayload;
    const orderId = payload.orderId ?? envelope.aggregateId;
    if (!orderId) {
      return;
    }

    const order = await this.orderRepositoryRead.findOrderById(orderId);
    if (!order || order.status !== EOrderStatus.AWAITING_PAYMENT) {
      return;
    }

    const systemActor = systemActorContext();

    await this.transactionRunner.runInTransaction(async (session) => {
      const updated = await this.orderRepositoryWrite.updateOrderStatus(
        orderId,
        EOrderStatus.CONFIRMED,
        session,
      );
      if (!updated) {
        return;
      }
      await this.outboxService.enqueue(
        createEventEnvelope({
          eventId: randomUUID(),
          eventType: 'orders.order.confirmed',
          aggregateId: orderId,
          producerModule: 'orders',
          correlationId: envelope.correlationId,
          payload: {
            orderId,
            listingId: updated.listingId,
            buyerId: updated.buyerId,
            sellerId: updated.sellerId,
          },
        }),
        session,
      );
    });

    await this.listingsClient.markSold(
      order.listingId,
      orderId,
      systemActor,
    );

    await this.outboxPoller.drainPending();
  }

  async isCompletedPurchase(orderId: string, buyerId: string): Promise<boolean> {
    const order = await this.orderRepositoryRead.findOrderById(orderId);
    return (
      !!order &&
      order.buyerId === buyerId &&
      order.status === EOrderStatus.CONFIRMED
    );
  }

  private canActorViewOrder(
    order: import('../entity/interfaces/order.interface').IOrder,
    actor: IActorContext,
  ): boolean {
    return (
      order.buyerId === actor.actorId || order.sellerId === actor.actorId
    );
  }
}
