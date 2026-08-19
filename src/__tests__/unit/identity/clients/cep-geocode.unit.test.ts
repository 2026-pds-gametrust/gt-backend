import { BrasilApiCepClient } from '../../../../infraestructure/clients/brasil-api-cep.client';
import { NominatimGeocoder } from '../../../../infraestructure/clients/nominatim-geocoder.client';
import { EErrorCode } from '../../../../domain/common/errors/enums/EErrorCode';
import { CepService } from '../../../../domain/identity/service/cep.service';

describe('BrasilApiCepClient', () => {
  it('should map BrasilAPI response with object coordinates', async () => {
    const fetchFn = jest.fn().mockResolvedValue({
      status: 200,
      ok: true,
      json: async () => ({
        cep: '01310-100',
        state: 'SP',
        city: 'São Paulo',
        neighborhood: 'Bela Vista',
        street: 'Avenida Paulista',
        location: {
          type: 'Point',
          coordinates: { longitude: '-46.65', latitude: '-23.56' },
        },
      }),
    });
    const client = new BrasilApiCepClient(
      'https://brasilapi.test',
      1000,
      fetchFn as never,
    );

    const result = await client.lookup('01310100');

    expect(result).toEqual({
      postalCode: '01310100',
      street: 'Avenida Paulista',
      district: 'Bela Vista',
      city: 'São Paulo',
      state: 'SP',
      lat: -23.56,
      lng: -46.65,
    });
    expect(fetchFn).toHaveBeenCalledWith(
      'https://brasilapi.test/cep/v2/01310100',
      expect.objectContaining({ method: 'GET' }),
    );
  });

  it('should return null on 404', async () => {
    const fetchFn = jest.fn().mockResolvedValue({
      status: 404,
      ok: false,
      json: async () => ({}),
    });
    const client = new BrasilApiCepClient(
      'https://brasilapi.test',
      1000,
      fetchFn as never,
    );

    await expect(client.lookup('00000000')).resolves.toBeNull();
  });

  it('should throw MAPS_ERROR on upstream failure', async () => {
    const fetchFn = jest.fn().mockResolvedValue({
      status: 500,
      ok: false,
      json: async () => ({}),
    });
    const client = new BrasilApiCepClient(
      'https://brasilapi.test',
      1000,
      fetchFn as never,
    );

    await expect(client.lookup('01310100')).rejects.toMatchObject({
      status: 502,
      errorCode: EErrorCode.MAPS_ERROR,
    });
  });
});

describe('NominatimGeocoder', () => {
  it('should map the first search hit', async () => {
    const fetchFn = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => [{ lat: '-23.5', lon: '-46.6' }],
    });
    const client = new NominatimGeocoder(
      'https://nominatim.test',
      'TestAgent',
      1000,
      fetchFn as never,
    );

    await expect(client.geocode('Paulista, SP')).resolves.toEqual({
      lat: -23.5,
      lng: -46.6,
    });
  });

  it('should return null when empty', async () => {
    const fetchFn = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => [],
    });
    const client = new NominatimGeocoder(
      'https://nominatim.test',
      'TestAgent',
      1000,
      fetchFn as never,
    );

    await expect(client.geocode('nowhere')).resolves.toBeNull();
  });
});

describe('CepService', () => {
  it('should reject invalid CEP', async () => {
    const service = new CepService({
      cepLookup: { lookup: jest.fn() },
    });
    await expect(service.lookupByCep('123')).rejects.toMatchObject({
      status: 400,
      errorCode: EErrorCode.ADDRESS_INVALID_ZIP_CODE,
    });
  });

  it('should reject missing CEP', async () => {
    const service = new CepService({
      cepLookup: { lookup: jest.fn().mockResolvedValue(null) },
    });
    await expect(service.lookupByCep('01310100')).rejects.toMatchObject({
      status: 404,
      errorCode: EErrorCode.RESOURCE_NOT_FOUND,
    });
  });
});
