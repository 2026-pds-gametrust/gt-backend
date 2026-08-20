import { IVerificationCase } from '../entity/interfaces/verification-case.interface';
import {
  IModerationQueueSearchScope,
  IModerationQueueStats,
} from '../entity/interfaces/moderation-queue.interface';

import { EVerificationCaseStatus } from '../entity/enums/EVerificationCaseStatus';

export interface IParamsListModerationQueueQuery {
  scope: IModerationQueueSearchScope;
  status?: EVerificationCaseStatus;
  limit: number;
  offset: number;
}

export interface IVerificationCaseRepositoryRead {
  findVerificationCaseById(id: string): Promise<IVerificationCase | null>;
  findLatestChangesRequestedCaseByListingId(
    listingId: string,
  ): Promise<IVerificationCase | null>;
  findOpenCaseByListingId(listingId: string): Promise<IVerificationCase | null>;
  listVerificationCases(
    filter?: Partial<IVerificationCase>,
  ): Promise<IVerificationCase[]>;
  listModerationQueue(
    params: IParamsListModerationQueueQuery,
  ): Promise<IVerificationCase[]>;
  countModerationQueue(
    params: IParamsListModerationQueueQuery,
  ): Promise<number>;
  countModerationQueueStats(
    scope: IModerationQueueSearchScope,
  ): Promise<IModerationQueueStats>;
  findCasesByListingIds(listingIds: string[]): Promise<IVerificationCase[]>;
}
