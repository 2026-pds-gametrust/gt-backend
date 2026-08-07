import { Types, model } from 'mongoose';
import { ISynonym } from '../../../../domain/search/entity/interfaces/synonym.interface';
import { SynonymSchema } from '../schema/synonym.schema';

export interface IMSynonym extends Omit<ISynonym, '_id'> {
  _id: Types.ObjectId;
  updatedAt: Date;
}

export const SynonymModel = model<IMSynonym>('Synonym', SynonymSchema);
