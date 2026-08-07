import { Types, model } from 'mongoose';
import { ISearchDocument } from '../../../../domain/search/entity/interfaces/search-document.interface';
import { SearchDocumentSchema } from '../schema/search-document.schema';

export interface IMSearchDocument extends Omit<ISearchDocument, '_id'> {
  _id: Types.ObjectId;
  updatedAt: Date;
}

export const SearchDocumentModel = model<IMSearchDocument>(
  'SearchDocument',
  SearchDocumentSchema,
);
