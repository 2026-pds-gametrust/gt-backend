import { EUserGroup } from '@sauvvitech/st-packages';
import supertest from 'supertest';
import { app } from '../../../../../jest/setup-integration-tests';
import { EErrorCode } from '../../../../domain/common/errors/enums/EErrorCode';
import { CredentialModel } from '../../../../infraestructure/db/mongo/models/credential.model';
import { UserModel } from '../../../../infraestructure/db/mongo/models/user.model';
import { validUserMock } from '../../../__mocks__/user.mock';
import { assertNoSecretFields, assertUnauthorized } from '../../../helpers/auth-assertions';
import {
  AUTH_PASSWORD,
  adminBearer,
  appUserBearer,
  backofficeBearer,
  registerMember,
} from '../../../helpers/auth-http';

describe('when posting /users without a token', () => {
  it('should return 401 and not create a User', async () => {
    const params = validUserMock();
    const before = await UserModel.countDocuments({ id: params.id });

    const response = await supertest(app.app).post('/users').send({
      id: params.id,
      fullName: params.fullName,
      email: params.email,
      phone: params.phone,
      cpf: params.cpf,
      birthDate: params.birthDate,
    });

    expect(response.statusCode).toBe(401);
    assertUnauthorized(response);
    expect(await UserModel.countDocuments({ id: params.id })).toBe(before);
  });
});

describe('when posting /users as APP_USER or BACKOFFICE-only', () => {
  it('should return 403 and not create a User', async () => {
    const member = await registerMember();
    const params = validUserMock();

    const asAppUser = await supertest(app.app)
      .post('/users')
      .set('Authorization', appUserBearer(member.body.user.id))
      .send({
        id: params.id,
        fullName: params.fullName,
        email: params.email,
        phone: params.phone,
        cpf: params.cpf,
        birthDate: params.birthDate,
      });
    expect(asAppUser.statusCode).toBe(403);
    expect(asAppUser.body).toMatchObject({ error: 'Access denied' });

    const asBackoffice = await supertest(app.app)
      .post('/users')
      .set('Authorization', backofficeBearer())
      .send({
        id: params.id,
        fullName: params.fullName,
        email: params.email,
        phone: params.phone,
        cpf: params.cpf,
        birthDate: params.birthDate,
      });
    expect(asBackoffice.statusCode).toBe(403);
    expect(await UserModel.findOne({ id: params.id })).toBeNull();
  });
});

describe('when an ADMIN posts /users', () => {
  it('should return 201 User without a password or credential', async () => {
    const params = validUserMock();

    const response = await supertest(app.app)
      .post('/users')
      .set('Authorization', adminBearer())
      .send({
        id: params.id,
        fullName: params.fullName,
        email: params.email,
        phone: params.phone,
        cpf: params.cpf,
        birthDate: params.birthDate,
      });

    expect(response.statusCode).toBe(201);
    expect(response.body.id).toBe(params.id);
    expect(response.body.groups ?? []).toEqual([]);
    assertNoSecretFields(response.body);
    expect(await CredentialModel.findOne({ userId: params.id })).toBeNull();
  });
});

describe('when an ADMIN-provisioned User tries to login', () => {
  it('should return 401 AUTH_INVALID_CREDENTIALS because no credential exists', async () => {
    const params = validUserMock();
    await supertest(app.app)
      .post('/users')
      .set('Authorization', adminBearer())
      .send({
        id: params.id,
        fullName: params.fullName,
        email: params.email,
        phone: params.phone,
        cpf: params.cpf,
        birthDate: params.birthDate,
      });

    const login = await supertest(app.app).post('/auth/login').send({
      email: params.email,
      password: AUTH_PASSWORD,
    });
    expect(login.statusCode).toBe(401);
    expect(login.body.code).toBe(EErrorCode.AUTH_INVALID_CREDENTIALS);
    expect(await CredentialModel.findOne({ userId: params.id })).toBeNull();
  });
});

