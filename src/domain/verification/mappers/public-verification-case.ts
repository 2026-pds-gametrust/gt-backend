import { IVerificationCase } from '../entity/interfaces/verification-case.interface';

/** Omits internal proof hash before HTTP / event-facing payloads. */
export function toPublicVerificationCase(
  verificationCase: IVerificationCase,
): IVerificationCase {
  const publicCase = { ...verificationCase };
  delete publicCase.proofCodeHash;
  return publicCase;
}
