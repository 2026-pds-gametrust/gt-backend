import { EUserGroup } from '@sauvvitech/st-packages';
import { signTestAccessToken } from '../../../helpers/sign-test-access-token';
import supertest from 'supertest';
import { app } from '../../../../../jest/setup-integration-tests';
import { UserModel } from '../../../../infraestructure/db/mongo/models/user.model';
import { validUserMock } from '../../../__mocks__/user.mock';

describe('when we list all users via HTTP', () => {
  it('should return the list of users', async () => {
    const userData = validUserMock();
    await UserModel.create(userData);

    const { body, statusCode } = await supertest(app.app)
      .get('/users')
      .set('Authorization', `Bearer ${signTestAccessToken({ actorId: 'backoffice-actor', groups: [EUserGroup.BACKOFFICE] })}`)

    expect(statusCode).toBe(200);
    expect(Array.isArray(body)).toBe(true);
    expect(body.some((u: { id: string }) => u.id === userData.id)).toBe(true);
  });
});
