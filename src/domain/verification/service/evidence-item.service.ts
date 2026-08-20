import { IThrowedError } from '@sauvvitech/st-packages';
import { randomUUID } from 'crypto';
import { assertOwnerOrAdmin } from '../../common/auth/actor-authorization';
import { EErrorCode } from '../../common/errors/enums/EErrorCode';
import { createEventEnvelope } from '../../common/messaging/event-envelope';
import { IActorContext } from '../../common/types/actor-context';
import { IListingRepositoryRead } from '../../listings/repository/listing.repository.read';
import { EvidenceItemServiceEntity } from '../entity/evidence-item.entity';
import { IEvidenceItem } from '../entity/interfaces/evidence-item.interface';
import { IEvidenceItemRepositoryRead } from '../repository/evidence-item.repository.read';
import { IEvidenceItemRepositoryWrite } from '../repository/evidence-item.repository.write';
import { IVerificationCaseRepositoryRead } from '../repository/verification-case.repository.read';
import { IMediaClient } from '../../media/client/media.client';
import { EMediaPurpose } from '../../media/entity/enums/EMediaPurpose';
import {
  IEvidenceItemService,
  IParamsAddEvidence,
  IParamsEvidenceItemService,
} from './evidence-item.service.interface';

export class EvidenceItemService implements IEvidenceItemService {
  private readonly evidenceItemRepositoryRead: IEvidenceItemRepositoryRead;
  private readonly evidenceItemRepositoryWrite: IEvidenceItemRepositoryWrite;
  private readonly verificationCaseRepositoryRead: IVerificationCaseRepositoryRead;
  private readonly listingRepositoryRead: IListingRepositoryRead;
  private readonly mediaClient?: IMediaClient;
  private readonly eventPublisher: IParamsEvidenceItemService['eventPublisher'];

  constructor({
    evidenceItemRepositoryRead,
    evidenceItemRepositoryWrite,
    verificationCaseRepositoryRead,
    listingRepositoryRead,
    mediaClient,
    eventPublisher,
  }: IParamsEvidenceItemService) {
    this.evidenceItemRepositoryRead = evidenceItemRepositoryRead;
    this.evidenceItemRepositoryWrite = evidenceItemRepositoryWrite;
    this.verificationCaseRepositoryRead = verificationCaseRepositoryRead;
    this.listingRepositoryRead = listingRepositoryRead;
    this.mediaClient = mediaClient;
    this.eventPublisher = eventPublisher;
  }

  async addEvidence(
    params: IParamsAddEvidence,
    actor: IActorContext,
  ): Promise<IEvidenceItem> {
    const verificationCase =
      await this.verificationCaseRepositoryRead.findVerificationCaseById(
        params.caseId,
      );
    if (!verificationCase) {
      throw {
        status: 404,
        errorCode: EErrorCode.RESOURCE_NOT_FOUND,
        message: 'Verification case not found',
        details: { caseId: params.caseId },
      } as IThrowedError;
    }

    await this.assertCaseAccess(actor, verificationCase.listingId);

    let storageKey = params.storageKey?.trim() ?? '';
    let assetId = params.assetId?.trim();
    if (assetId && this.mediaClient) {
      const asset = await this.mediaClient.assertAttachableAsset({
        assetId,
        purpose: EMediaPurpose.EVIDENCE,
        ownerId: params.caseId,
      });
      storageKey = asset.originalKey;
      assetId = asset.id;
    }
    if (!storageKey) {
      throw {
        status: 400,
        errorCode: EErrorCode.FIELD_INVALID,
        message: 'storageKey or a READY evidence assetId is required',
        details: { field: 'storageKey' },
      } as IThrowedError;
    }

    const entity = new EvidenceItemServiceEntity({
      id: params.id,
      caseId: params.caseId,
      type: params.type,
      storageKey,
      assetId,
      contentHash: params.contentHash,
      createdAt: new Date(),
    });

    const created =
      await this.evidenceItemRepositoryWrite.createEvidenceItem(entity);

    if (this.eventPublisher) {
      await this.eventPublisher.publish(
        createEventEnvelope({
          eventId: randomUUID(),
          eventType: 'verification.evidence.attached',
          aggregateId: created.caseId,
          producerModule: 'verification',
          correlationId: randomUUID(),
          payload: {
            caseId: created.caseId,
            listingId: verificationCase.listingId,
            evidenceId: created.id,
            type: created.type,
          },
        }),
      );
    }

    return created;
  }

  async getEvidenceItemById(id: string): Promise<IEvidenceItem> {
    const evidence =
      await this.evidenceItemRepositoryRead.findEvidenceItemById(id);
    if (!evidence) {
      throw {
        status: 404,
        errorCode: EErrorCode.RESOURCE_NOT_FOUND,
        message: 'Evidence item not found',
        details: { id },
      } as IThrowedError;
    }
    return evidence;
  }

  async listByCaseId(
    caseId: string,
    actor: IActorContext,
  ): Promise<IEvidenceItem[]> {
    const verificationCase =
      await this.verificationCaseRepositoryRead.findVerificationCaseById(
        caseId,
      );
    if (!verificationCase) {
      throw {
        status: 404,
        errorCode: EErrorCode.RESOURCE_NOT_FOUND,
        message: 'Verification case not found',
        details: { caseId },
      } as IThrowedError;
    }

    await this.assertCaseAccess(actor, verificationCase.listingId);

    return this.evidenceItemRepositoryRead.listByCaseId(caseId);
  }

  private async assertCaseAccess(
    actor: IActorContext,
    listingId: string,
  ): Promise<void> {
    const listing = await this.listingRepositoryRead.findListingById(listingId);
    if (!listing) {
      throw {
        status: 404,
        errorCode: EErrorCode.RESOURCE_NOT_FOUND,
        message: 'Listing not found',
        details: { listingId },
      } as IThrowedError;
    }
    assertOwnerOrAdmin(actor, listing.sellerId);
  }
}
