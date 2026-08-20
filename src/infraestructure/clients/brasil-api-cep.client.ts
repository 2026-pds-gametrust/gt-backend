import { IThrowedError, serviceLogErrorHandler } from '@sauvvitech/st-packages';
import {
  BRASIL_API_BASE_URL,
  MAPS_HTTP_TIMEOUT_MS,
} from '../../configuration/env-constants/maps.env';
import { EErrorCode } from '../../domain/common/errors/enums/EErrorCode';
import {
  ICepLookup,
  ICepLookupResult,
} from '../../domain/identity/ports/cep-lookup.interface';

type BrasilApiLocation = {
  type?: string;
  coordinates?:
    | { longitude?: string | number; latitude?: string | number }
    | [number | string, number | string];
};

type BrasilApiCepResponse = {
  cep?: string;
  state?: string;
  city?: string;
  neighborhood?: string;
  street?: string;
  location?: BrasilApiLocation;
};

function parseCoordinate(value: unknown): number | undefined {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }
  if (typeof value === 'string' && value.trim() !== '') {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : undefined;
  }
  return undefined;
}

function extractLatLng(
  location?: BrasilApiLocation,
): { lat: number; lng: number } | undefined {
  if (!location?.coordinates) {
    return undefined;
  }
  const coords = location.coordinates;
  if (Array.isArray(coords) && coords.length >= 2) {
    const lng = parseCoordinate(coords[0]);
    const lat = parseCoordinate(coords[1]);
    if (lat !== undefined && lng !== undefined) {
      return { lat, lng };
    }
    return undefined;
  }
  if (typeof coords === 'object') {
    const lng = parseCoordinate(
      (coords as { longitude?: string | number }).longitude,
    );
    const lat = parseCoordinate(
      (coords as { latitude?: string | number }).latitude,
    );
    if (lat !== undefined && lng !== undefined) {
      return { lat, lng };
    }
  }
  return undefined;
}

export class BrasilApiCepClient implements ICepLookup {
  constructor(
    private readonly baseUrl: string = BRASIL_API_BASE_URL,
    private readonly timeoutMs: number = MAPS_HTTP_TIMEOUT_MS,
    private readonly fetchFn: typeof fetch = fetch,
  ) {}

  async lookup(cep: string): Promise<ICepLookupResult | null> {
    const digits = cep.replace(/\D/g, '');
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), this.timeoutMs);
    try {
      const response = await this.fetchFn(
        `${this.baseUrl}/cep/v2/${digits}`,
        { method: 'GET', signal: controller.signal },
      );
      if (response.status === 404) {
        return null;
      }
      if (!response.ok) {
        throw {
          status: 502,
          errorCode: EErrorCode.MAPS_ERROR,
          message: 'BrasilAPI CEP request failed',
        } as IThrowedError;
      }
      const body = (await response.json()) as BrasilApiCepResponse;
      if (!body?.city || !body?.state) {
        return null;
      }
      const point = extractLatLng(body.location);
      return {
        postalCode: (body.cep ?? digits).replace(/\D/g, ''),
        street: body.street,
        district: body.neighborhood,
        city: body.city,
        state: body.state,
        lat: point?.lat,
        lng: point?.lng,
      };
    } catch (error: unknown) {
      if (
        error &&
        typeof error === 'object' &&
        'errorCode' in error &&
        (error as IThrowedError).errorCode === EErrorCode.MAPS_ERROR
      ) {
        throw error;
      }
      serviceLogErrorHandler(error as Error, {
        eventName: 'BrasilApiCepClient.lookup',
        eventData: { cepLength: digits.length },
      });
      throw {
        status: 502,
        errorCode: EErrorCode.MAPS_ERROR,
        message: 'BrasilAPI CEP unavailable',
      } as IThrowedError;
    } finally {
      clearTimeout(timer);
    }
  }
}
