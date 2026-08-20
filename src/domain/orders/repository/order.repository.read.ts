import { IPaginationQuery, IPaginatedResult } from '../../common/types/pagination';
import { EOrderStatus } from '../entity/enums/EOrderStatus';
import { IOrder } from '../entity/interfaces/order.interface';

export interface IOrderRepositoryRead {
  findOrderById(id: string): Promise<IOrder | null>;
  listOrdersByActor(params: {
    actorId: string;
    page: number;
    pageSize: number;
    status?: EOrderStatus;
  }): Promise<IPaginatedResult<IOrder>>;
}
