import { ISearchDocument } from '../entity/interfaces/search-document.interface';

export interface ISearchDocumentRepositoryWrite {
  upsertSearchDocument(doc: ISearchDocument): Promise<ISearchDocument>;
  deleteByListingId(listingId: string): Promise<boolean>;
}
