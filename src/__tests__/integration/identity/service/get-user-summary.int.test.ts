import { Types } from 'mongoose';
import { UserServiceFactory } from '../../../../configuration/factory/user.service.factory';
import { validUserMock } from '../../../__mocks__/user.mock';

const userService = UserServiceFactory.create();

describe('when we get a user summary for an existing user', () => {
  it('should return the summary with userId, name and verified', async () => {
    const user = await userService.createUser(validUserMock());

    const summary = await userService.getUserSummary(user.id);

    expect(summary).toEqual({
      userId: user.id,
      name: user.fullName,
      verified: user.verified,
    });
  });
});

describe('when we get a user summary for a missing user', () => {
  it('should return null', async () => {
    const summary = await userService.getUserSummary(
      new Types.ObjectId().toHexString(),
    );

    expect(summary).toBeNull();
  });
});
