import { IThrowedError } from '@sauvvitech/st-packages';
import { EErrorCode } from '../../common/errors/enums/EErrorCode';
import {
  ICepLookup,
  ICepLookupResult,
} from '../ports/cep-lookup.interface';

export interface IParamsCepService {
  cepLookup: ICepLookup;
}

export interface ICepService {
  lookupByCep(cep: string): Promise<ICepLookupResult>;
}

export class CepService implements ICepService {
  private readonly cepLookup: ICepLookup;

  constructor({ cepLookup }: IParamsCepService) {
    this.cepLookup = cepLookup;
  }

  async lookupByCep(cep: string): Promise<ICepLookupResult> {
    const digits = String(cep ?? '').replace(/\D/g, '');
    if (!/^\d{8}$/.test(digits)) {
      throw {
        status: 400,
        errorCode: EErrorCode.ADDRESS_INVALID_ZIP_CODE,
        message: 'postalCode must be 8 digits',
        details: { postalCode: cep },
      } as IThrowedError;
    }

    const cepLookupResult = await this.cepLookup.lookup(digits);
    if (!cepLookupResult) {
      throw {
        status: 404,
        errorCode: EErrorCode.RESOURCE_NOT_FOUND,
        message: 'CEP not found',
        details: { postalCode: digits },
      } as IThrowedError;
    }
    return cepLookupResult;
  }
}
