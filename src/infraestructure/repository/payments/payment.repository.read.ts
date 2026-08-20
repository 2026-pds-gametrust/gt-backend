import { IThrowedError, serviceLogErrorHandler } from '@sauvvitech/st-packages';
import { EErrorCode } from '../../../domain/common/errors/enums/EErrorCode';
import { IPayment } from '../../../domain/payments/entity/interfaces/payment.interface';
import { IPaymentRepositoryRead } from '../../../domain/payments/repository/payment.repository.read';
import { PaymentModel } from '../../db/mongo/models/payment.model';
import { dbToInternal } from './adapters/payment.adapter';

export class PaymentRepositoryRead implements IPaymentRepositoryRead {
  async findByOrderId(orderId: string): Promise<IPayment | null> {
    try {
      const doc = await PaymentModel.findOne({ orderId });
      return doc ? dbToInternal(doc) : null;
    } catch (error: any) {
      serviceLogErrorHandler(error, {
        eventName: 'PaymentRepositoryRead.findByOrderId',
        eventData: { orderId },
      });
      throw {
        status: 500,
        errorCode: EErrorCode.DATABASE_ERROR,
      } as IThrowedError;
    }
  }
}
