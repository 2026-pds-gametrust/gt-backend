import { IEventPublisher } from '../../common/messaging/event-publisher.interface';
import { ESynonymTargetType } from '../entity/enums/ESynonymTargetType';
import { ISynonym } from '../entity/interfaces/synonym.interface';
import { ISynonymRepositoryRead } from '../repository/synonym.repository.read';
import { ISynonymRepositoryWrite } from '../repository/synonym.repository.write';

export interface IParamsSynonymService {
  synonymRepositoryRead: ISynonymRepositoryRead;
  synonymRepositoryWrite: ISynonymRepositoryWrite;
  eventPublisher: IEventPublisher;
}

export interface ISynonymService {
  upsertFromTaxonomy(
    term: string,
    ownerType: ESynonymTargetType,
    ownerId: string,
    canonicalName: string,
  ): Promise<ISynonym>;
  listSynonyms(q?: string): Promise<ISynonym[]>;
}
