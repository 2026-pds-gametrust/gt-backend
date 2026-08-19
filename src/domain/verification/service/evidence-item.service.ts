import { IThrowedError } from '@sauvvitech/st-packages';
import { EErrorCode } from '../../common/errors/enums/EErrorCode';
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
  private readonly mediaClient?: IMediaClient;

  constructor({
    evidenceItemRepositoryRead,
    evidenceItemRepositoryWrite,
    verificationCaseRepositoryRead,
    mediaClient,
  }: IParamsEvidenceItemService) {
    this.evidenceItemRepositoryRead = evidenceItemRepositoryRead;
    this.evidenceItemRepositoryWrite = evidenceItemRepositoryWrite;
    this.verificationCaseRepositoryRead = verificationCaseRepositoryRead;
    this.mediaClient = mediaClient;
  }

  async addEvidence(params: IParamsAddEvidence): Promise<IEvidenceItem> {
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

    return this.evidenceItemRepositoryWrite.createEvidenceItem(entity);
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

  async listByCaseId(caseId: string): Promise<IEvidenceItem[]> {
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
    return this.evidenceItemRepositoryRead.listByCaseId(caseId);
  }
}
