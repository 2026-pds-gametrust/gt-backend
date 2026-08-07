import { Types } from 'mongoose';
import { EventPublisherFactory } from '../../../../configuration/factory/messaging/event-publisher.factory';
import { UserServiceFactory } from '../../../../configuration/factory/user.service.factory';
import { EErrorCode } from '../../../../domain/common/errors/enums/EErrorCode';
import { EUserStatus } from '../../../../domain/identity/entity/enums/EUserStatus';
import { validUserMock } from '../../../__mocks__/user.mock';

const userService = UserServiceFactory.create();

describe('when we verify an existing user', () => {
  it('should mark the user as verified and active', async () => {
    const user = await userService.createUser(validUserMock());

    const result = await userService.verifyUser(user.id);

    expect(result).toMatchObject({
      id: user.id,
      verified: true,
      status: EUserStatus.ACTIVE,
    });
  });

  it('should publish identity.user.verified', async () => {
    const publishSpy = jest
      .spyOn(EventPublisherFactory.create(), 'publish')
      .mockResolvedValue(undefined);

    const user = await userService.createUser(validUserMock());
    publishSpy.mockClear();

    await userService.verifyUser(user.id);

    expect(publishSpy).toHaveBeenCalledTimes(1);
    expect(publishSpy.mock.calls[0][0]).toMatchObject({
      eventType: 'identity.user.verified',
      aggregateId: user.id,
      producerModule: 'identity',
      payload: { userId: user.id },
    });

    publishSpy.mockRestore();
  });
});

describe('when we verify a missing user', () => {
  it('should reject with RESOURCE_NOT_FOUND and not publish', async () => {
    const publishSpy = jest
      .spyOn(EventPublisherFactory.create(), 'publish')
      .mockResolvedValue(undefined);
    publishSpy.mockClear();

    const missingId = new Types.ObjectId().toHexString();

    await expect(userService.verifyUser(missingId)).rejects.toMatchObject({
      status: 404,
      errorCode: EErrorCode.RESOURCE_NOT_FOUND,
      details: { id: missingId },
    });
    expect(publishSpy).not.toHaveBeenCalled();

    publishSpy.mockRestore();
  });
});
