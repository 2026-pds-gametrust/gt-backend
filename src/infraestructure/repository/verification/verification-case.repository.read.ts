import { IThrowedError, serviceLogErrorHandler } from '@sauvvitech/st-packages';
import { EErrorCode } from '../../../domain/common/errors/enums/EErrorCode';
import { EVerificationCaseStatus } from '../../../domain/verification/entity/enums/EVerificationCaseStatus';
import { IVerificationCase } from '../../../domain/verification/entity/interfaces/verification-case.interface';
import {
  IModerationQueueSearchScope,
  IModerationQueueStats,
} from '../../../domain/verification/entity/interfaces/moderation-queue.interface';
import {
  IParamsListModerationQueueQuery,
  IVerificationCaseRepositoryRead,
} from '../../../domain/verification/repository/verification-case.repository.read';
import { VerificationCaseModel } from '../../db/mongo/models/verification-case.model';
import { dbToInternal } from './adapters/verification-case.adapter';
import { buildModerationQueueFilter } from './moderation-queue-filter';

export class VerificationCaseRepositoryRead
  implements IVerificationCaseRepositoryRead
{
  async findVerificationCaseById(
    id: string,
  ): Promise<IVerificationCase | null> {
    try {
      const doc = await VerificationCaseModel.findOne({ id });
      return doc ? dbToInternal(doc) : null;
    } catch (error: any) {
      serviceLogErrorHandler(error, {
        eventName: 'VerificationCaseRepositoryRead.findVerificationCaseById',
        eventData: { id },
      });
      throw {
        status: 500,
        errorCode: EErrorCode.DATABASE_ERROR,
      } as IThrowedError;
    }
  }

  async findLatestChangesRequestedCaseByListingId(
    listingId: string,
  ): Promise<IVerificationCase | null> {
    try {
      const doc = await VerificationCaseModel.findOne({
        listingId,
        status: EVerificationCaseStatus.CHANGES_REQUESTED,
      }).sort({ updatedAt: -1, createdAt: -1 });
      return doc ? dbToInternal(doc) : null;
    } catch (error: any) {
      serviceLogErrorHandler(error, {
        eventName:
          'VerificationCaseRepositoryRead.findLatestChangesRequestedCaseByListingId',
        eventData: { listingId },
      });
      throw {
        status: 500,
        errorCode: EErrorCode.DATABASE_ERROR,
      } as IThrowedError;
    }
  }

  async findOpenCaseByListingId(
    listingId: string,
  ): Promise<IVerificationCase | null> {
    try {
      const doc = await VerificationCaseModel.findOne({
        listingId,
        status: {
          $in: [
            EVerificationCaseStatus.PENDING,
            EVerificationCaseStatus.IN_REVIEW,
          ],
        },
      });
      return doc ? dbToInternal(doc) : null;
    } catch (error: any) {
      serviceLogErrorHandler(error, {
        eventName: 'VerificationCaseRepositoryRead.findOpenCaseByListingId',
        eventData: { listingId },
      });
      throw {
        status: 500,
        errorCode: EErrorCode.DATABASE_ERROR,
      } as IThrowedError;
    }
  }

  async listVerificationCases(
    filter: Partial<IVerificationCase> = {},
  ): Promise<IVerificationCase[]> {
    try {
      const docs = await VerificationCaseModel.find(filter);
      return docs.map(dbToInternal);
    } catch (error: any) {
      serviceLogErrorHandler(error, {
        eventName: 'VerificationCaseRepositoryRead.listVerificationCases',
        eventData: { filter },
      });
      throw {
        status: 500,
        errorCode: EErrorCode.DATABASE_ERROR,
      } as IThrowedError;
    }
  }

  async listModerationQueue(
    params: IParamsListModerationQueueQuery,
  ): Promise<IVerificationCase[]> {
    try {
      const filter = buildModerationQueueFilter(params.scope, params.status);
      const docs = await VerificationCaseModel.find(filter)
        .sort({ createdAt: -1 })
        .skip(params.offset)
        .limit(params.limit);
      return docs.map(dbToInternal);
    } catch (error: any) {
      serviceLogErrorHandler(error, {
        eventName: 'VerificationCaseRepositoryRead.listModerationQueue',
        eventData: { params },
      });
      throw {
        status: 500,
        errorCode: EErrorCode.DATABASE_ERROR,
      } as IThrowedError;
    }
  }

  async countModerationQueue(
    params: IParamsListModerationQueueQuery,
  ): Promise<number> {
    try {
      const filter = buildModerationQueueFilter(params.scope, params.status);
      return VerificationCaseModel.countDocuments(filter);
    } catch (error: any) {
      serviceLogErrorHandler(error, {
        eventName: 'VerificationCaseRepositoryRead.countModerationQueue',
        eventData: { params },
      });
      throw {
        status: 500,
        errorCode: EErrorCode.DATABASE_ERROR,
      } as IThrowedError;
    }
  }

  async countModerationQueueStats(
    scope: IModerationQueueSearchScope,
  ): Promise<IModerationQueueStats> {
    try {
      const filter = buildModerationQueueFilter(scope);
      const rows = await VerificationCaseModel.aggregate<{
        _id: EVerificationCaseStatus;
        count: number;
      }>([
        { $match: filter },
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ]);

      const stats: IModerationQueueStats = {
        total: 0,
        pending: 0,
        inReview: 0,
        approved: 0,
        changesRequested: 0,
        rejected: 0,
      };

      for (const row of rows) {
        stats.total += row.count;
        switch (row._id) {
          case EVerificationCaseStatus.PENDING:
            stats.pending = row.count;
            break;
          case EVerificationCaseStatus.IN_REVIEW:
            stats.inReview = row.count;
            break;
          case EVerificationCaseStatus.APPROVED:
            stats.approved = row.count;
            break;
          case EVerificationCaseStatus.CHANGES_REQUESTED:
            stats.changesRequested = row.count;
            break;
          case EVerificationCaseStatus.REJECTED:
            stats.rejected = row.count;
            break;
          default:
            break;
        }
      }

      return stats;
    } catch (error: any) {
      serviceLogErrorHandler(error, {
        eventName: 'VerificationCaseRepositoryRead.countModerationQueueStats',
        eventData: { scope },
      });
      throw {
        status: 500,
        errorCode: EErrorCode.DATABASE_ERROR,
      } as IThrowedError;
    }
  }

  async findCasesByListingIds(
    listingIds: string[],
  ): Promise<IVerificationCase[]> {
    if (listingIds.length === 0) {
      return [];
    }
    try {
      const docs = await VerificationCaseModel.find({
        listingId: { $in: listingIds },
      }).sort({ updatedAt: -1, createdAt: -1 });
      return docs.map(dbToInternal);
    } catch (error: any) {
      serviceLogErrorHandler(error, {
        eventName: 'VerificationCaseRepositoryRead.findCasesByListingIds',
        eventData: { listingIdsCount: listingIds.length },
      });
      throw {
        status: 500,
        errorCode: EErrorCode.DATABASE_ERROR,
      } as IThrowedError;
    }
  }
}
