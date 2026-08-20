import { IChatReport } from '../../../../domain/listing-chat/entity/interfaces/chat-report.interface';
import { IMChatReport } from '../../../db/mongo/models/listing-chat-report.model';

export function dbToInternal(doc: IMChatReport): IChatReport {
  return {
    id: doc.id,
    reporterId: doc.reporterId,
    targetType: doc.targetType,
    targetId: doc.targetId,
    conversationId: doc.conversationId,
    reason: doc.reason,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };
}

export function internalToDb(
  report: IChatReport,
): Omit<IMChatReport, '_id'> {
  return {
    id: report.id,
    reporterId: report.reporterId,
    targetType: report.targetType,
    targetId: report.targetId,
    conversationId: report.conversationId,
    reason: report.reason,
    createdAt: report.createdAt,
    updatedAt: report.updatedAt,
  };
}
