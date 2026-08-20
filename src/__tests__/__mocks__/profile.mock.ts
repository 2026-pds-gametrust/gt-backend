import { Types } from 'mongoose';
import { IAddress } from '../../domain/identity/entity/interfaces/address.interface';
import { IProfile } from '../../domain/identity/entity/interfaces/profile.interface';

export const validAddressMock = (
  override?: Partial<IAddress>,
): IAddress => ({
  id: new Types.ObjectId().toHexString(),
  label: 'Casa',
  recipientName: 'Almera dos Codes',
  postalCode: '01310100',
  street: 'Avenida Paulista',
  number: '1000',
  complement: 'Apto 10',
  district: 'Bela Vista',
  city: 'São Paulo',
  state: 'SP',
  country: 'BR',
  isBilling: false,
  isShipping: true,
  ...override,
});

export const validProfileMock = (
  override?: Partial<IProfile>,
): IProfile => {
  const address = validAddressMock();
  return {
    id: new Types.ObjectId().toHexString(),
    userId: new Types.ObjectId().toHexString(),
    displayName: 'Almera',
    bio: 'Gamer',
    locationApprox: 'São Paulo, SP',
    addresses: [address],
    defaultShippingAddressId: address.id,
    createdAt: new Date(),
    ...override,
  };
};
