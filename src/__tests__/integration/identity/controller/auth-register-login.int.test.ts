import { EUserGroup } from '@sauvvitech/st-packages';
import supertest from 'supertest';
import { app } from '../../../../../jest/setup-integration-tests';
import { EErrorCode } from '../../../../domain/common/errors/enums/EErrorCode';
import { EUserStatus } from '../../../../domain/identity/entity/enums/EUserStatus';
import { UserModel } from '../../../../infraestructure/db/mongo/models/user.model';
import { ErrorCatalog } from '../../../../infraestructure/i18n/error-catalog';
import { validUserMock } from '../../../__mocks__/user.mock';
import { assertNoSecretFields, birthDateYearsAgo } from '../../../helpers/auth-assertions';
import {
  AUTH_PASSWORD,
  adminBearer,
  registerMember,
  registrationBody,
} from '../../../helpers/auth-http';

const invalidCredentials = {
  code: EErrorCode.AUTH_INVALID_CREDENTIALS,
  error: ErrorCatalog[EErrorCode.AUTH_INVALID_CREDENTIALS].en,
};

describe('when registering via HTTP without Authorization', () => {
  it('should return 201 JSON tokens, hydrate me with Bearer, and set no cookie', async () => {
    const payload = registrationBody();

    const registered = await supertest(app.app)
      .post('/auth/register')
      .send(payload);

    expect(registered.statusCode).toBe(201);
    expect(registered.body.user.groups).toEqual([EUserGroup.APP_USER]);
    expect(registered.body.accessToken).toEqual(expect.any(String));
    expect(registered.body.refreshToken).toEqual(expect.any(String));
    assertNoSecretFields(registered.body);
    expect(registered.headers['set-cookie']).toBeUndefined();

    const me = await supertest(app.app)
      .get('/auth/me')
      .set('Authorization', `Bearer ${registered.body.accessToken}`);

    expect(me.statusCode).toBe(200);
    expect(me.body.id).toBe(registered.body.user.id);
    assertNoSecretFields(me.body);
  });
});

describe('when registering a duplicate email via HTTP', () => {
  it('should return 400 FIELD_INVALID without tokens or identifier details', async () => {
    const first = await registerMember();
    expect(first.statusCode).toBe(201);

    const duplicate = await supertest(app.app)
      .post('/auth/register')
      .send(registrationBody({ email: first.payload.email }));

    expect(duplicate.statusCode).toBe(400);
    expect(duplicate.body.code).toBe(EErrorCode.FIELD_INVALID);
    expect(duplicate.body.code).not.toBe(EErrorCode.RESOURCE_CONFLICT);
    expect(duplicate.body.accessToken).toBeUndefined();
    expect(duplicate.body.refreshToken).toBeUndefined();
    const serialized = JSON.stringify(duplicate.body);
    expect(serialized).not.toContain(first.payload.email);
    expect(serialized).not.toContain(first.payload.cpf);
    assertNoSecretFields(duplicate.body);
  });
});

describe('when registering an underage user via HTTP', () => {
  it('should return 400 USER_UNDERAGE without tokens', async () => {
    const response = await supertest(app.app)
      .post('/auth/register')
      .send(registrationBody({ birthDate: birthDateYearsAgo(18, 1) }));

    expect(response.statusCode).toBe(400);
    expect(response.body.code).toBe(EErrorCode.USER_UNDERAGE);
    expect(response.body.accessToken).toBeUndefined();
    assertNoSecretFields(response.body);
  });
});

