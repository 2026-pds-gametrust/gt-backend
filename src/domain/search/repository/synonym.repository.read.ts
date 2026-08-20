import { ISynonym } from '../entity/interfaces/synonym.interface';

export interface ISynonymRepositoryRead {
  findByNormalizedTerm(normalizedTerm: string): Promise<ISynonym | null>;
  findById(id: string): Promise<ISynonym | null>;
  listByQuery(q?: string): Promise<ISynonym[]>;
}
