import { SynonymServiceFactory } from '../../../../configuration/factory/synonym.service.factory';
import { ESynonymTargetType } from '../../../../domain/search/entity/enums/ESynonymTargetType';
import { SynonymModel } from '../../../../infraestructure/db/mongo/models/synonym.model';
import { validCategoryMock } from '../../../__mocks__/category.mock';

const synonymService = SynonymServiceFactory.create();

describe('when we upsert synonym from taxonomy', () => {
  it('should persist normalized projection', async () => {
    const ownerId = validCategoryMock().id;
    const synonym = await synonymService.upsertFromTaxonomy(
      '  Placa de Video ',
      ESynonymTargetType.CATEGORY,
      ownerId,
      'GPUs',
    );

    expect(synonym.normalizedTerm).toBe('placa de video');
    expect(synonym.targetId).toBe(ownerId);

    const persisted = await SynonymModel.findOne({
      normalizedTerm: 'placa de video',
    });
    expect(persisted).not.toBeNull();
  });

  it('should reject an empty term', async () => {
    await expect(
      synonymService.upsertFromTaxonomy(
        '   ',
        ESynonymTargetType.CATEGORY,
        validCategoryMock().id,
        'GPUs',
      ),
    ).rejects.toThrow('term is required');
  });
});
