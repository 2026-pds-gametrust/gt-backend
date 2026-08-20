import { IThrowedError, serviceLogErrorHandler } from '@sauvvitech/st-packages';
import { EErrorCode } from '../../../domain/common/errors/enums/EErrorCode';
import { IPaginatedResult } from '../../../domain/common/types/pagination';
import { EOrderStatus } from '../../../domain/orders/entity/enums/EOrderStatus';
import { IOrder } from '../../../domain/orders/entity/interfaces/order.interface';
import { IOrderRepositoryRead } from '../../../domain/orders/repository/order.repository.read';
import { OrderModel } from '../../db/mongo/models/order.model';
import { dbToInternal } from './adapters/order.adapter';

export class OrderRepositoryRead implements IOrderRepositoryRead {
  async findOrderById(id: string): Promise<IOrder | null> {
    try {
      const doc = await OrderModel.findOne({ id });
      return doc ? dbToInternal(doc) : null;
    } catch (error: any) {
      serviceLogErrorHandler(error, {
        eventName: 'OrderRepositoryRead.findOrderById',
        eventData: { id },
      });
      throw {
        status: 500,
        errorCode: EErrorCode.DATABASE_ERROR,
      } as IThrowedError;
    }
  }

  async listOrdersByActor(params: {
    actorId: string;
    page: number;
    pageSize: number;
    status?: EOrderStatus;
  }): Promise<IPaginatedResult<IOrder>> {
    try {
      const filter: Record<string, unknown> = {
        $or: [{ buyerId: params.actorId }, { sellerId: params.actorId }],
      };
      if (params.status) {
        filter.status = params.status;
      }
      const skip = (params.page - 1) * params.pageSize;
      const [docs, total] = await Promise.all([
        OrderModel.find(filter)
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(params.pageSize),
        OrderModel.countDocuments(filter),
      ]);
      return {
        items: docs.map(dbToInternal),
        page: params.page,
        pageSize: params.pageSize,
        total,
      };
    } catch (error: any) {
      serviceLogErrorHandler(error, {
        eventName: 'OrderRepositoryRead.listOrdersByActor',
        eventData: params,
      });
      throw {
        status: 500,
        errorCode: EErrorCode.DATABASE_ERROR,
      } as IThrowedError;
    }
  }
}
