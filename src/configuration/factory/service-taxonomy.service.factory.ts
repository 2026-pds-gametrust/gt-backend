import { ServiceTaxonomyService } from '../../domain/catalog/service/service-taxonomy.service';
import { CategoryRepositoryRead } from '../../infraestructure/repository/catalog/category.repository.read';
import { ServiceTaxonomyRepositoryRead } from '../../infraestructure/repository/catalog/service-taxonomy.repository.read';
import { ServiceTaxonomyRepositoryWrite } from '../../infraestructure/repository/catalog/service-taxonomy.repository.write';
import { EventPublisherFactory } from './messaging/event-publisher.factory';

export class ServiceTaxonomyServiceFactory {
  static create() {
    return new ServiceTaxonomyService({
      serviceTaxonomyRepositoryRead: new ServiceTaxonomyRepositoryRead(),
      serviceTaxonomyRepositoryWrite: new ServiceTaxonomyRepositoryWrite(),
      categoryRepositoryRead: new CategoryRepositoryRead(),
      eventPublisher: EventPublisherFactory.create(),
    });
  }
}
