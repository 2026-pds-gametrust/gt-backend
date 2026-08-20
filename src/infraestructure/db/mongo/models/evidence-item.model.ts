import { Types, model } from 'mongoose';
import { IEvidenceItem } from '../../../../domain/verification/entity/interfaces/evidence-item.interface';
import { EvidenceItemSchema } from '../schema/evidence-item.schema';

export interface IMEvidenceItem extends Omit<IEvidenceItem, '_id'> {
  _id: Types.ObjectId;
}

export const EvidenceItemModel = model<IMEvidenceItem>(
  'EvidenceItem',
  EvidenceItemSchema,
);
