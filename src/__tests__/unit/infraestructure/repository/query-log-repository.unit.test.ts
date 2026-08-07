import { QueryLogModel } from '../../../../infraestructure/db/mongo/models/query-log.model';
import { QueryLogRepositoryRead } from '../../../../infraestructure/repository/search/query-log.repository.read';
import { QueryLogRepositoryWrite } from '../../../../infraestructure/repository/search/query-log.repository.write';
import { EErrorCode } from '../../../../domain/common/errors/enums/EErrorCode';
import { validQueryLogMock } from '../../../__mocks__/search-favorites.mock';

const repositoryRead = new QueryLogRepositoryRead();
const repositoryWrite = new QueryLogRepositoryWrite();

describe('when query-log repository read hits a database failure', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should throw DATABASE_ERROR on findById', async () => {
    jest.spyOn(QueryLogModel, 'findOne').mockRejectedValueOnce(new Error('boom'));
    await expect(repositoryRead.findById('id')).rejects.toMatchObject({
      status: 500,
      errorCode: EErrorCode.DATABASE_ERROR,
    });
  });

  it('should throw DATABASE_ERROR on listRecent', async () => {
    jest.spyOn(QueryLogModel, 'find').mockReturnValue({
      sort: jest.fn().mockReturnValue({
        limit: jest.fn().mockRejectedValueOnce(new Error('boom')),
      }),
    } as never);
    await expect(repositoryRead.listRecent()).rejects.toMatchObject({
      status: 500,
      errorCode: EErrorCode.DATABASE_ERROR,
    });
  });
});

describe('when query-log repository write hits a database failure', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should throw DATABASE_ERROR on appendQueryLog', async () => {
    jest.spyOn(QueryLogModel, 'create').mockRejectedValueOnce(new Error('boom'));
    await expect(
      repositoryWrite.appendQueryLog(validQueryLogMock()),
    ).rejects.toMatchObject({
      status: 500,
      errorCode: EErrorCode.DATABASE_ERROR,
    });
  });
});
