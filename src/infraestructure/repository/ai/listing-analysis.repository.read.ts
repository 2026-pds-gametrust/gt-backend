import { IThrowedError, serviceLogErrorHandler } from '@sauvvitech/st-packages';
import { EErrorCode } from '../../../domain/common/errors/enums/EErrorCode';
import { EListingAnalysisScope } from '../../../domain/ai/entity/enums/EListingAnalysisScope';
import { IListingAnalysis } from '../../../domain/ai/entity/interfaces/listing-analysis.interface';
import { IListingAnalysisRepositoryRead } from '../../../domain/ai/repository/listing-analysis.repository.read';
import { ListingAnalysisModel } from '../../db/mongo/models/listing-analysis.model';
import { dbToInternal } from './adapters/listing-analysis.adapter';

export class ListingAnalysisRepositoryRead implements IListingAnalysisRepositoryRead {
  async findLatestByListingIdAndScope(
    listingId: string,
    scope: EListingAnalysisScope,
  ): Promise<IListingAnalysis | null> {
    try {
      const doc = await ListingAnalysisModel.findOne({ listingId, scope })
        .sort({ createdAt: -1 })
        .limit(1);
      return doc ? dbToInternal(doc) : null;
    } catch (error: any) {
      serviceLogErrorHandler(error, {
        eventName:
          'ListingAnalysisRepositoryRead.findLatestByListingIdAndScope',
        eventData: { listingId, scope },
      });
      throw {
        status: 500,
        errorCode: EErrorCode.DATABASE_ERROR,
      } as IThrowedError;
    }
  }

  async findListingAnalysisById(id: string): Promise<IListingAnalysis | null> {
    try {
      const doc = await ListingAnalysisModel.findOne({ id });
      return doc ? dbToInternal(doc) : null;
    } catch (error: any) {
      serviceLogErrorHandler(error, {
        eventName: 'ListingAnalysisRepositoryRead.findListingAnalysisById',
        eventData: { id },
      });
      throw {
        status: 500,
        errorCode: EErrorCode.DATABASE_ERROR,
      } as IThrowedError;
    }
  }

  async findLatestByListingId(listingId: string): Promise<IListingAnalysis | null> {
    try {
      const doc = await ListingAnalysisModel.findOne({ listingId })
        .sort({ createdAt: -1 })
        .limit(1);
      return doc ? dbToInternal(doc) : null;
    } catch (error: any) {
      serviceLogErrorHandler(error, {
        eventName: 'ListingAnalysisRepositoryRead.findLatestByListingId',
        eventData: { listingId },
      });
      throw {
        status: 500,
        errorCode: EErrorCode.DATABASE_ERROR,
      } as IThrowedError;
    }
  }
}
