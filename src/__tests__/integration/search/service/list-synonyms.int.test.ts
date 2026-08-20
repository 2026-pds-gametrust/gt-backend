import { SynonymServiceFactory } from '../../../../configuration/factory/synonym.service.factory';
import { ESynonymTargetType } from '../../../../domain/search/entity/enums/ESynonymTargetType';
import { SynonymModel } from '../../../../infraestructure/db/mongo/models/synonym.model';
import { validSynonymMock } from '../../../__mocks__/search-favorites.mock';

const synonymService = SynonymServiceFactory.create();

describe('when we list synonyms', () => {
  it('should return synonyms matching the query', async () => {
    const unique = `synonym-list-${Date.now()}`;
    const synonym = validSynonymMock({
      normalizedTerm: unique,
      canonicalName: 'GPUs',
      targetType: ESynonymTargetType.CATEGORY,
    });
    await SynonymModel.create(synonym);

    const results = await synonymService.listSynonyms(unique);

    expect(results.length).toBeGreaterThanOrEqual(1);
    expect(results.some((item) => item.normalizedTerm === unique)).toBe(true);
  });

  it('should return a capped list when query is omitted', async () => {
    await SynonymModel.create(
      validSynonymMock({
        normalizedTerm: `list-all-${Date.now()}`,
      }),
    );

    const results = await synonymService.listSynonyms();
    expect(results.length).toBeGreaterThanOrEqual(1);
  });
});
