import { IEventEnvelope } from '../../../common/messaging/event-envelope';
import { IEventHandler } from '../../../common/messaging/event-handler.interface';
import { ESynonymTargetType } from '../../entity/enums/ESynonymTargetType';
import { ISynonymService } from '../../service/synonym.service.interface';

type TTaxonomyPayload = {
  categoryId?: string;
  serviceId?: string;
  name?: string;
  synonyms?: string[];
};

/**
 * Projects catalog taxonomy name + synonyms into Synonym read model.
 */
export class TaxonomySynonymEventHandler implements IEventHandler {
  constructor(private readonly synonymService: ISynonymService) {}

  async handle(envelope: IEventEnvelope): Promise<void> {
    const payload = envelope.payload as TTaxonomyPayload;
    const name = payload.name?.trim();
    if (!name) {
      return;
    }

    const isCategory =
      envelope.eventType.startsWith('catalog.category.') ||
      Boolean(payload.categoryId);
    const ownerType = isCategory
      ? ESynonymTargetType.CATEGORY
      : ESynonymTargetType.SERVICE;
    const ownerId =
      (isCategory ? payload.categoryId : payload.serviceId) ??
      envelope.aggregateId;

    if (!ownerId) {
      return;
    }

    const terms = [name, ...(payload.synonyms ?? [])];
    for (const term of terms) {
      await this.synonymService.upsertFromTaxonomy(
        term,
        ownerType,
        ownerId,
        name,
      );
    }
  }
}
