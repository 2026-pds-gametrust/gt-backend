import { EChatReportTargetType } from '../entity/enums/EChatReportTargetType';
import { IChatReport } from '../entity/interfaces/chat-report.interface';

export interface IChatReportCursor {
  createdAt: string;
  id: string;
}

export interface IParamsListChatReports {
  limit: number;
  cursor?: IChatReportCursor;
}

export interface IChatReportRepositoryRead {
  findByReporterTarget(
    reporterId: string,
    targetType: EChatReportTargetType,
    targetId: string,
  ): Promise<IChatReport | null>;
  listReports(params: IParamsListChatReports): Promise<IChatReport[]>;
}

export interface IChatReportRepositoryWrite {
  upsertReport(report: IChatReport): Promise<IChatReport>;
}
