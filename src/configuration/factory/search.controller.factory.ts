import { SearchController } from '../../application/controllers/search.controller';
import { IController } from '../../domain/server/interfaces/IController';
import { SearchDocumentServiceFactory } from './search-document.service.factory';
import { SearchReconciliationServiceFactory } from './search-reconciliation.service.factory';
import { SynonymServiceFactory } from './synonym.service.factory';

export class SearchControllerFactory {
  static create(): IController {
    return new SearchController(
      SearchDocumentServiceFactory.create(),
      SynonymServiceFactory.create(),
      SearchReconciliationServiceFactory.create(),
    );
  }
}
