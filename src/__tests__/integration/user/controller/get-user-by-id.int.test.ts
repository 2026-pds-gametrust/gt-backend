import { EUserGroup } from '@sauvvitech/st-packages';
import { signTestAccessToken } from '../../../helpers/sign-test-access-token';
import supertest from 'supertest';
import { app } from '../../../../../jest/setup-integration-tests';
import { EErrorCode } from '../../../../domain/common/errors/enums/EErrorCode';
import { UserModel } from '../../../../infraestructure/db/mongo/models/user.model';
import { ErrorCatalog } from '../../../../infraestructure/i18n/error-catalog';
import { validUserMock } from '../../../__mocks__/user.mock';

describe('when we get a user by id via HTTP', () => {
  it('should return the user when it exists', async () => {
    const userData = validUserMock();
    await UserModel.create(userData);

    const { body, statusCode } = await supertest(app.app)
      .get(`/users/${userData.id}`)
      .set(
        'Authorization',
        `Bearer ${signTestAccessToken({ actorId: userData.id, groups: [EUserGroup.APP_USER] })}`,
      );

    expect(statusCode).toBe(200);
    expect(body).toMatchObject({
      id: userData.id,
      fullName: userData.fullName,
      email: userData.email,
    });
  });

  it('should return 404 when the user does not exist', async () => {
    const { body, statusCode } = await supertest(app.app)
      .get('/users/nonexistent-id')
      .set(
        'Authorization',
        `Bearer ${signTestAccessToken({ actorId: 'admin-actor', groups: [EUserGroup.ADMIN] })}`,
      );

    expect(statusCode).toBe(404);
    expect(body).toMatchObject({
      code: EErrorCode.RESOURCE_NOT_FOUND,
      error: ErrorCatalog[EErrorCode.RESOURCE_NOT_FOUND].en,
    });
  });
});
