import { Types } from 'mongoose';
import supertest from 'supertest';
import { app } from '../../../../../jest/setup-integration-tests';
import { EErrorCode } from '../../../../domain/common/errors/enums/EErrorCode';
import { UserModel } from '../../../../infraestructure/db/mongo/models/user.model';
import {
  validAddressMock,
  validProfileMock,
} from '../../../__mocks__/profile.mock';
import { validUserMock } from '../../../__mocks__/user.mock';
import { assertUnauthorized } from '../../../helpers/auth-assertions';
import { registerMember } from '../../../helpers/auth-http';

describe('when creating a profile without a token', () => {
  it('should return 401 AUTH_UNAUTHORIZED', async () => {
    const user = validUserMock();
    await UserModel.create(user);
    const address = validAddressMock();
    const profile = validProfileMock({ userId: user.id });

    const response = await supertest(app.app).post('/profiles').send({
      id: profile.id,
      userId: user.id,
      displayName: profile.displayName,
      addresses: [address],
      defaultShippingAddressId: address.id,
    });

    expect(response.statusCode).toBe(401);
    assertUnauthorized(response);
  });
});

describe('when an APP_USER registers', () => {
  it('should already have a profile and reject a second create with 409', async () => {
    const carlos = await registerMember();
    expect(carlos.statusCode).toBe(201);

    const existing = await supertest(app.app).get(
      `/profiles/by-user/${carlos.body.user.id}`,
    );
    expect(existing.statusCode).toBe(200);
    expect(existing.body.userId).toBe(carlos.body.user.id);
    expect(existing.body.displayName).toBe(carlos.body.user.fullName);

    const address = validAddressMock();
    const response = await supertest(app.app)
      .post('/profiles')
      .set('Authorization', `Bearer ${carlos.body.accessToken}`)
      .send({
        id: new Types.ObjectId().toHexString(),
        userId: carlos.body.user.id,
        displayName: 'Duplicate',
        addresses: [address],
        defaultShippingAddressId: address.id,
      });

    expect(response.statusCode).toBe(409);
    expect(response.body.code).toBe(EErrorCode.RESOURCE_CONFLICT);
  });
});

describe('when an APP_USER creates a profile for another userId', () => {
  it('should return 403', async () => {
    const carlos = await registerMember();
    const rafael = await registerMember();
    const address = validAddressMock();

    const response = await supertest(app.app)
      .post('/profiles')
      .set('Authorization', `Bearer ${carlos.body.accessToken}`)
      .send({
        id: new Types.ObjectId().toHexString(),
        userId: rafael.body.user.id,
        displayName: 'Not Mine',
        addresses: [address],
        defaultShippingAddressId: address.id,
      });

    expect(response.statusCode).toBe(403);
    expect(response.body.code).toBe(EErrorCode.FIELD_INVALID);
  });
});

describe('when updating a profile without a token', () => {
  it('should return 401', async () => {
    const carlos = await registerMember();
    const profile = await supertest(app.app).get(
      `/profiles/by-user/${carlos.body.user.id}`,
    );
    expect(profile.statusCode).toBe(200);

    const response = await supertest(app.app)
      .put(`/profiles/${profile.body.id}`)
      .send({ displayName: 'Hijack' });

    expect(response.statusCode).toBe(401);
    assertUnauthorized(response);
  });
});

describe('when an APP_USER updates another member profile', () => {
  it('should return 403', async () => {
    const carlos = await registerMember();
    const rafael = await registerMember();
    const profile = await supertest(app.app).get(
      `/profiles/by-user/${carlos.body.user.id}`,
    );
    expect(profile.statusCode).toBe(200);

    const response = await supertest(app.app)
      .put(`/profiles/${profile.body.id}`)
      .set('Authorization', `Bearer ${rafael.body.accessToken}`)
      .send({ displayName: 'Hijack' });

    expect(response.statusCode).toBe(403);
    expect(response.body.code).toBe(EErrorCode.FIELD_INVALID);
  });
});
