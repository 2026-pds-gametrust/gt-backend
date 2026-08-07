import { IThrowedError } from '@sauvvitech/st-packages';
import { randomUUID } from 'crypto';
import { EErrorCode } from '../../common/errors/enums/EErrorCode';
import { createEventEnvelope } from '../../common/messaging/event-envelope';
import { IEventPublisher } from '../../common/messaging/event-publisher.interface';
import { IListingRepositoryRead } from '../../listings/repository/listing.repository.read';
import { VerificationCaseServiceEntity } from '../entity/verification-case.entity';
import { ESealType } from '../entity/enums/ESealType';
import { EVerificationCaseStatus } from '../entity/enums/EVerificationCaseStatus';
import { IVerificationCase } from '../entity/interfaces/verification-case.interface';
import { IVerificationCaseRepositoryRead } from '../repository/verification-case.repository.read';
import { IVerificationCaseRepositoryWrite } from '../repository/verification-case.repository.write';
import { ISealService } from './seal.service.interface';
import {
  IParamsApproveCase,
  IParamsAssignReviewer,
  IParamsOpenVerificationCase,
  IParamsRejectCase,
  IParamsVerificationCaseService,
  IVerificationCaseService,
} from './verification-case.service.interface';

const ALLOWED_TRANSITIONS: Record<
  EVerificationCaseStatus,
  EVerificationCaseStatus[]
> = {
  [EVerificationCaseStatus.PENDING]: [EVerificationCaseStatus.IN_REVIEW],
  [EVerificationCaseStatus.IN_REVIEW]: [
    EVerificationCaseStatus.APPROVED,
    EVerificationCaseStatus.REJECTED,
  ],
  [EVerificationCaseStatus.APPROVED]: [],
  [EVerificationCaseStatus.REJECTED]: [],
};

export class VerificationCaseService implements IVerificationCaseService {
  private readonly verificationCaseRepositoryRead: IVerificationCaseRepositoryRead;
  private readonly verificationCaseRepositoryWrite: IVerificationCaseRepositoryWrite;
  private readonly listingRepositoryRead: IListingRepositoryRead;
  private readonly sealService: ISealService;
  private readonly eventPublisher: IEventPublisher;

  constructor({
    verificationCaseRepositoryRead,
    verificationCaseRepositoryWrite,
    listingRepositoryRead,
    sealService,
    eventPublisher,
  }: IParamsVerificationCaseService) {
    this.verificationCaseRepositoryRead = verificationCaseRepositoryRead;
    this.verificationCaseRepositoryWrite = verificationCaseRepositoryWrite;
    this.listingRepositoryRead = listingRepositoryRead;
    this.sealService = sealService;
    this.eventPublisher = eventPublisher;
  }

  async openCase(
    params: IParamsOpenVerificationCase,
  ): Promise<IVerificationCase> {
    const listing = await this.listingRepositoryRead.findListingById(
      params.listingId,
    );
    if (!listing) {
      throw {
        status: 404,
        errorCode: EErrorCode.RESOURCE_NOT_FOUND,
        message: 'Listing not found',
        details: { listingId: params.listingId },
      } as IThrowedError;
    }

    const openCase =
      await this.verificationCaseRepositoryRead.findOpenCaseByListingId(
        params.listingId,
      );
    if (openCase) {
      throw {
        status: 409,
        errorCode: EErrorCode.RESOURCE_CONFLICT,
        message: 'Listing already has an open verification case',
        details: { listingId: params.listingId, caseId: openCase.id },
      } as IThrowedError;
    }

    const entity = new VerificationCaseServiceEntity({
      id: params.id,
      listingId: params.listingId,
      status: EVerificationCaseStatus.PENDING,
      checklist: params.checklist,
      createdAt: new Date(),
    });

    const created =
      await this.verificationCaseRepositoryWrite.createVerificationCase(entity);

    await this.eventPublisher.publish(
      createEventEnvelope({
        eventId: randomUUID(),
        eventType: 'verification.case.submitted',
        aggregateId: created.id,
        producerModule: 'verification',
        correlationId: randomUUID(),
        payload: {
          caseId: created.id,
          listingId: created.listingId,
        },
      }),
    );

    return created;
  }

  async ensureOpenCaseForListing(
    listingId: string,
  ): Promise<IVerificationCase> {
    const openCase =
      await this.verificationCaseRepositoryRead.findOpenCaseByListingId(
        listingId,
      );
    if (openCase) {
      return openCase;
    }

    try {
      return await this.openCase({
        id: randomUUID(),
        listingId,
      });
    } catch (error) {
      const throwed = error as IThrowedError;
      if (throwed?.status === 409) {
        const raced =
          await this.verificationCaseRepositoryRead.findOpenCaseByListingId(
            listingId,
          );
        if (raced) {
          return raced;
        }
      }
      throw error;
    }
  }

