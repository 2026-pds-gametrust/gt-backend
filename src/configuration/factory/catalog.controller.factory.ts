import { CatalogController } from '../../application/controllers/catalog.controller';
import { IController } from '../../domain/server/interfaces/IController';
import { CategoryAttributeSchemaServiceFactory } from './category-attribute-schema.service.factory';
import { CategoryServiceFactory } from './category.service.factory';
import { PriceHistoryServiceFactory } from './price-history.service.factory';
import { ProductServiceFactory } from './product.service.factory';
import { ServiceTaxonomyServiceFactory } from './service-taxonomy.service.factory';

export class CatalogControllerFactory {
  static create(): IController {
    return new CatalogController(
      CategoryServiceFactory.create(),
      ServiceTaxonomyServiceFactory.create(),
      CategoryAttributeSchemaServiceFactory.create(),
      ProductServiceFactory.create(),
      PriceHistoryServiceFactory.create(),
    );
  }
}
