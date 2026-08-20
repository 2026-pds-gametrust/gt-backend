import { IThrowedError, serviceLogErrorHandler } from '@sauvvitech/st-packages';
import { EErrorCode } from '../../../domain/common/errors/enums/EErrorCode';
import { EChatReportTargetType } from '../../../domain/listing-chat/entity/enums/EChatReportTargetType';
import { IChatReport } from '../../../domain/listing-chat/entity/interfaces/chat-report.interface';
import {
  IChatReportRepositoryRead,
  IChatReportRepositoryWrite,
  IParamsListChatReports,
} from '../../../domain/listing-chat/repository/chat-report.repository.read';
import { ListingChatReportModel } from '../../db/mongo/models/listing-chat-report.model';
import { dbToInternal } from './adapters/chat-report.adapter';

export class ChatReportRepositoryRead implements IChatReportRepositoryRead {
  async findByReporterTarget(
    reporterId: string,
    targetType: EChatReportTargetType,
    targetId: string,
  ): Promise<IChatReport | null> {
    try {
      const doc = await ListingChatReportModel.findOne({
        reporterId,
        targetType,
        targetId,
      });
      return doc ? dbToInternal(doc) : null;
    } catch (error: unknown) {
      serviceLogErrorHandler(error instanceof Error ? error : new Error(String(error)), {
        eventName: 'ChatReportRepositoryRead.findByReporterTarget',
        eventData: { reporterId, targetType, targetId },
      });
      throw {
        status: 500,
        errorCode: EErrorCode.DATABASE_ERROR,
      } as IThrowedError;
    }
  }

  async listReports(params: IParamsListChatReports): Promise<IChatReport[]> {
    try {
      const filter: Record<string, unknown> = {};

      if (params.cursor) {
        const cursorDate = new Date(params.cursor.createdAt);
        filter.$or = [
          { createdAt: { $lt: cursorDate } },
          { createdAt: cursorDate, id: { $lt: params.cursor.id } },
        ];
      }

      const docs = await ListingChatReportModel.find(filter)
        .sort({ createdAt: -1, id: -1 })
        .limit(params.limit);

      return docs.map(dbToInternal);
    } catch (error: unknown) {
      serviceLogErrorHandler(error instanceof Error ? error : new Error(String(error)), {
        eventName: 'ChatReportRepositoryRead.listReports',
      });
      throw {
        status: 500,
        errorCode: EErrorCode.DATABASE_ERROR,
      } as IThrowedError;
    }
  }
}

export class ChatReportRepositoryWrite implements IChatReportRepositoryWrite {
  async upsertReport(report: IChatReport): Promise<IChatReport> {
    try {
      const doc = await ListingChatReportModel.findOneAndUpdate(
        {
          reporterId: report.reporterId,
          targetType: report.targetType,
          targetId: report.targetId,
        },
        {
          $set: {
            reason: report.reason,
            conversationId: report.conversationId,
            updatedAt: new Date(),
          },
          $setOnInsert: {
            id: report.id,
            createdAt: report.createdAt,
          },
        },
        { upsert: true, new: true, setDefaultsOnInsert: true },
      );
      return dbToInternal(doc);
    } catch (error: unknown) {
      serviceLogErrorHandler(error instanceof Error ? error : new Error(String(error)), {
        eventName: 'ChatReportRepositoryWrite.upsertReport',
        eventData: { id: report.id },
      });
      throw {
        status: 500,
        errorCode: EErrorCode.DATABASE_ERROR,
      } as IThrowedError;
    }
  }
}
