import { IPayment } from '../entity/interfaces/payment.interface';
import { IOutboxSession } from '../../common/messaging/outbox/outbox.repository.write';

export interface IPaymentRepositoryWrite {
  createPayment(payment: IPayment, session?: IOutboxSession): Promise<IPayment>;
}
