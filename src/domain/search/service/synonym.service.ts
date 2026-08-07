import { randomUUID } from 'crypto';
import { normalizeSynonym } from '../../common/types/normalize-synonym';
import { ESynonymTargetType } from '../entity/enums/ESynonymTargetType';
import { SynonymServiceEntity } from '../entity/synonym.entity';
import { ISynonym } from '../entity/interfaces/synonym.interface';
import {
  IParamsSynonymService,
  ISynonymService,
} from './synonym.service.interface';

export class SynonymService implements ISynonymService {
  private readonly synonymRepositoryRead: IParamsSynonymService['synonymRepositoryRead'];
  private readonly synonymRepositoryWrite: IParamsSynonymService['synonymRepositoryWrite'];

  constructor({
    synonymRepositoryRead,
    synonymRepositoryWrite,
  }: IParamsSynonymService) {
    this.synonymRepositoryRead = synonymRepositoryRead;
    this.synonymRepositoryWrite = synonymRepositoryWrite;
  }

  async upsertFromTaxonomy(
    term: string,
    ownerType: ESynonymTargetType,
    ownerId: string,
    canonicalName: string,
  ): Promise<ISynonym> {
    const normalizedTerm = normalizeSynonym(term);
    if (!normalizedTerm) {
      throw new Error('term is required');
    }

    const existing =
      await this.synonymRepositoryRead.findByNormalizedTerm(normalizedTerm);

    const entity = new SynonymServiceEntity({
      id: existing?.id ?? randomUUID(),
      normalizedTerm,
      targetType: ownerType,
      targetId: ownerId,
      canonicalName,
      updatedAt: new Date(),
    });

    return this.synonymRepositoryWrite.upsertSynonym(entity);
  }

  async listSynonyms(q?: string): Promise<ISynonym[]> {
    return this.synonymRepositoryRead.listByQuery(q);
  }
}
