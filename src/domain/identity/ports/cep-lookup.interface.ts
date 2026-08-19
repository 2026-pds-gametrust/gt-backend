export interface ICepLookupResult {
  postalCode: string;
  street?: string;
  district?: string;
  city: string;
  state: string;
  lat?: number;
  lng?: number;
}

export interface ICepLookup {
  lookup(cep: string): Promise<ICepLookupResult | null>;
}
