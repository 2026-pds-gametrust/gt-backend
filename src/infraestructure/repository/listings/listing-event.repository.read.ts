import { IThrowedError, serviceLogErrorHandler } from '@sauvvitech/st-packages';
import { EErrorCode } from '../../../domain/common/errors/enums/EErrorCode';
import { IListingEvent } from '../../../domain/listings/entity/interfaces/listing-event.interface';
import { IListingEventRepositoryRead } from '../../../domain/listings/repository/listing-event.repository.read';
import { ListingEventModel } from '../../db/mongo/models/listing-event.model';
import { dbToInternal } from './adapters/listing-event.adapter';

export class ListingEventRepositoryRead
  implements IListingEventRepositoryRead
{
  async listByListingId(listingId: string): Promise<IListingEvent[]> {
    try {
      const docs = await ListingEventModel.find({ listingId }).sort({
        occurredAt: 1,
      });
      return docs.map(dbToInternal);
    } catch (error: any) {
      serviceLogErrorHandler(error, {
        eventName: 'ListingEventRepositoryRead.listByListingId',
        eventData: { listingId },
      });
      throw {
        status: 500,
        errorCode: EErrorCode.DATABASE_ERROR,
      } as IThrowedError;
    }
  }
}
