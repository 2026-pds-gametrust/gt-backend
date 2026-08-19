import { EUserGroup } from '@sauvvitech/st-packages';
import { Types } from 'mongoose';
import supertest from 'supertest';
import { app } from '../../../../../jest/setup-integration-tests';
import { EErrorCode } from '../../../../domain/common/errors/enums/EErrorCode';
import { EGeoSource } from '../../../../domain/identity/entity/enums/EGeoSource';
import { CepService } from '../../../../domain/identity/service/cep.service';
import { ProfileModel } from '../../../../infraestructure/db/mongo/models/profile.model';
import { UserModel } from '../../../../infraestructure/db/mongo/models/user.model';
import {
  validAddressMock,
  validProfileMock,
} from '../../../__mocks__/profile.mock';
import { validUserMock } from '../../../__mocks__/user.mock';
import {
  registerMember,
} from '../../../helpers/auth-http';
import { signTestAccessToken } from '../../../helpers/sign-test-access-token';

describe('when looking up a CEP via HTTP', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should return BrasilAPI-shaped payload for authenticated users', async () => {
    jest.spyOn(CepService.prototype, 'lookupByCep').mockResolvedValue({
      postalCode: '01310100',
      street: 'Avenida Paulista',
      district: 'Bela Vista',
      city: 'São Paulo',
      state: 'SP',
      lat: -23.56,
      lng: -46.65,
    });

    const member = await registerMember();
    const { body, statusCode } = await supertest(app.app)
      .get('/cep/01310100')
      .set('Authorization', `Bearer ${member.body.accessToken}`);

    expect(statusCode).toBe(200);
    expect(body).toEqual({
      postalCode: '01310100',
      street: 'Avenida Paulista',
      district: 'Bela Vista',
      city: 'São Paulo',
      state: 'SP',
      geo: { type: 'Point', coordinates: [-46.65, -23.56] },
    });
  });

  it('should reject invalid CEP', async () => {
    const member = await registerMember();
    const { statusCode, body } = await supertest(app.app)
      .get('/cep/123')
      .set('Authorization', `Bearer ${member.body.accessToken}`);

    expect(statusCode).toBe(400);
    expect(body.code).toBe(EErrorCode.ADDRESS_INVALID_ZIP_CODE);
  });
});

describe('when updating profile address with geo privacy', () => {
  it('should hide street and geo on public GET and expose them to the owner', async () => {
    const member = await registerMember();
    const userId = member.body.user.id as string;
    const existing = await ProfileModel.findOne({ userId });
    expect(existing).toBeTruthy();

    const address = validAddressMock({
      geo: { type: 'Point', coordinates: [-46.65, -23.56] },
      geoSource: EGeoSource.BRASIL_API,
    });

    const put = await supertest(app.app)
      .put(`/profiles/${existing!.id}`)
      .set('Authorization', `Bearer ${member.body.accessToken}`)
      .send({
        addresses: [address],
        defaultShippingAddressId: address.id,
      });

    expect(put.statusCode).toBe(200);
    // noop maps clients in test — geo may be absent unless already sent;
    // force geo in DB for projection asserts
    await ProfileModel.updateOne(
      { id: existing!.id },
      {
        $set: {
          'addresses.0.geo': {
            type: 'Point',
            coordinates: [-46.65, -23.56],
          },
          'addresses.0.geoSource': EGeoSource.BRASIL_API,
          'addresses.0.street': address.street,
        },
      },
    );

    const publicGet = await supertest(app.app).get(
      `/profiles/by-user/${userId}`,
    );
    expect(publicGet.statusCode).toBe(200);
    expect(publicGet.body.addresses[0].street).toBe('');
    expect(publicGet.body.addresses[0].geo).toBeUndefined();

    const ownerGet = await supertest(app.app)
      .get(`/profiles/by-user/${userId}`)
      .set('Authorization', `Bearer ${member.body.accessToken}`);
    expect(ownerGet.statusCode).toBe(200);
    expect(ownerGet.body.addresses[0].street).toBe(address.street);
    expect(ownerGet.body.addresses[0].geo).toEqual({
      type: 'Point',
      coordinates: [-46.65, -23.56],
    });
  });
});

describe('when querying profiles near a point', () => {
  it('should return public neighbors with distance and without street/geo', async () => {
    const user = validUserMock();
    await UserModel.create(user);
    const address = validAddressMock({
      geo: { type: 'Point', coordinates: [-46.65, -23.56] },
      geoSource: EGeoSource.BRASIL_API,
    });
    const profile = validProfileMock({
      userId: user.id,
      addresses: [address],
      defaultShippingAddressId: address.id,
      locationApprox: 'São Paulo, SP',
    });
    await ProfileModel.create(profile);

    const farUser = validUserMock();
    await UserModel.create(farUser);
    const farAddress = validAddressMock({
      id: new Types.ObjectId().toHexString(),
      geo: { type: 'Point', coordinates: [-43.2, -22.9] },
      geoSource: EGeoSource.NOMINATIM,
    });
    await ProfileModel.create(
      validProfileMock({
        userId: farUser.id,
        addresses: [farAddress],
        defaultShippingAddressId: farAddress.id,
      }),
    );

    const member = await registerMember();
    const { body, statusCode } = await supertest(app.app)
      .get('/profiles/near')
      .query({
        lng: -46.65,
        lat: -23.56,
        radiusMeters: 5000,
        limit: 10,
      })
      .set('Authorization', `Bearer ${member.body.accessToken}`);

    expect(statusCode).toBe(200);
    expect(Array.isArray(body)).toBe(true);
    expect(body.some((item: { userId: string }) => item.userId === user.id)).toBe(
      true,
    );
    expect(
      body.every(
        (item: { userId: string }) => item.userId !== farUser.id,
      ),
    ).toBe(true);
    const hit = body.find((item: { userId: string }) => item.userId === user.id);
    expect(hit).toMatchObject({
      userId: user.id,
      locationApprox: 'São Paulo, SP',
    });
    expect(hit).toHaveProperty('distanceMeters');
    expect(hit).not.toHaveProperty('addresses');
    expect(hit).not.toHaveProperty('geo');
  });

  it('should reject unauthenticated near queries', async () => {
    const { statusCode } = await supertest(app.app)
      .get('/profiles/near')
      .query({ lng: -46.65, lat: -23.56 });
    expect(statusCode).toBe(401);
  });
});

describe('when creating a profile via HTTP still requires complete address', () => {
  it('should accept a complete address payload', async () => {
    const user = validUserMock();
    await UserModel.create(user);
    const address = validAddressMock({ complement: undefined });
    const profile = validProfileMock({
      userId: user.id,
      addresses: [address],
      defaultShippingAddressId: address.id,
    });

    const { statusCode, body } = await supertest(app.app)
      .post('/profiles')
      .set(
        'Authorization',
        `Bearer ${signTestAccessToken({
          actorId: user.id,
          groups: [EUserGroup.APP_USER],
        })}`,
      )
      .send({
        id: profile.id,
        userId: user.id,
        displayName: profile.displayName,
        addresses: [address],
        defaultShippingAddressId: address.id,
      });

    expect(statusCode).toBe(201);
    expect(body.addresses[0].street).toBe(address.street);
  });
});
