import { NominatimGeocoder } from '../../infraestructure/clients/nominatim-geocoder.client';
import { IGeocoder } from '../../domain/identity/ports/geocoder.interface';
import { NODE_ENV } from '../env-constants/env.constants';

const noopGeocoder: IGeocoder = {
  geocode: async () => null,
};

export class NominatimGeocoderFactory {
  static create(): IGeocoder {
    if (NODE_ENV === 'test' && process.env.MAPS_USE_REAL !== 'true') {
      return noopGeocoder;
    }
    return new NominatimGeocoder();
  }
}
