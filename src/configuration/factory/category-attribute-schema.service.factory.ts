import { CategoryAttributeSchemaService } from '../../domain/catalog/service/category-attribute-schema.service';
import { CategoryAttributeSchemaRepositoryRead } from '../../infraestructure/repository/catalog/category-attribute-schema.repository.read';
import { CategoryAttributeSchemaRepositoryWrite } from '../../infraestructure/repository/catalog/category-attribute-schema.repository.write';
import { CategoryRepositoryRead } from '../../infraestructure/repository/catalog/category.repository.read';

export class CategoryAttributeSchemaServiceFactory {
  static create() {
    return new CategoryAttributeSchemaService({
      categoryAttributeSchemaRepositoryRead:
        new CategoryAttributeSchemaRepositoryRead(),
      categoryAttributeSchemaRepositoryWrite:
        new CategoryAttributeSchemaRepositoryWrite(),
      categoryRepositoryRead: new CategoryRepositoryRead(),
    });
  }
}
