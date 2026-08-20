import { IVerificationCase } from '../entity/interfaces/verification-case.interface';

export interface IVerificationCaseRepositoryWrite {
  createVerificationCase(
    verificationCase: IVerificationCase,
  ): Promise<IVerificationCase>;
  updateVerificationCaseById(
    id: string,
    data: Partial<IVerificationCase>,
  ): Promise<IVerificationCase | null>;
  /** Merge-safe: only sets checklist.proofCodeAnalysis (does not replace whole checklist). */
  setChecklistProofCodeAnalysis(
    id: string,
    proofCodeAnalysis: NonNullable<
      IVerificationCase['checklist']
    >['proofCodeAnalysis'],
  ): Promise<IVerificationCase | null>;
}
