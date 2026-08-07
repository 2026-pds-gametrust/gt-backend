import supertest from 'supertest';
import { app } from '../../../../../jest/setup-integration-tests';
import { UserModel } from '../../../../infraestructure/db/mongo/models/user.model';
import { validUserMock } from '../../../__mocks__/user.mock';

describe('when we create a valid user via HTTP', () => {
  it('should return success and the created user', async () => {
    const paramsCreate = validUserMock({
      fullName: 'Whitebeard',
      email: `whitebeard+${Date.now()}@email.com`,
    });

    const { body, statusCode } = await supertest(app.app)
      .post(`/users`)
      .send(paramsCreate);

    const userInDb = await UserModel.findOne({ id: paramsCreate.id });

    expect(body).toMatchObject({
      id: paramsCreate.id,
      fullName: paramsCreate.fullName,
      email: paramsCreate.email,
      cpf: paramsCreate.cpf,
    });
    expect(body.createdAt).toBeDefined();
    expect(new Date(body.createdAt).toISOString()).toBe(body.createdAt);
    expect(statusCode).toBe(201);
    expect(userInDb).toMatchObject({
      id: paramsCreate.id,
      fullName: paramsCreate.fullName,
      email: paramsCreate.email,
    });
  });
});
