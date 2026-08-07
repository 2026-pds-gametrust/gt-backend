import { IThrowedError, serviceLogErrorHandler } from '@sauvvitech/st-packages';
import { EErrorCode } from '../../../domain/common/errors/enums/EErrorCode';
import { IEvidenceItem } from '../../../domain/verification/entity/interfaces/evidence-item.interface';
import { IEvidenceItemRepositoryWrite } from '../../../domain/verification/repository/evidence-item.repository.write';
import { EvidenceItemModel } from '../../db/mongo/models/evidence-item.model';
import { dbToInternal, internalToDb } from './adapters/evidence-item.adapter';

export class EvidenceItemRepositoryWrite
  implements IEvidenceItemRepositoryWrite
{
  async createEvidenceItem(evidence: IEvidenceItem): Promise<IEvidenceItem> {
    try {
      const doc = await EvidenceItemModel.create(internalToDb(evidence));
      return dbToInternal(doc);
    } catch (error: any) {
      serviceLogErrorHandler(error, {
        eventName: 'EvidenceItemRepositoryWrite.createEvidenceItem',
        eventData: { id: evidence.id },
      });
      throw {
        status: 500,
        errorCode: EErrorCode.DATABASE_ERROR,
      } as IThrowedError;
    }
  }
}
