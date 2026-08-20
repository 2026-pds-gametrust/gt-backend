import { Types } from 'mongoose';
import { UserServiceFactory } from '../../../../configuration/factory/user.service.factory';
import { buildValidCpf } from '../../../../domain/common/types/cpf';
import { EErrorCode } from '../../../../domain/common/errors/enums/EErrorCode';
import { UserService } from '../../../../domain/identity/service/user.service';
import { UserModel } from '../../../../infraestructure/db/mongo/models/user.model';
import { UserRepositoryRead } from '../../../../infraestructure/repository/identity/user.repository.read';
import { UserRepositoryWrite } from '../../../../infraestructure/repository/identity/user.repository.write';
import { validUserMock } from '../../../__mocks__/user.mock';

const userService = UserServiceFactory.create();

describe('when we create a user with a unique email and cpf', () => {
  it('should return the created user', async () => {
    const user = validUserMock();
    const result = await userService.createUser(user);

    expect(result).toMatchObject({
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      cpf: user.cpf,
      verified: false,
      phoneVerified: false,
    });
  });
});

describe('when we create a user with a duplicate cpf', () => {
  it('should reject with RESOURCE_CONFLICT', async () => {
    const cpf = buildValidCpf(Date.now());
    const existing = validUserMock({ cpf });
    await UserModel.create(existing);

    await expect(
      userService.createUser(
        validUserMock({
          id: new Types.ObjectId().toHexString(),
          email: `other+${Date.now()}@email.com`,
          cpf,
        }),
      ),
    ).rejects.toMatchObject({
      status: 409,
      errorCode: EErrorCode.RESOURCE_CONFLICT,
      details: { cpf },
    });
  });
});

describe('when we create an underage user', () => {
  it('should reject with USER_UNDERAGE', async () => {
    const underage = validUserMock({ birthDate: '2015-01-01' });

    await expect(userService.createUser(underage)).rejects.toMatchObject({
      status: 400,
      errorCode: EErrorCode.USER_UNDERAGE,
    });
  });
});

describe('when we create a user', () => {
  it('should publish identity.user.registered without cpf in payload', async () => {
    const publisher = {
      publish: jest.fn().mockResolvedValue(undefined),
    };

    const service = new UserService({
      userRepositoryRead: new UserRepositoryRead(),
      userRepositoryWrite: new UserRepositoryWrite(),
      eventPublisher: publisher,
    });

    const user = validUserMock();
    await service.createUser(user);

    expect(publisher.publish).toHaveBeenCalledTimes(1);
    const envelope = publisher.publish.mock.calls[0][0];
    expect(envelope).toMatchObject({
      eventType: 'identity.user.registered',
      aggregateId: user.id,
      producerModule: 'identity',
      payload: { userId: user.id },
    });
    expect(envelope.payload).not.toHaveProperty('cpf');
    expect(JSON.stringify(envelope.payload)).not.toContain(user.cpf);
  });
});
