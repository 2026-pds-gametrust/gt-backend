import { ProfileModel } from '../../../../infraestructure/db/mongo/models/profile.model';
import { ProfileRepositoryRead } from '../../../../infraestructure/repository/identity/profile.repository.read';
import { ProfileRepositoryWrite } from '../../../../infraestructure/repository/identity/profile.repository.write';
import { EErrorCode } from '../../../../domain/common/errors/enums/EErrorCode';
import { validProfileMock } from '../../../__mocks__/profile.mock';

const repositoryRead = new ProfileRepositoryRead();
const repositoryWrite = new ProfileRepositoryWrite();

describe('when profile repository read hits a database failure', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should throw DATABASE_ERROR on findProfileById', async () => {
    jest.spyOn(ProfileModel, 'findOne').mockRejectedValueOnce(new Error('boom'));
    await expect(repositoryRead.findProfileById('id')).rejects.toMatchObject({
      status: 500,
      errorCode: EErrorCode.DATABASE_ERROR,
    });
  });

  it('should throw DATABASE_ERROR on findProfileByUserId', async () => {
    jest.spyOn(ProfileModel, 'findOne').mockRejectedValueOnce(new Error('boom'));
    await expect(
      repositoryRead.findProfileByUserId('user-1'),
    ).rejects.toMatchObject({
      status: 500,
      errorCode: EErrorCode.DATABASE_ERROR,
    });
  });

  it('should throw DATABASE_ERROR on listProfiles', async () => {
    jest.spyOn(ProfileModel, 'find').mockRejectedValueOnce(new Error('boom'));
    await expect(repositoryRead.listProfiles()).rejects.toMatchObject({
      status: 500,
      errorCode: EErrorCode.DATABASE_ERROR,
    });
  });
});

describe('when profile repository write hits a database failure', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should throw DATABASE_ERROR on createProfile', async () => {
    jest.spyOn(ProfileModel, 'create').mockRejectedValueOnce(new Error('boom'));
    await expect(
      repositoryWrite.createProfile(validProfileMock()),
    ).rejects.toMatchObject({
      status: 500,
      errorCode: EErrorCode.DATABASE_ERROR,
    });
  });

  it('should throw DATABASE_ERROR on updateProfileById', async () => {
    jest
      .spyOn(ProfileModel, 'findOneAndUpdate')
      .mockRejectedValueOnce(new Error('boom'));
    await expect(
      repositoryWrite.updateProfileById('id', { locationApprox: 'SP' }),
    ).rejects.toMatchObject({
      status: 500,
      errorCode: EErrorCode.DATABASE_ERROR,
    });
  });

  it('should throw DATABASE_ERROR on deleteProfileById', async () => {
    jest
      .spyOn(ProfileModel, 'findOneAndDelete')
      .mockRejectedValueOnce(new Error('boom'));
    await expect(
      repositoryWrite.deleteProfileById('id'),
    ).rejects.toMatchObject({
      status: 500,
      errorCode: EErrorCode.DATABASE_ERROR,
    });
  });
});
