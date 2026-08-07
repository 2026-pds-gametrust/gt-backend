import supertest from 'supertest';
import { app } from '../../../../../jest/setup-integration-tests';
import { EErrorCode } from '../../../../domain/common/errors/enums/EErrorCode';
import { UserModel } from '../../../../infraestructure/db/mongo/models/user.model';
import { ErrorCatalog } from '../../../../infraestructure/i18n/error-catalog';
import { validUserMock } from '../../../__mocks__/user.mock';

describe('when we update a user via HTTP', () => {
  it('should return the updated user', async () => {
    const userData = validUserMock();
    await UserModel.create(userData);

    const { body, statusCode } = await supertest(app.app)
      .put(`/users/${userData.id}`)
      .send({ fullName: 'Updated Name' });

    expect(statusCode).toBe(200);
    expect(body.fullName).toBe('Updated Name');
    expect(body.email).toBe(userData.email);
    expect(body.id).toBe(userData.id);
  });

  it('should return 404 when the user does not exist', async () => {
    const { body, statusCode } = await supertest(app.app)
      .put('/users/nonexistent-id')
      .send({ fullName: 'Updated' });

    expect(statusCode).toBe(404);
    expect(body).toMatchObject({
      code: EErrorCode.RESOURCE_NOT_FOUND,
      error: ErrorCatalog[EErrorCode.RESOURCE_NOT_FOUND].en,
    });
  });
});