describe('when accessing User PII as owner, ADMIN, other, BACKOFFICE or unauthenticated', () => {
  it('should allow owner and ADMIN and reject the others', async () => {
    const lucas = await registerMember();
    const carlos = await registerMember();
    const lucasId = lucas.body.user.id;
    const originalName = lucas.body.user.fullName;

    const ownerGet = await supertest(app.app)
      .get(`/users/${lucasId}`)
      .set('Authorization', `Bearer ${lucas.body.accessToken}`);
    expect(ownerGet.statusCode).toBe(200);
    expect(ownerGet.body.email).toBe(lucas.payload.email.toLowerCase());
    assertNoSecretFields(ownerGet.body);

    const adminGet = await supertest(app.app)
      .get(`/users/${lucasId}`)
      .set('Authorization', adminBearer());
    expect(adminGet.statusCode).toBe(200);

    const otherGet = await supertest(app.app)
      .get(`/users/${lucasId}`)
      .set('Authorization', `Bearer ${carlos.body.accessToken}`);
    expect(otherGet.statusCode).toBe(403);
    expect(otherGet.body.code).toBe(EErrorCode.FIELD_INVALID);
    expect(otherGet.body.email).toBeUndefined();
    expect(otherGet.body.cpf).toBeUndefined();

    const backofficeGet = await supertest(app.app)
      .get(`/users/${lucasId}`)
      .set('Authorization', backofficeBearer('camila-backoffice'));
    expect(backofficeGet.statusCode).toBe(403);
    expect(backofficeGet.body.code).toBe(EErrorCode.FIELD_INVALID);

    const unauthGet = await supertest(app.app).get(`/users/${lucasId}`);
    assertUnauthorized(unauthGet);

    const otherPut = await supertest(app.app)
      .put(`/users/${lucasId}`)
      .set('Authorization', `Bearer ${carlos.body.accessToken}`)
      .send({ fullName: 'Hijacked Name Here' });
    expect(otherPut.statusCode).toBe(403);
    expect(otherPut.body.code).toBe(EErrorCode.FIELD_INVALID);
    expect((await UserModel.findOne({ id: lucasId }))?.fullName).toBe(
      originalName,
    );

    const otherDelete = await supertest(app.app)
      .delete(`/users/${lucasId}`)
      .set('Authorization', `Bearer ${carlos.body.accessToken}`);
    expect(otherDelete.statusCode).toBe(403);
    expect(otherDelete.body.code).toBe(EErrorCode.FIELD_INVALID);
    expect(await UserModel.findOne({ id: lucasId })).not.toBeNull();
  });
});

describe('when putting groups on UpdateUser', () => {
  it('should ignore mass-assigned groups and leave them unchanged', async () => {
    const member = await registerMember();
    const before = (await UserModel.findOne({ id: member.body.user.id }))
      ?.groups;

    const updated = await supertest(app.app)
      .put(`/users/${member.body.user.id}`)
      .set('Authorization', `Bearer ${member.body.accessToken}`)
      .send({
        fullName: 'Carlos Groups Guard',
        groups: [EUserGroup.ADMIN],
      });

    expect(updated.statusCode).toBe(200);
    expect(updated.body.groups).toEqual(before ?? [EUserGroup.APP_USER]);
    const stored = await UserModel.findOne({ id: member.body.user.id });
    expect(stored?.groups).toEqual(before ?? [EUserGroup.APP_USER]);
    expect(stored?.groups).not.toContain(EUserGroup.ADMIN);
  });
});

describe('when an owner puts verified or status on UpdateUser', () => {
  it('should ignore privileged fields and leave them unchanged', async () => {
    const member = await registerMember();
    const userId = member.body.user.id;
    const before = await UserModel.findOne({ id: userId });

    const updated = await supertest(app.app)
      .put(`/users/${userId}`)
      .set('Authorization', `Bearer ${member.body.accessToken}`)
      .send({
        fullName: 'Carlos Status Guard',
        verified: true,
        phoneVerified: true,
        status: 'ACTIVE',
      });

    expect(updated.statusCode).toBe(200);
    expect(updated.body.fullName).toBe('Carlos Status Guard');
    expect(updated.body.verified).toBe(false);
    expect(updated.body.phoneVerified).toBe(false);
    expect(updated.body.status).toBe(before?.status);
    const stored = await UserModel.findOne({ id: userId });
    expect(stored?.verified).toBe(false);
    expect(stored?.phoneVerified).toBe(false);
    expect(stored?.status).toBe(before?.status);
  });
});
