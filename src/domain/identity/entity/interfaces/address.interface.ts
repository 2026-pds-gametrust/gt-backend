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
}
