import { IThrowedError, serviceLogErrorHandler } from '@sauvvitech/st-packages';
import { EErrorCode } from '../../../domain/common/errors/enums/EErrorCode';
import { getMongooseSession } from '../../messaging/outbox/outbox.repository.write';
import { IOutboxSession } from '../../../domain/common/messaging/outbox/outbox.repository.write';
import { IPayment } from '../../../domain/payments/entity/interfaces/payment.interface';
import { IPaymentRepositoryWrite } from '../../../domain/payments/repository/payment.repository.write';
import { PaymentModel } from '../../db/mongo/models/payment.model';
import { dbToInternal, internalToDb } from './adapters/payment.adapter';

export class PaymentRepositoryWrite implements IPaymentRepositoryWrite {
  async createPayment(
    payment: IPayment,
    session?: IOutboxSession,
  ): Promise<IPayment> {
    try {
      const mongooseSession = getMongooseSession(session);
      const doc = await PaymentModel.create(
        [internalToDb(payment)],
        mongooseSession ? { session: mongooseSession } : {},
      );
      return dbToInternal(doc[0]!);
    } catch (error: any) {
      serviceLogErrorHandler(error, {
        eventName: 'PaymentRepositoryWrite.createPayment',
        eventData: { paymentId: payment.id },
      });
      throw {
        status: 500,
        errorCode: EErrorCode.DATABASE_ERROR,
      } as IThrowedError;
    }
  }
}
