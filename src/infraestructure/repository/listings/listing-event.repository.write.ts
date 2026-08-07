import { IThrowedError, serviceLogErrorHandler } from '@sauvvitech/st-packages';
import { EErrorCode } from '../../../domain/common/errors/enums/EErrorCode';
import { IListingEvent } from '../../../domain/listings/entity/interfaces/listing-event.interface';
import { IListingEventRepositoryWrite } from '../../../domain/listings/repository/listing-event.repository.write';
import { ListingEventModel } from '../../db/mongo/models/listing-event.model';
import { dbToInternal, internalToDb } from './adapters/listing-event.adapter';

export class ListingEventRepositoryWrite
  implements IListingEventRepositoryWrite
{
  async appendListingEvent(event: IListingEvent): Promise<IListingEvent> {
    try {
      const doc = await ListingEventModel.create(internalToDb(event));
      return dbToInternal(doc);
    } catch (error: any) {
      serviceLogErrorHandler(error, {
        eventName: 'ListingEventRepositoryWrite.appendListingEvent',
        eventData: { event },
      });
      throw {
        status: 500,
        errorCode: EErrorCode.DATABASE_ERROR,
      } as IThrowedError;
    }
  }
}
