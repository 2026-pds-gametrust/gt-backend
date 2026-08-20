import { IThrowedError, serviceLogErrorHandler } from '@sauvvitech/st-packages';
import { EErrorCode } from '../../../domain/common/errors/enums/EErrorCode';
import { getMongooseSession } from '../../messaging/outbox/outbox.repository.write';
import { IOutboxSession } from '../../../domain/common/messaging/outbox/outbox.repository.write';
import { EOrderStatus } from '../../../domain/orders/entity/enums/EOrderStatus';
import { IOrder } from '../../../domain/orders/entity/interfaces/order.interface';
import { IOrderRepositoryWrite } from '../../../domain/orders/repository/order.repository.write';
import { OrderModel } from '../../db/mongo/models/order.model';
import { dbToInternal, internalToDb } from './adapters/order.adapter';

export class OrderRepositoryWrite implements IOrderRepositoryWrite {
  async createOrder(
    order: IOrder,
    session?: IOutboxSession,
  ): Promise<IOrder> {
    try {
      const mongooseSession = getMongooseSession(session);
      const doc = await OrderModel.create(
        [internalToDb(order)],
        mongooseSession ? { session: mongooseSession } : {},
      );
      return dbToInternal(doc[0]!);
    } catch (error: any) {
      serviceLogErrorHandler(error, {
        eventName: 'OrderRepositoryWrite.createOrder',
        eventData: { orderId: order.id },
      });
      throw {
        status: 500,
        errorCode: EErrorCode.DATABASE_ERROR,
      } as IThrowedError;
    }
  }

  async updateOrderStatus(
    id: string,
    status: EOrderStatus,
    session?: IOutboxSession,
  ): Promise<IOrder | null> {
    try {
      const mongooseSession = getMongooseSession(session);
      const doc = await OrderModel.findOneAndUpdate(
        { id },
        { $set: { status } },
        { new: true, session: mongooseSession },
      );
      return doc ? dbToInternal(doc) : null;
    } catch (error: any) {
      serviceLogErrorHandler(error, {
        eventName: 'OrderRepositoryWrite.updateOrderStatus',
        eventData: { id, status },
      });
      throw {
        status: 500,
        errorCode: EErrorCode.DATABASE_ERROR,
      } as IThrowedError;
    }
  }
}
