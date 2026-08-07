import { IVerificationCase } from '../entity/interfaces/verification-case.interface';

export interface IVerificationCaseRepositoryWrite {
  createVerificationCase(
    verificationCase: IVerificationCase,
  ): Promise<IVerificationCase>;
  updateVerificationCaseById(
    id: string,
    data: Partial<IVerificationCase>,
  ): Promise<IVerificationCase | null>;
}
