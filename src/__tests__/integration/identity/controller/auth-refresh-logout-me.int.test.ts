import supertest from 'supertest';
import { app } from '../../../../../jest/setup-integration-tests';
import { EErrorCode } from '../../../../domain/common/errors/enums/EErrorCode';
import { assertNoSecretFields, assertUnauthorized } from '../../../helpers/auth-assertions';
import { AUTH_PASSWORD, registerMember } from '../../../helpers/auth-http';

describe('when refreshing without an access token', () => {
  it('should return a new JSON token pair', async () => {
    const registered = await registerMember();
    const r1 = registered.body.refreshToken;

    const refreshed = await supertest(app.app)
      .post('/auth/refresh')
      .send({ refreshToken: r1 });

    expect(refreshed.statusCode).toBe(200);
    expect(refreshed.body.accessToken).toEqual(expect.any(String));
    expect(refreshed.body.refreshToken).toEqual(expect.any(String));
    expect(refreshed.body.refreshToken).not.toBe(r1);
    expect(refreshed.headers['set-cookie']).toBeUndefined();
    assertNoSecretFields(refreshed.body);
  });
});

describe('when a rotated refresh token is reused', () => {
  it('should fail with 401 AUTH_INVALID_CREDENTIALS and then reject R2', async () => {
    const registered = await registerMember();
    const r1 = registered.body.refreshToken;
    const rotated = await supertest(app.app)
      .post('/auth/refresh')
      .send({ refreshToken: r1 });
    expect(rotated.statusCode).toBe(200);
    const r2 = rotated.body.refreshToken;

    const reuse = await supertest(app.app)
      .post('/auth/refresh')
      .send({ refreshToken: r1 });
    expect(reuse.statusCode).toBe(401);
    expect(reuse.body.code).toBe(EErrorCode.AUTH_INVALID_CREDENTIALS);
    expect(reuse.body.accessToken).toBeUndefined();

    const r2Again = await supertest(app.app)
      .post('/auth/refresh')
      .send({ refreshToken: r2 });
    expect(r2Again.statusCode).toBe(401);
    expect(r2Again.body.code).toBe(EErrorCode.AUTH_INVALID_CREDENTIALS);
  });
});

describe('when logging out with a Bearer access token', () => {
  it('should return 204 and then reject that session refresh', async () => {
    const registered = await registerMember();

    const logout = await supertest(app.app)
      .post('/auth/logout')
      .set('Authorization', `Bearer ${registered.body.accessToken}`);
    expect(logout.statusCode).toBe(204);

    const refresh = await supertest(app.app)
      .post('/auth/refresh')
      .send({ refreshToken: registered.body.refreshToken });
    expect(refresh.statusCode).toBe(401);
    expect(refresh.body.code).toBe(EErrorCode.AUTH_INVALID_CREDENTIALS);
  });
});

describe('when logging out without a token', () => {
  it('should return 401 AUTH_UNAUTHORIZED', async () => {
    const response = await supertest(app.app).post('/auth/logout');
    assertUnauthorized(response);
  });
});

describe('when getting /auth/me with a valid access token', () => {
  it('should return the public User without a password hash', async () => {
    const registered = await registerMember();

    const me = await supertest(app.app)
      .get('/auth/me')
      .set('Authorization', `Bearer ${registered.body.accessToken}`);

    expect(me.statusCode).toBe(200);
    expect(me.body.id).toBe(registered.body.user.id);
    assertNoSecretFields(me.body);
  });
});

describe('when getting /auth/me without a valid Bearer', () => {
  it('should return 401 AUTH_UNAUTHORIZED', async () => {
    const missing = await supertest(app.app).get('/auth/me');
    assertUnauthorized(missing);

    const invalid = await supertest(app.app)
      .get('/auth/me')
      .set('Authorization', 'Bearer not-a-jwt');
    assertUnauthorized(invalid);
  });
});

describe('when calling /auth/me after logout with the same access token', () => {
  it('should return 401 AUTH_UNAUTHORIZED immediately', async () => {
    const registered = await registerMember();
    const logout = await supertest(app.app)
      .post('/auth/logout')
      .set('Authorization', `Bearer ${registered.body.accessToken}`);
    expect(logout.statusCode).toBe(204);

    const me = await supertest(app.app)
      .get('/auth/me')
      .set('Authorization', `Bearer ${registered.body.accessToken}`);
    assertUnauthorized(me);

    const logoutAgain = await supertest(app.app)
      .post('/auth/logout')
      .set('Authorization', `Bearer ${registered.body.accessToken}`);
    assertUnauthorized(logoutAgain);
  });
});

describe('when logging out of one session while another family remains', () => {
  it('should fail refresh of session 1 and still refresh session 2', async () => {
    const first = await registerMember();
    const second = await supertest(app.app).post('/auth/login').send({
      email: first.payload.email,
      password: AUTH_PASSWORD,
    });
    expect(second.statusCode).toBe(200);

    const logout = await supertest(app.app)
      .post('/auth/logout')
      .set('Authorization', `Bearer ${first.body.accessToken}`);
    expect(logout.statusCode).toBe(204);

    const session1 = await supertest(app.app)
      .post('/auth/refresh')
      .send({ refreshToken: first.body.refreshToken });
    expect(session1.statusCode).toBe(401);

    const session2 = await supertest(app.app)
      .post('/auth/refresh')
      .send({ refreshToken: second.body.refreshToken });
    expect(session2.statusCode).toBe(200);
    expect(session2.body.refreshToken).toEqual(expect.any(String));
  });
});
