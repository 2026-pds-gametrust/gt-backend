import { SynonymModel } from '../../../../infraestructure/db/mongo/models/synonym.model';
import { SynonymRepositoryRead } from '../../../../infraestructure/repository/search/synonym.repository.read';
import { SynonymRepositoryWrite } from '../../../../infraestructure/repository/search/synonym.repository.write';
import { EErrorCode } from '../../../../domain/common/errors/enums/EErrorCode';
import { validSynonymMock } from '../../../__mocks__/search-favorites.mock';

const repositoryRead = new SynonymRepositoryRead();
const repositoryWrite = new SynonymRepositoryWrite();

describe('when synonym repository read hits a database failure', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should throw DATABASE_ERROR on findByNormalizedTerm', async () => {
    jest.spyOn(SynonymModel, 'findOne').mockRejectedValueOnce(new Error('boom'));
    await expect(
      repositoryRead.findByNormalizedTerm('gpu'),
    ).rejects.toMatchObject({
      status: 500,
      errorCode: EErrorCode.DATABASE_ERROR,
    });
  });

  it('should throw DATABASE_ERROR on findById', async () => {
    jest.spyOn(SynonymModel, 'findOne').mockRejectedValueOnce(new Error('boom'));
    await expect(repositoryRead.findById('id')).rejects.toMatchObject({
      status: 500,
      errorCode: EErrorCode.DATABASE_ERROR,
    });
  });

  it('should throw DATABASE_ERROR on listByQuery without term', async () => {
    jest.spyOn(SynonymModel, 'find').mockReturnValue({
      limit: jest.fn().mockRejectedValueOnce(new Error('boom')),
    } as never);
    await expect(repositoryRead.listByQuery()).rejects.toMatchObject({
      status: 500,
      errorCode: EErrorCode.DATABASE_ERROR,
    });
  });

  it('should throw DATABASE_ERROR on listByQuery with term', async () => {
    jest.spyOn(SynonymModel, 'find').mockReturnValue({
      limit: jest.fn().mockRejectedValueOnce(new Error('boom')),
    } as never);
    await expect(repositoryRead.listByQuery('gpu')).rejects.toMatchObject({
      status: 500,
      errorCode: EErrorCode.DATABASE_ERROR,
    });
  });
});

describe('when synonym repository write hits a database failure', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should throw DATABASE_ERROR on upsertSynonym', async () => {
    jest
      .spyOn(SynonymModel, 'findOneAndUpdate')
      .mockRejectedValueOnce(new Error('boom'));
    await expect(
      repositoryWrite.upsertSynonym(validSynonymMock()),
    ).rejects.toMatchObject({
      status: 500,
      errorCode: EErrorCode.DATABASE_ERROR,
    });
  });
});
