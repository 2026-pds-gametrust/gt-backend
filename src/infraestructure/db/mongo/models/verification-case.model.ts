import { Types, model } from 'mongoose';
import { IVerificationCase } from '../../../../domain/verification/entity/interfaces/verification-case.interface';
import { VerificationCaseSchema } from '../schema/verification-case.schema';

export interface IMVerificationCase extends Omit<IVerificationCase, '_id'> {
  _id: Types.ObjectId;
  updatedAt: Date;
}

export const VerificationCaseModel = model<IMVerificationCase>(
  'VerificationCase',
  VerificationCaseSchema,
);
