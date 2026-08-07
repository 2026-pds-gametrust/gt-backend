import { IThrowedError, serviceLogErrorHandler } from '@sauvvitech/st-packages';
import { EErrorCode } from '../../../domain/common/errors/enums/EErrorCode';
import { IEvidenceItem } from '../../../domain/verification/entity/interfaces/evidence-item.interface';
import { IEvidenceItemRepositoryRead } from '../../../domain/verification/repository/evidence-item.repository.read';
import { EvidenceItemModel } from '../../db/mongo/models/evidence-item.model';
import { dbToInternal } from './adapters/evidence-item.adapter';

export class EvidenceItemRepositoryRead implements IEvidenceItemRepositoryRead {
  async findEvidenceItemById(id: string): Promise<IEvidenceItem | null> {
    try {
      const doc = await EvidenceItemModel.findOne({ id });
      return doc ? dbToInternal(doc) : null;
    } catch (error: any) {
      serviceLogErrorHandler(error, {
        eventName: 'EvidenceItemRepositoryRead.findEvidenceItemById',
        eventData: { id },
      });
      throw {
        status: 500,
        errorCode: EErrorCode.DATABASE_ERROR,
      } as IThrowedError;
    }
  }

  async listByCaseId(caseId: string): Promise<IEvidenceItem[]> {
    try {
      const docs = await EvidenceItemModel.find({ caseId });
      return docs.map(dbToInternal);
    } catch (error: any) {
      serviceLogErrorHandler(error, {
        eventName: 'EvidenceItemRepositoryRead.listByCaseId',
        eventData: { caseId },
      });
      throw {
        status: 500,
        errorCode: EErrorCode.DATABASE_ERROR,
      } as IThrowedError;
    }
  }
}
