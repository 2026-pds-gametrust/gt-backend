import { SynonymService } from '../../domain/search/service/synonym.service';
import { SynonymRepositoryRead } from '../../infraestructure/repository/search/synonym.repository.read';
import { SynonymRepositoryWrite } from '../../infraestructure/repository/search/synonym.repository.write';
import { EventPublisherFactory } from './messaging/event-publisher.factory';

export class SynonymServiceFactory {
  static create() {
    return new SynonymService({
      synonymRepositoryRead: new SynonymRepositoryRead(),
      synonymRepositoryWrite: new SynonymRepositoryWrite(),
      eventPublisher: EventPublisherFactory.create(),
    });
  }
}
