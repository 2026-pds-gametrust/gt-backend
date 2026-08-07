import { QueryLogServiceFactory } from '../../../../configuration/factory/query-log.service.factory';
import { QueryLogModel } from '../../../../infraestructure/db/mongo/models/query-log.model';

const queryLogService = QueryLogServiceFactory.create();

describe('when we append a query log', () => {
  it('should persist the query log entry', async () => {
    const query = `append-log-${Date.now()}`;

    const created = await queryLogService.appendQueryLog({
      query,
      filters: { categoryId: 'cat-1' },
      resultCount: 3,
      actorId: 'actor-1',
    });

    expect(created).toMatchObject({
      query,
      resultCount: 3,
      actorId: 'actor-1',
      filters: { categoryId: 'cat-1' },
    });

    const persisted = await QueryLogModel.findOne({ id: created.id });
    expect(persisted).not.toBeNull();
    expect(persisted?.query).toBe(query);
  });
});
