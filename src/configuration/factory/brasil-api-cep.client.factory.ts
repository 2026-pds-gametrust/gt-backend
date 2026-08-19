import { BrasilApiCepClient } from '../../infraestructure/clients/brasil-api-cep.client';
import { ICepLookup } from '../../domain/identity/ports/cep-lookup.interface';
import { NODE_ENV } from '../env-constants/env.constants';

const noopCepLookup: ICepLookup = {
  lookup: async () => null,
};

export class BrasilApiCepClientFactory {
  static create(): ICepLookup {
    if (NODE_ENV === 'test' && process.env.MAPS_USE_REAL !== 'true') {
      return noopCepLookup;
    }
    return new BrasilApiCepClient();
  }
}
