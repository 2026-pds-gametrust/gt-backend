export interface IGeocodeResult {
  lat: number;
  lng: number;
}

export interface IGeocoder {
  geocode(query: string): Promise<IGeocodeResult | null>;
}
