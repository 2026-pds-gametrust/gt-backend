import { CepService } from '../../domain/identity/service/cep.service';
import { BrasilApiCepClientFactory } from './brasil-api-cep.client.factory';

export class CepServiceFactory {
  static create() {
    return new CepService({
      cepLookup: BrasilApiCepClientFactory.create(),
    });
  }
}
