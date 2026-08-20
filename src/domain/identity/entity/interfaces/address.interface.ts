import { EGeoSource } from '../enums/EGeoSource';

/** GeoJSON Point — coordinates are [longitude, latitude]. */
export interface IGeoPoint {
  type: 'Point';
  coordinates: [number, number];
}

export interface IAddress {
  id: string;
  label?: string;
  recipientName: string;
  postalCode: string;
  street: string;
  number: string;
  complement?: string;
  district: string;
  city: string;
  state: string;
  country: string;
  isBilling?: boolean;
  isShipping?: boolean;
  geo?: IGeoPoint;
  geoSource?: EGeoSource;
}
