import { CategoryService } from '../../domain/catalog/service/category.service';
import { CategoryRepositoryRead } from '../../infraestructure/repository/catalog/category.repository.read';
import { CategoryRepositoryWrite } from '../../infraestructure/repository/catalog/category.repository.write';
import { ServiceTaxonomyRepositoryRead } from '../../infraestructure/repository/catalog/service-taxonomy.repository.read';
import { EventPublisherFactory } from './messaging/event-publisher.factory';

export class CategoryServiceFactory {
  static create() {
    return new CategoryService({
      categoryRepositoryRead: new CategoryRepositoryRead(),
      categoryRepositoryWrite: new CategoryRepositoryWrite(),
      serviceTaxonomyRepositoryRead: new ServiceTaxonomyRepositoryRead(),
      eventPublisher: EventPublisherFactory.create(),
    });
  }
}
