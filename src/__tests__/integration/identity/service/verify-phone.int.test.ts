import { Types } from 'mongoose';
import { UserServiceFactory } from '../../../../configuration/factory/user.service.factory';
import { EErrorCode } from '../../../../domain/common/errors/enums/EErrorCode';
import { validUserMock } from '../../../__mocks__/user.mock';

const userService = UserServiceFactory.create();

describe('when we verify the phone of an existing user', () => {
  it('should mark phoneVerified as true', async () => {
    const user = await userService.createUser(validUserMock());

    const result = await userService.verifyPhone(user.id);

    expect(result).toMatchObject({
      id: user.id,
      phoneVerified: true,
    });
  });
});

describe('when we verify the phone of a missing user', () => {
  it('should reject with RESOURCE_NOT_FOUND', async () => {
    const missingId = new Types.ObjectId().toHexString();

    await expect(userService.verifyPhone(missingId)).rejects.toMatchObject({
      status: 404,
      errorCode: EErrorCode.RESOURCE_NOT_FOUND,
      details: { id: missingId },
    });
  });
});
