import { IThrowedError, serviceLogErrorHandler } from '@sauvvitech/st-packages';
import {
  MAPS_HTTP_TIMEOUT_MS,
  NOMINATIM_BASE_URL,
  NOMINATIM_USER_AGENT,
} from '../../configuration/env-constants/maps.env';
import { EErrorCode } from '../../domain/common/errors/enums/EErrorCode';
import {
  IGeocodeResult,
  IGeocoder,
} from '../../domain/identity/ports/geocoder.interface';

type NominatimSearchItem = {
  lat?: string;
  lon?: string;
};

export class NominatimGeocoder implements IGeocoder {
  constructor(
    private readonly baseUrl: string = NOMINATIM_BASE_URL,
    private readonly userAgent: string = NOMINATIM_USER_AGENT,
    private readonly timeoutMs: number = MAPS_HTTP_TIMEOUT_MS,
    private readonly fetchFn: typeof fetch = fetch,
  ) {}

  async geocode(query: string): Promise<IGeocodeResult | null> {
    const trimmed = query?.trim() ?? '';
    if (!trimmed) {
      return null;
    }
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), this.timeoutMs);
    try {
      const url = new URL(`${this.baseUrl}/search`);
      url.searchParams.set('q', trimmed);
      url.searchParams.set('format', 'json');
      url.searchParams.set('limit', '1');
      const response = await this.fetchFn(url.toString(), {
        method: 'GET',
        headers: {
          'User-Agent': this.userAgent,
          Accept: 'application/json',
        },
        signal: controller.signal,
      });
      if (!response.ok) {
        throw {
          status: 502,
          errorCode: EErrorCode.MAPS_ERROR,
          message: 'Nominatim geocode request failed',
        } as IThrowedError;
      }
      const body = (await response.json()) as NominatimSearchItem[];
      if (!Array.isArray(body) || body.length === 0) {
        return null;
      }
      const lat = Number(body[0].lat);
      const lng = Number(body[0].lon);
      if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
        return null;
      }
      return { lat, lng };
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
        eventName: 'NominatimGeocoder.geocode',
        eventData: { queryLength: trimmed.length },
      });
      throw {
        status: 502,
        errorCode: EErrorCode.MAPS_ERROR,
        message: 'Nominatim unavailable',
      } as IThrowedError;
    } finally {
      clearTimeout(timer);
    }
  }
}
