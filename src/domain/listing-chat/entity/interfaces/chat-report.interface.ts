import { EChatReportTargetType } from '../enums/EChatReportTargetType';

export interface IChatReport {
  id: string;
  reporterId: string;
  targetType: EChatReportTargetType;
  targetId: string;
  conversationId: string;
  reason: string;
  createdAt: Date;
  updatedAt?: Date;
}
