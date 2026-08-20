import { IPayment } from '../entity/interfaces/payment.interface';

export interface IPaymentRepositoryRead {
  findByOrderId(orderId: string): Promise<IPayment | null>;
}
