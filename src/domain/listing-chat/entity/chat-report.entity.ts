import { requireNonEmptyString } from '../../common/types/required-string';
import { EChatReportTargetType } from './enums/EChatReportTargetType';
import { IChatReport } from './interfaces/chat-report.interface';

const MIN_REASON_LENGTH = 3;
const MAX_REASON_LENGTH = 500;

export class ChatReportServiceEntity implements IChatReport {
  id: string;
  reporterId: string;
  targetType: EChatReportTargetType;
  targetId: string;
  conversationId: string;
  reason: string;
  createdAt: Date;
  updatedAt?: Date;

  constructor(report: IChatReport) {
    this.validate(report);
    this.id = report.id;
    this.reporterId = report.reporterId.trim();
    this.targetType = report.targetType;
    this.targetId = report.targetId.trim();
    this.conversationId = report.conversationId.trim();
    this.reason = report.reason.trim();
    this.createdAt = report.createdAt;
    this.updatedAt = report.updatedAt;
  }

  private validate(report: IChatReport): void {
    requireNonEmptyString(report.id, 'id');
    requireNonEmptyString(report.reporterId, 'reporterId');
    if (!report.targetType) throw new Error('targetType is required');
    requireNonEmptyString(report.targetId, 'targetId');
    requireNonEmptyString(report.conversationId, 'conversationId');
    if (!report.createdAt) throw new Error('createdAt is required');

    const reason = report.reason?.trim() ?? '';
    if (reason.length < MIN_REASON_LENGTH) {
      throw new Error(`reason must be at least ${MIN_REASON_LENGTH} characters`);
    }
    if (reason.length > MAX_REASON_LENGTH) {
      throw new Error(`reason must not exceed ${MAX_REASON_LENGTH} characters`);
    }
  }
}

export {
  MIN_REASON_LENGTH as CHAT_REPORT_MIN_REASON_LENGTH,
  MAX_REASON_LENGTH as CHAT_REPORT_MAX_REASON_LENGTH,
};