  async getVerificationCaseById(id: string): Promise<IVerificationCase> {
    const verificationCase =
      await this.verificationCaseRepositoryRead.findVerificationCaseById(id);
    if (!verificationCase) {
      throw {
        status: 404,
        errorCode: EErrorCode.RESOURCE_NOT_FOUND,
        message: 'Verification case not found',
        details: { id },
      } as IThrowedError;
    }
    return verificationCase;
  }

  async listVerificationCases(
    filter: Partial<IVerificationCase> = {},
  ): Promise<IVerificationCase[]> {
    return this.verificationCaseRepositoryRead.listVerificationCases(filter);
  }

  async assignReviewer(
    id: string,
    params: IParamsAssignReviewer,
  ): Promise<IVerificationCase> {
    const existing = await this.getVerificationCaseById(id);
    this.assertTransition(
      existing.status,
      EVerificationCaseStatus.IN_REVIEW,
    );

    if (!params.moderatorId?.trim()) {
      throw {
        status: 400,
        errorCode: EErrorCode.FIELD_INVALID,
        message: 'moderatorId is required',
        details: { field: 'moderatorId' },
      } as IThrowedError;
    }

    const updated =
      await this.verificationCaseRepositoryWrite.updateVerificationCaseById(
        id,
        {
          status: EVerificationCaseStatus.IN_REVIEW,
          moderatorId: params.moderatorId,
        },
      );
    if (!updated) {
      throw {
        status: 404,
        errorCode: EErrorCode.RESOURCE_NOT_FOUND,
        message: 'Verification case not found',
        details: { id },
      } as IThrowedError;
    }
    return updated;
  }

  async approveCase(
    id: string,
    params: IParamsApproveCase = {},
  ): Promise<IVerificationCase> {
    const existing = await this.getVerificationCaseById(id);
    this.assertTransition(
      existing.status,
      EVerificationCaseStatus.APPROVED,
    );

    const listing = await this.listingRepositoryRead.findListingById(
      existing.listingId,
    );
    if (!listing) {
      throw {
        status: 404,
        errorCode: EErrorCode.RESOURCE_NOT_FOUND,
        message: 'Listing not found',
        details: { listingId: existing.listingId },
      } as IThrowedError;
    }

    const updated =
      await this.verificationCaseRepositoryWrite.updateVerificationCaseById(
        id,
        {
          status: EVerificationCaseStatus.APPROVED,
          decisionReason: params.decisionReason,
        },
      );
    if (!updated) {
      throw {
        status: 404,
        errorCode: EErrorCode.RESOURCE_NOT_FOUND,
        message: 'Verification case not found',
        details: { id },
      } as IThrowedError;
    }

    const approvedEventId = randomUUID();
    await this.eventPublisher.publish(
      createEventEnvelope({
        eventId: approvedEventId,
        eventType: 'verification.case.approved',
        aggregateId: updated.id,
        producerModule: 'verification',
        correlationId: randomUUID(),
        payload: {
          caseId: updated.id,
          listingId: updated.listingId,
        },
      }),
    );

    await this.sealService.grantSeal({
      id: randomUUID(),
      listingId: updated.listingId,
      caseId: updated.id,
      type: params.sealType ?? ESealType.POSSESSION,
      sellerId: listing.sellerId,
      sourceEventId: `seal-granted:${updated.id}`,
    });

    return updated;
  }

  async rejectCase(
    id: string,
    params: IParamsRejectCase,
  ): Promise<IVerificationCase> {
    const existing = await this.getVerificationCaseById(id);
    this.assertTransition(
      existing.status,
      EVerificationCaseStatus.REJECTED,
    );

    if (!params.reason?.trim()) {
      throw {
        status: 400,
        errorCode: EErrorCode.FIELD_INVALID,
        message: 'reason is required to reject',
        details: { field: 'reason' },
      } as IThrowedError;
    }

    const updated =
      await this.verificationCaseRepositoryWrite.updateVerificationCaseById(
        id,
        {
          status: EVerificationCaseStatus.REJECTED,
          decisionReason: params.reason,
        },
      );
    if (!updated) {
      throw {
        status: 404,
        errorCode: EErrorCode.RESOURCE_NOT_FOUND,
        message: 'Verification case not found',
        details: { id },
      } as IThrowedError;
    }

    await this.eventPublisher.publish(
      createEventEnvelope({
        eventId: randomUUID(),
        eventType: 'verification.case.rejected',
        aggregateId: updated.id,
        producerModule: 'verification',
        correlationId: randomUUID(),
        payload: {
          caseId: updated.id,
          listingId: updated.listingId,
          reason: params.reason,
        },
      }),
    );

    return updated;
  }

  private assertTransition(
    from: EVerificationCaseStatus,
    to: EVerificationCaseStatus,
  ): void {
    const allowed = ALLOWED_TRANSITIONS[from] ?? [];
    if (!allowed.includes(to)) {
      throw {
        status: 409,
        errorCode: EErrorCode.RESOURCE_CONFLICT,
        message: 'Invalid verification case status transition',
        details: { from, to },
      } as IThrowedError;
    }
  }
}
