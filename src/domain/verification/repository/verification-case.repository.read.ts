import { IVerificationCase } from '../entity/interfaces/verification-case.interface';

export interface IVerificationCaseRepositoryRead {
  findVerificationCaseById(id: string): Promise<IVerificationCase | null>;
  findOpenCaseByListingId(listingId: string): Promise<IVerificationCase | null>;
  listVerificationCases(
    filter?: Partial<IVerificationCase>,
  ): Promise<IVerificationCase[]>;
}
