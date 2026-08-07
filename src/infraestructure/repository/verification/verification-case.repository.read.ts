import { IThrowedError, serviceLogErrorHandler } from '@sauvvitech/st-packages';
import { EErrorCode } from '../../../domain/common/errors/enums/EErrorCode';
import { EVerificationCaseStatus } from '../../../domain/verification/entity/enums/EVerificationCaseStatus';
import { IVerificationCase } from '../../../domain/verification/entity/interfaces/verification-case.interface';
import { IVerificationCaseRepositoryRead } from '../../../domain/verification/repository/verification-case.repository.read';
import { VerificationCaseModel } from '../../db/mongo/models/verification-case.model';
import { dbToInternal } from './adapters/verification-case.adapter';

export class VerificationCaseRepositoryRead
  implements IVerificationCaseRepositoryRead
{
  async findVerificationCaseById(
    id: string,
  ): Promise<IVerificationCase | null> {
    try {
      const doc = await VerificationCaseModel.findOne({ id });
      return doc ? dbToInternal(doc) : null;
    } catch (error: any) {
      serviceLogErrorHandler(error, {
        eventName: 'VerificationCaseRepositoryRead.findVerificationCaseById',
        eventData: { id },
      });
      throw {
        status: 500,
        errorCode: EErrorCode.DATABASE_ERROR,
      } as IThrowedError;
    }
  }

  async findOpenCaseByListingId(
    listingId: string,
  ): Promise<IVerificationCase | null> {
    try {
      const doc = await VerificationCaseModel.findOne({
        listingId,
        status: {
          $in: [
            EVerificationCaseStatus.PENDING,
            EVerificationCaseStatus.IN_REVIEW,
          ],
        },
      });
      return doc ? dbToInternal(doc) : null;
    } catch (error: any) {
      serviceLogErrorHandler(error, {
        eventName: 'VerificationCaseRepositoryRead.findOpenCaseByListingId',
        eventData: { listingId },
      });
      throw {
        status: 500,
        errorCode: EErrorCode.DATABASE_ERROR,
      } as IThrowedError;
    }
  }

  async listVerificationCases(
    filter: Partial<IVerificationCase> = {},
  ): Promise<IVerificationCase[]> {
    try {
      const docs = await VerificationCaseModel.find(filter);
      return docs.map(dbToInternal);
    } catch (error: any) {
      serviceLogErrorHandler(error, {
        eventName: 'VerificationCaseRepositoryRead.listVerificationCases',
        eventData: { filter },
      });
      throw {
        status: 500,
        errorCode: EErrorCode.DATABASE_ERROR,
      } as IThrowedError;
    }
  }
}
