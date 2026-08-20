import { UserServiceFactory } from '../../../../configuration/factory/user.service.factory';
import { EErrorCode } from '../../../../domain/common/errors/enums/EErrorCode';
import { UserModel } from '../../../../infraestructure/db/mongo/models/user.model';
import { ErrorCatalog } from '../../../../infraestructure/i18n/error-catalog';
import { validUserMock } from '../../../__mocks__/user.mock';
import { ownerActor } from '../../../__mocks__/actor.mock';

const userService = UserServiceFactory.create();

describe('when we update a user by id', () => {
  it('should return the updated user when it exists', async () => {
    const userData = validUserMock();
    await UserModel.create(userData);

    const result = await userService.updateUserById(
      userData.id,
      {
        userData: { fullName: 'Updated Name' },
      },
      ownerActor(userData.id),
    );

    expect(result?.fullName).toBe('Updated Name');
    expect(result?.email).toBe(userData.email);
  });

  it('should reject with RESOURCE_NOT_FOUND when the user does not exist', async () => {
    await expect(
      userService.updateUserById(
        'nonexistent',
        {
          userData: { fullName: 'Updated' },
        },
        ownerActor('nonexistent'),
      ),
    ).rejects.toMatchObject({
      status: 404,
      errorCode: EErrorCode.RESOURCE_NOT_FOUND,
      details: { id: 'nonexistent' },
    });
    expect(ErrorCatalog[EErrorCode.RESOURCE_NOT_FOUND]).toBeDefined();
  });
});
