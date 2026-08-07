import { IEventPublisher } from '../../common/messaging/event-publisher.interface';
import { IListingRepositoryRead } from '../../listings/repository/listing.repository.read';
import { ESealType } from '../entity/enums/ESealType';
import { IVerificationCase } from '../entity/interfaces/verification-case.interface';
import { IVerificationCaseRepositoryRead } from '../repository/verification-case.repository.read';
import { IVerificationCaseRepositoryWrite } from '../repository/verification-case.repository.write';
import { ISealService } from './seal.service.interface';

export interface IParamsOpenVerificationCase {
  id: string;
  listingId: string;
  checklist?: Record<string, unknown>;
}

export interface IParamsAssignReviewer {
  moderatorId: string;
}

export interface IParamsRejectCase {
  reason: string;
}

export interface IParamsApproveCase {
  decisionReason?: string;
  sealType?: ESealType;
}

export interface IParamsVerificationCaseService {
  verificationCaseRepositoryRead: IVerificationCaseRepositoryRead;
  verificationCaseRepositoryWrite: IVerificationCaseRepositoryWrite;
  listingRepositoryRead: IListingRepositoryRead;
  sealService: ISealService;
  eventPublisher: IEventPublisher;
}

export interface IVerificationCaseService {
  openCase(params: IParamsOpenVerificationCase): Promise<IVerificationCase>;
  ensureOpenCaseForListing(listingId: string): Promise<IVerificationCase>;
  getVerificationCaseById(id: string): Promise<IVerificationCase>;
  listVerificationCases(
    filter?: Partial<IVerificationCase>,
  ): Promise<IVerificationCase[]>;
  assignReviewer(
    id: string,
    params: IParamsAssignReviewer,
  ): Promise<IVerificationCase>;
  approveCase(
    id: string,
    params?: IParamsApproveCase,
  ): Promise<IVerificationCase>;
  rejectCase(id: string, params: IParamsRejectCase): Promise<IVerificationCase>;
}
