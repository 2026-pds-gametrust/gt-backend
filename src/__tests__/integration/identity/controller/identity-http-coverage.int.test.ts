import { EUserGroup } from '@sauvvitech/st-packages';
import { signTestAccessToken } from '../../../helpers/sign-test-access-token';
import { Types } from 'mongoose';
import supertest from 'supertest';
import { app } from '../../../../../jest/setup-integration-tests';
import { validProfileMock } from '../../../__mocks__/profile.mock';
import { validUserMock } from '../../../__mocks__/user.mock';

describe('when identity HTTP routes are exercised', () => {
  it('should cover user verify and profile read list update flows', async () => {
    const user = validUserMock();
    const createdUser = await supertest(app.app)
      .post('/users')
      .set(
        'Authorization',
        `Bearer ${signTestAccessToken({ actorId: 'admin-actor', groups: [EUserGroup.ADMIN] })}`,
      )
      .send({
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      phone: user.phone,
      cpf: user.cpf,
      birthDate: user.birthDate,
    });
    expect(createdUser.statusCode).toBe(201);

    const listedUsers = await supertest(app.app)
      .get('/users')
      .set('Authorization', `Bearer ${signTestAccessToken({ actorId: 'backoffice-actor', groups: [EUserGroup.BACKOFFICE] })}`)
    expect(listedUsers.statusCode).toBe(200);

    const gotUser = await supertest(app.app)
      .get(`/users/${user.id}`)
      .set(
        'Authorization',
        `Bearer ${signTestAccessToken({ actorId: user.id, groups: [EUserGroup.APP_USER] })}`,
      );
    expect(gotUser.statusCode).toBe(200);

    const verified = await supertest(app.app)
      .post(`/users/${user.id}/verify`)
      .set('Authorization', `Bearer ${signTestAccessToken({ actorId: 'backoffice-actor', groups: [EUserGroup.BACKOFFICE] })}`)
    expect(verified.statusCode).toBe(200);

    const updatedUser = await supertest(app.app)
      .put(`/users/${user.id}`)
      .set(
        'Authorization',
        `Bearer ${signTestAccessToken({ actorId: user.id, groups: [EUserGroup.APP_USER] })}`,
      )
      .send({ fullName: 'Updated Name Here' });
    expect(updatedUser.statusCode).toBe(200);

    const profile = validProfileMock({ userId: user.id });
    const createdProfile = await supertest(app.app)
      .post('/profiles')
      .set('Authorization', `Bearer ${signTestAccessToken({ actorId: user.id, groups: [EUserGroup.APP_USER] })}`)
      .send({
        id: profile.id,
        userId: user.id,
        displayName: profile.displayName,
        addresses: profile.addresses,
        defaultShippingAddressId: profile.defaultShippingAddressId,
      });
    expect(createdProfile.statusCode).toBe(201);

    const listedProfiles = await supertest(app.app)
      .get('/profiles')
      .set('Authorization', `Bearer ${signTestAccessToken({ actorId: 'backoffice-actor', groups: [EUserGroup.BACKOFFICE] })}`)
    expect(listedProfiles.statusCode).toBe(200);

    const byUser = await supertest(app.app).get(`/profiles/by-user/${user.id}`);
    expect(byUser.statusCode).toBe(200);

    const byId = await supertest(app.app).get(`/profiles/${profile.id}`);
    expect(byId.statusCode).toBe(200);

    const updatedProfile = await supertest(app.app)
      .put(`/profiles/${profile.id}`)
      .set('Authorization', `Bearer ${signTestAccessToken({ actorId: user.id, groups: [EUserGroup.APP_USER] })}`)
      .send({ displayName: 'New Display' });
    expect(updatedProfile.statusCode).toBe(200);
  });

  it('should delete a user via HTTP', async () => {
    const user = validUserMock();
    await supertest(app.app)
      .post('/users')
      .set(
        'Authorization',
        `Bearer ${signTestAccessToken({ actorId: 'admin-actor', groups: [EUserGroup.ADMIN] })}`,
      )
      .send({
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      phone: user.phone,
      cpf: user.cpf,
      birthDate: user.birthDate,
    });

    const deleted = await supertest(app.app)
      .delete(`/users/${user.id}`)
      .set(
        'Authorization',
        `Bearer ${signTestAccessToken({ actorId: user.id, groups: [EUserGroup.APP_USER] })}`,
      );
    expect(deleted.statusCode).toBe(200);
    expect(deleted.body).toMatchObject({
      message: 'User deleted successfully',
    });
  });

  it('should return 404 for missing user', async () => {
    const missingId = new Types.ObjectId().toHexString();
    const response = await supertest(app.app)
      .get(`/users/${missingId}`)
      .set(
        'Authorization',
        `Bearer ${signTestAccessToken({ actorId: 'admin-actor', groups: [EUserGroup.ADMIN] })}`,
      );
    expect(response.statusCode).toBe(404);
  });
});
