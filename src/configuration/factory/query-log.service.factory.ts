import { QueryLogService } from '../../domain/search/service/query-log.service';
import { QueryLogRepositoryWrite } from '../../infraestructure/repository/search/query-log.repository.write';

export class QueryLogServiceFactory {
  static create() {
    return new QueryLogService({
      queryLogRepositoryWrite: new QueryLogRepositoryWrite(),
    });
  }
}
