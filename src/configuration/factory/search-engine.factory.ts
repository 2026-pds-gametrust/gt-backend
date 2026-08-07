import { NODE_ENV } from '../env-constants/env.constants';
import { ISearchEngine } from '../../domain/search/engine/search-engine.interface';
import { AtlasSearchEngine } from '../../infraestructure/search/atlas-search.engine';
import { MongoTextSearchEngine } from '../../infraestructure/search/mongo-text-search.engine';
import { SearchDocumentRepositoryRead } from '../../infraestructure/repository/search/search-document.repository.read';

export type TSearchEngineMode = 'mongo' | 'atlas';

export class SearchEngineFactory {
  static resolveMode(): TSearchEngineMode {
    const configured = process.env.SEARCH_ENGINE?.trim().toLowerCase();
    if (configured === 'atlas' || configured === 'mongo') {
      return configured;
    }
    if (NODE_ENV === 'test' || process.env.NODE_ENV === 'test') {
      return 'mongo';
    }
    return 'mongo';
  }

  static create(): ISearchEngine {
    const mode = SearchEngineFactory.resolveMode();
    if (mode === 'atlas') {
      return new AtlasSearchEngine();
    }
    return new MongoTextSearchEngine(new SearchDocumentRepositoryRead());
  }
}
