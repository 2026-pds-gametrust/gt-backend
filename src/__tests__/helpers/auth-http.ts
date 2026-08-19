import { EUserGroup } from '@sauvvitech/st-packages';
import { Types } from 'mongoose';
import supertest from 'supertest';
import { app } from '../../../jest/setup-integration-tests';
import { validUserMock } from '../__mocks__/user.mock';
import { signTestAccessToken } from './sign-test-access-token';
import { birthDateYearsAgo } from './auth-assertions';

export const AUTH_PASSWORD = 'correct-horse-battery';

export function registrationBody(override?: Record<string, unknown>) {
  const user = validUserMock();
  return {
    id: user.id,
    fullName: user.fullName,
    email: user.email,
    phone: user.phone,
    cpf: user.cpf,
    birthDate: user.birthDate,
    password: AUTH_PASSWORD,
    ...override,
  };
}

export async function registerMember(override?: Record<string, unknown>) {
  const body = registrationBody(override);
  const response = await supertest(app.app).post('/auth/register').send(body);
  return { body: response.body, statusCode: response.statusCode, payload: body, headers: response.headers };
}

export function adminBearer(actorId = 'admin-actor') {
  return `Bearer ${signTestAccessToken({ actorId, groups: [EUserGroup.ADMIN] })}`;
}

export function appUserBearer(actorId: string) {
  return `Bearer ${signTestAccessToken({ actorId, groups: [EUserGroup.APP_USER] })}`;
}

export function backofficeBearer(actorId = 'backoffice-actor') {
  return `Bearer ${signTestAccessToken({ actorId, groups: [EUserGroup.BACKOFFICE] })}`;
}

export { birthDateYearsAgo, Types };
