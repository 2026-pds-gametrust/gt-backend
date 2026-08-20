import { TrustEventService } from '../../domain/trust/service/trust-event.service';
import { TrustEventRepositoryRead } from '../../infraestructure/repository/trust/trust-event.repository.read';
import { TrustEventRepositoryWrite } from '../../infraestructure/repository/trust/trust-event.repository.write';

export class TrustEventServiceFactory {
  static create() {
    return new TrustEventService({
      trustEventRepositoryRead: new TrustEventRepositoryRead(),
      trustEventRepositoryWrite: new TrustEventRepositoryWrite(),
    });
  }
}