describe('when logging in via HTTP without Bearer', () => {
  it('should return 200 JSON AuthSession and allow a subsequent Bearer call', async () => {
    const registered = await registerMember();
    expect(registered.statusCode).toBe(201);

    const login = await supertest(app.app).post('/auth/login').send({
      email: registered.payload.email,
      password: AUTH_PASSWORD,
    });

    expect(login.statusCode).toBe(200);
    expect(login.body.user.id).toBe(registered.body.user.id);
    expect(login.body.accessToken).toEqual(expect.any(String));
    expect(login.body.refreshToken).toEqual(expect.any(String));
    expect(login.headers['set-cookie']).toBeUndefined();
    assertNoSecretFields(login.body);

    const me = await supertest(app.app)
      .get('/auth/me')
      .set('Authorization', `Bearer ${login.body.accessToken}`);
    expect(me.statusCode).toBe(200);
    assertNoSecretFields(me.body);
  });
});

describe('when logging in with unknown email, wrong password, no credential or BLOCKED', () => {
  it('should return the same 401 AUTH_INVALID_CREDENTIALS shape with no tokens', async () => {
    const registered = await registerMember();
    const provisioned = validUserMock();
    await supertest(app.app)
      .post('/users')
      .set('Authorization', adminBearer())
      .send({
        id: provisioned.id,
        fullName: provisioned.fullName,
        email: provisioned.email,
        phone: provisioned.phone,
        cpf: provisioned.cpf,
        birthDate: provisioned.birthDate,
      });

    const blocked = await registerMember();
    await UserModel.updateOne(
      { id: blocked.body.user.id },
      { $set: { status: EUserStatus.BLOCKED } },
    );

    const attempts = [
      { email: `unknown+${Date.now()}@email.com`, password: AUTH_PASSWORD },
      { email: registered.payload.email, password: 'wrong-password' },
      { email: provisioned.email, password: AUTH_PASSWORD },
      { email: blocked.payload.email, password: AUTH_PASSWORD },
    ];

    const responses = [];
    for (const attempt of attempts) {
      const response = await supertest(app.app).post('/auth/login').send(attempt);
      expect(response.statusCode).toBe(401);
      expect(response.body).toMatchObject(invalidCredentials);
      expect(response.body.accessToken).toBeUndefined();
      expect(response.body.user).toBeUndefined();
      assertNoSecretFields(response.body);
      responses.push({
        status: response.statusCode,
        code: response.body.code,
        error: response.body.error,
      });
    }

    expect(responses[0]).toEqual(responses[1]);
    expect(responses[1]).toEqual(responses[2]);
    expect(responses[2]).toEqual(responses[3]);
  });
});

describe('when inspecting auth HTTP responses for secrets', () => {
  it('should omit password and passwordHash from register login me and User GET', async () => {
    const registered = await registerMember();
    const login = await supertest(app.app).post('/auth/login').send({
      email: registered.payload.email,
      password: AUTH_PASSWORD,
    });
    const me = await supertest(app.app)
      .get('/auth/me')
      .set('Authorization', `Bearer ${login.body.accessToken}`);
    const user = await supertest(app.app)
      .get(`/users/${registered.body.user.id}`)
      .set('Authorization', `Bearer ${login.body.accessToken}`);
    const updated = await supertest(app.app)
      .put(`/users/${registered.body.user.id}`)
      .set('Authorization', `Bearer ${login.body.accessToken}`)
      .send({ fullName: 'Carlos Auth Test' });

    for (const response of [registered, login, me, user, updated]) {
      assertNoSecretFields(response.body);
    }
  });
});

describe('when calling public auth routes', () => {
  it('should mount rate-limit headers on register login and refresh', async () => {
    const registered = await registerMember();
    const login = await supertest(app.app).post('/auth/login').send({
      email: registered.payload.email,
      password: AUTH_PASSWORD,
    });
    const refresh = await supertest(app.app).post('/auth/refresh').send({
      refreshToken: login.body.refreshToken,
    });

    for (const response of [registered, login, refresh]) {
      const headers = response.headers as Record<string, string>;
      expect(
        headers['ratelimit-limit'] ||
          headers['ratelimit'] ||
          headers['x-ratelimit-limit'],
      ).toBeDefined();
    }
  });
});
