import { ISynonym } from '../entity/interfaces/synonym.interface';

export interface ISynonymRepositoryWrite {
  upsertSynonym(synonym: ISynonym): Promise<ISynonym>;
}
