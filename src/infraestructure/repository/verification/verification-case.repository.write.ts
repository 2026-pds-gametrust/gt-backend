import { IThrowedError, serviceLogErrorHandler } from '@sauvvitech/st-packages';
import { EErrorCode } from '../../../domain/common/errors/enums/EErrorCode';
import { IVerificationCase } from '../../../domain/verification/entity/interfaces/verification-case.interface';
import { IVerificationCaseRepositoryWrite } from '../../../domain/verification/repository/verification-case.repository.write';
import { VerificationCaseModel } from '../../db/mongo/models/verification-case.model';
import { dbToInternal, internalToDb } from './adapters/verification-case.adapter';

export class VerificationCaseRepositoryWrite
  implements IVerificationCaseRepositoryWrite
{
  async createVerificationCase(
    verificationCase: IVerificationCase,
  ): Promise<IVerificationCase> {
    try {
      const doc = await VerificationCaseModel.create(
        internalToDb(verificationCase),
      );
      return dbToInternal(doc);
    } catch (error: any) {
      serviceLogErrorHandler(error, {
        eventName: 'VerificationCaseRepositoryWrite.createVerificationCase',
        eventData: { id: verificationCase.id },
      });
      throw {
        status: 500,
        errorCode: EErrorCode.DATABASE_ERROR,
      } as IThrowedError;
    }
  }

  async updateVerificationCaseById(
    id: string,
    data: Partial<IVerificationCase>,
  ): Promise<IVerificationCase | null> {
    try {
      const doc = await VerificationCaseModel.findOneAndUpdate(
        { id },
        { $set: data },
        { new: true },
      );
      return doc ? dbToInternal(doc) : null;
    } catch (error: any) {
      serviceLogErrorHandler(error, {
        eventName:
          'VerificationCaseRepositoryWrite.updateVerificationCaseById',
        eventData: { id },
      });
      throw {
        status: 500,
        errorCode: EErrorCode.DATABASE_ERROR,
      } as IThrowedError;
    }
  }

  async setChecklistProofCodeAnalysis(
    id: string,
    proofCodeAnalysis: NonNullable<
      IVerificationCase['checklist']
    >['proofCodeAnalysis'],
  ): Promise<IVerificationCase | null> {
    try {
      const doc = await VerificationCaseModel.findOneAndUpdate(
        { id },
        { $set: { 'checklist.proofCodeAnalysis': proofCodeAnalysis } },
        { new: true },
      );
      return doc ? dbToInternal(doc) : null;
    } catch (error: any) {
      serviceLogErrorHandler(error, {
        eventName:
          'VerificationCaseRepositoryWrite.setChecklistProofCodeAnalysis',
        eventData: { id },
      });
      throw {
        status: 500,
        errorCode: EErrorCode.DATABASE_ERROR,
      } as IThrowedError;
    }
  }
}
