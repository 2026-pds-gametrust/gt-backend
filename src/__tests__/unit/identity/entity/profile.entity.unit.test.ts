import { ProfileServiceEntity } from '../../../../domain/identity/entity/profile.entity';
import {
  validAddressMock,
  validProfileMock,
} from '../../../__mocks__/profile.mock';

describe('when constructing a profile entity', () => {
  it('should accept a valid profile and normalize address fields', () => {
    const address = validAddressMock({
      postalCode: '01310-100',
      state: 'sp',
      country: 'br',
      recipientName: '  Ana  ',
    });
    const entity = new ProfileServiceEntity(
      validProfileMock({
        addresses: [address],
        defaultShippingAddressId: address.id,
        displayName: '  Almera  ',
      }),
    );
    expect(entity.displayName).toBe('Almera');
    expect(entity.addresses[0].postalCode).toBe('01310100');
    expect(entity.addresses[0].state).toBe('SP');
    expect(entity.addresses[0].country).toBe('BR');
    expect(entity.addresses[0].recipientName).toBe('Ana');
  });

  it('should accept a profile without addresses', () => {
    const entity = new ProfileServiceEntity(
      validProfileMock({
        addresses: [],
        defaultShippingAddressId: undefined,
      }),
    );
    expect(entity.addresses).toEqual([]);
  });

  it('should default optional profile and address fields', () => {
    const address = validAddressMock({
      label: undefined,
      complement: undefined,
      country: undefined,
      isBilling: undefined,
      isShipping: undefined,
    });
    const entity = new ProfileServiceEntity(
      validProfileMock({
        displayName: undefined,
        bio: undefined,
        locationApprox: undefined,
        setupItems: undefined,
        updatedAt: undefined,
        addresses: [address],
        defaultShippingAddressId: undefined,
        createdAt: undefined as any,
      }),
    );
    expect(entity.displayName).toBeUndefined();
    expect(entity.addresses[0].country).toBe('BR');
    expect(entity.addresses[0].isBilling).toBe(false);
    expect(entity.addresses[0].isShipping).toBe(true);
    expect(entity.createdAt).toBeInstanceOf(Date);
  });

  it('should coerce blank country to BR', () => {
    const address = validAddressMock({ country: '   ' });
    const entity = new ProfileServiceEntity(
      validProfileMock({
        addresses: [address],
        defaultShippingAddressId: address.id,
      }),
    );
    expect(entity.addresses[0].country).toBe('BR');
  });

  it('should reject missing userId', () => {
    expect(
      () => new ProfileServiceEntity(validProfileMock({ userId: '  ' })),
    ).toThrow('userId is required');
  });

  it('should reject address without id', () => {
    expect(
      () =>
        new ProfileServiceEntity(
          validProfileMock({
            addresses: [validAddressMock({ id: '' })],
            defaultShippingAddressId: undefined,
          }),
        ),
    ).toThrow('address id is required');
  });

  it('should reject address without recipientName', () => {
    expect(
      () =>
        new ProfileServiceEntity(
          validProfileMock({
            addresses: [validAddressMock({ recipientName: '  ' })],
            defaultShippingAddressId: undefined,
          }),
        ),
    ).toThrow('recipientName is required');
  });

  it('should reject invalid postalCode', () => {
    expect(
      () =>
        new ProfileServiceEntity(
          validProfileMock({
            addresses: [validAddressMock({ postalCode: '123' })],
            defaultShippingAddressId: undefined,
          }),
        ),
    ).toThrow('postalCode must be 8 digits');
  });

  it('should reject address without street', () => {
    expect(
      () =>
        new ProfileServiceEntity(
          validProfileMock({
            addresses: [validAddressMock({ street: '' })],
            defaultShippingAddressId: undefined,
          }),
        ),
    ).toThrow('street is required');
  });

  it('should reject address without number', () => {
    expect(
      () =>
        new ProfileServiceEntity(
          validProfileMock({
            addresses: [validAddressMock({ number: ' ' })],
            defaultShippingAddressId: undefined,
          }),
        ),
    ).toThrow('number is required');
  });

  it('should reject address without district', () => {
    expect(
      () =>
        new ProfileServiceEntity(
          validProfileMock({
            addresses: [validAddressMock({ district: '' })],
            defaultShippingAddressId: undefined,
          }),
        ),
    ).toThrow('district is required');
  });

  it('should reject address without city', () => {
    expect(
      () =>
        new ProfileServiceEntity(
          validProfileMock({
            addresses: [validAddressMock({ city: '' })],
            defaultShippingAddressId: undefined,
          }),
        ),
    ).toThrow('city is required');
  });

  it('should reject state that is not 2 letters', () => {
    expect(
      () =>
        new ProfileServiceEntity(
          validProfileMock({
            addresses: [validAddressMock({ state: 'SAO' })],
            defaultShippingAddressId: undefined,
          }),
        ),
    ).toThrow('state must be 2 letters');
  });

  it('should reject defaultShippingAddressId that does not match an address', () => {
    const address = validAddressMock();
    expect(
      () =>
        new ProfileServiceEntity(
          validProfileMock({
            addresses: [address],
            defaultShippingAddressId: 'missing-address-id',
          }),
        ),
    ).toThrow('defaultShippingAddressId must match an address id');
  });
});
