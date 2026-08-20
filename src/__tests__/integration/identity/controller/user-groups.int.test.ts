import { EUserGroup } from '@sauvvitech/st-packages';
import jwt from 'jsonwebtoken';
import supertest from 'supertest';
import { app } from '../../../../../jest/setup-integration-tests';
import { EErrorCode } from '../../../../domain/common/errors/enums/EErrorCode';
import { UserModel } from '../../../../infraestructure/db/mongo/models/user.model';
import {
  AUTH_PASSWORD,
  adminBearer,
  appUserBearer,
  backofficeBearer,
  registerMember,
} from '../../../helpers/auth-http';

describe('when an ADMIN assigns groups to another user', () => {
  it('should persist groups and reflect them on the next login JWT', async () => {
    const camila = await registerMember();

    const assigned = await supertest(app.app)
      .put(`/users/${camila.body.user.id}/groups`)
      .set('Authorization', adminBearer())
      .send({ groups: [EUserGroup.BACKOFFICE] });

    expect(assigned.statusCode).toBe(200);
    expect(assigned.body.groups).toEqual([EUserGroup.BACKOFFICE]);

    const login = await supertest(app.app).post('/auth/login').send({
      email: camila.payload.email,
      password: AUTH_PASSWORD,
    });
    expect(login.statusCode).toBe(200);
    const claims = jwt.decode(login.body.accessToken) as jwt.JwtPayload;
    expect(claims.groups).toContain(EUserGroup.BACKOFFICE);
    expect(claims.groups).not.toContain('SYSTEM');
  });
});

describe('when unauthenticated APP_USER or BACKOFFICE-only callers put groups', () => {
  it('should reject with 401 or 403 and leave groups unchanged', async () => {
    const camila = await registerMember();
    const other = await registerMember();
    const before = (await UserModel.findOne({ id: camila.body.user.id }))
      ?.groups;

    const unauth = await supertest(app.app)
      .put(`/users/${camila.body.user.id}/groups`)
      .send({ groups: [EUserGroup.ADMIN] });
    expect(unauth.statusCode).toBe(401);
    expect(unauth.body.code).toBe(EErrorCode.AUTH_UNAUTHORIZED);

    const asAppUser = await supertest(app.app)
      .put(`/users/${camila.body.user.id}/groups`)
      .set('Authorization', appUserBearer(other.body.user.id))
      .send({ groups: [EUserGroup.ADMIN] });
    expect(asAppUser.statusCode).toBe(403);
    expect(asAppUser.body).toMatchObject({ error: 'Access denied' });

    const asBackoffice = await supertest(app.app)
      .put(`/users/${camila.body.user.id}/groups`)
      .set('Authorization', backofficeBearer())
      .send({ groups: [EUserGroup.ADMIN] });
    expect(asBackoffice.statusCode).toBe(403);
    expect(asBackoffice.body).toMatchObject({ error: 'Access denied' });

    expect(
      (await UserModel.findOne({ id: camila.body.user.id }))?.groups,
    ).toEqual(before);
  });
});

describe('when an ADMIN assigns ADMIN or BACKOFFICE to self', () => {
  it('should return 403 and leave stored groups unchanged', async () => {
    const selfAdmin = await registerMember();
    const before = (await UserModel.findOne({ id: selfAdmin.body.user.id }))
      ?.groups;

    const response = await supertest(app.app)
      .put(`/users/${selfAdmin.body.user.id}/groups`)
      .set('Authorization', adminBearer(selfAdmin.body.user.id))
      .send({ groups: [EUserGroup.ADMIN, EUserGroup.BACKOFFICE] });

    expect(response.statusCode).toBe(403);
    expect(response.body.code).toBe(EErrorCode.FIELD_INVALID);
    expect(
      (await UserModel.findOne({ id: selfAdmin.body.user.id }))?.groups,
    ).toEqual(before);
  });
});

describe('when HTTP assigns SYSTEM', () => {
  it('should reject the request and not store SYSTEM', async () => {
    const target = await registerMember();

    const response = await supertest(app.app)
      .put(`/users/${target.body.user.id}/groups`)
      .set('Authorization', adminBearer())
      .send({ groups: ['SYSTEM'] });

    expect(response.statusCode).toBe(400);
    const stored = await UserModel.findOne({ id: target.body.user.id });
    expect(stored?.groups ?? []).not.toContain('SYSTEM');

    const login = await supertest(app.app).post('/auth/login').send({
      email: target.payload.email,
      password: AUTH_PASSWORD,
    });
    const claims = jwt.decode(login.body.accessToken) as jwt.JwtPayload;
    expect(claims.groups).not.toContain('SYSTEM');
  });
});
