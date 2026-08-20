import { SearchEngineFactory } from '../../../configuration/factory/search-engine.factory';
import { AtlasSearchEngine } from '../../../infraestructure/search/atlas-search.engine';
import { MongoTextSearchEngine } from '../../../infraestructure/search/mongo-text-search.engine';

describe('when resolving search engine mode', () => {
  const original = { ...process.env };

  afterEach(() => {
    process.env = { ...original };
  });

  it('should honor explicit atlas and mongo SEARCH_ENGINE', () => {
    process.env.SEARCH_ENGINE = 'atlas';
    expect(SearchEngineFactory.resolveMode()).toBe('atlas');
    process.env.SEARCH_ENGINE = 'MONGO';
    expect(SearchEngineFactory.resolveMode()).toBe('mongo');
  });

  it('should default to mongo for unknown values', () => {
    process.env.SEARCH_ENGINE = 'other';
    expect(SearchEngineFactory.resolveMode()).toBe('mongo');
    delete process.env.SEARCH_ENGINE;
    expect(SearchEngineFactory.resolveMode()).toBe('mongo');
  });

  it('should create AtlasSearchEngine when mode is atlas', () => {
    process.env.SEARCH_ENGINE = 'atlas';
    expect(SearchEngineFactory.create()).toBeInstanceOf(AtlasSearchEngine);
  });

  it('should create MongoTextSearchEngine when mode is mongo', () => {
    process.env.SEARCH_ENGINE = 'mongo';
    expect(SearchEngineFactory.create()).toBeInstanceOf(MongoTextSearchEngine);
  });
});
