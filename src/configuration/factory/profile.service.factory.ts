import { ProfileService } from '../../domain/identity/service/profile.service';
import { ProfileRepositoryRead } from '../../infraestructure/repository/identity/profile.repository.read';
import { ProfileRepositoryWrite } from '../../infraestructure/repository/identity/profile.repository.write';
import { UserRepositoryRead } from '../../infraestructure/repository/identity/user.repository.read';
import { BrasilApiCepClientFactory } from './brasil-api-cep.client.factory';
import { EventPublisherFactory } from './messaging/event-publisher.factory';
import { NominatimGeocoderFactory } from './nominatim-geocoder.factory';

export class ProfileServiceFactory {
  static create() {
    return new ProfileService({
      profileRepositoryRead: new ProfileRepositoryRead(),
      profileRepositoryWrite: new ProfileRepositoryWrite(),
      userRepositoryRead: new UserRepositoryRead(),
      eventPublisher: EventPublisherFactory.create(),
      cepLookup: BrasilApiCepClientFactory.create(),
      geocoder: NominatimGeocoderFactory.create(),
    });
  }
}
