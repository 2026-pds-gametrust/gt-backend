import { EUserGroup } from '@sauvvitech/st-packages';
import { signTestAccessToken } from '../../../helpers/sign-test-access-token';
import supertest from 'supertest';
import { app } from '../../../../../jest/setup-integration-tests';
import { UserModel } from '../../../../infraestructure/db/mongo/models/user.model';
import { ProfileModel } from '../../../../infraestructure/db/mongo/models/profile.model';
import { validUserMock } from '../../../__mocks__/user.mock';
import {
  validAddressMock,
  validProfileMock,
} from '../../../__mocks__/profile.mock';

describe('when we create a valid user via identity HTTP', () => {
  it('should return 201 and the created user', async () => {
    const params = validUserMock();

    const { body, statusCode } = await supertest(app.app)
      .post('/users')
      .set(
        'Authorization',
        `Bearer ${signTestAccessToken({ actorId: 'admin-actor', groups: [EUserGroup.ADMIN] })}`,
      )
      .send({
        id: params.id,
        fullName: params.fullName,
        email: params.email,
        phone: params.phone,
        cpf: params.cpf,
        birthDate: params.birthDate,
      });

    expect(statusCode).toBe(201);
    expect(body).toMatchObject({
      id: params.id,
      fullName: params.fullName,
      email: params.email,
    });
    expect(body).not.toHaveProperty('password');
  });
});

describe('when we create a profile with address via HTTP', () => {
  it('should return 201 and the created profile', async () => {
    const user = validUserMock();
    await UserModel.create(user);

    const address = validAddressMock();
    const profile = validProfileMock({
      userId: user.id,
      addresses: [address],
      defaultShippingAddressId: address.id,
    });

    const { body, statusCode } = await supertest(app.app)
      .post('/profiles')
      .set('Authorization', `Bearer ${signTestAccessToken({ actorId: 'backoffice-actor', groups: [EUserGroup.BACKOFFICE] })}`)
      .send({
        id: profile.id,
        userId: user.id,
        displayName: profile.displayName,
        locationApprox: profile.locationApprox,
        addresses: profile.addresses,
        defaultShippingAddressId: profile.defaultShippingAddressId,
      });

    const inDb = await ProfileModel.findOne({ id: profile.id });

    expect(statusCode).toBe(201);
    expect(body).toMatchObject({
      id: profile.id,
      userId: user.id,
      locationApprox: profile.locationApprox,
    });
    expect(inDb).toMatchObject({
      id: profile.id,
      userId: user.id,
    });
  });
});
