import { Types } from 'mongoose';
import { EErrorCode } from '../../../../domain/common/errors/enums/EErrorCode';
import { buildValidCpf } from '../../../../domain/common/types/cpf';
import { IEventPublisher } from '../../../../domain/common/messaging/event-publisher.interface';
import { IUser } from '../../../../domain/identity/entity/interfaces/user.interface';
import { UserService } from '../../../../domain/identity/service/user.service';
import { validUserMock } from '../../../__mocks__/user.mock';
import { adminActor, ownerActor } from '../../../__mocks__/actor.mock';
import { EUserStatus } from '../../../../domain/identity/entity/enums/EUserStatus';

function buildService(overrides: {
  users?: Map<string, IUser>;
  updateUserById?: (id: string, data: Partial<IUser>) => Promise<IUser | null>;
} = {}) {
  const users = overrides.users ?? new Map<string, IUser>();
  const publisher: IEventPublisher = {
    publish: jest.fn().mockResolvedValue(undefined),
  };

  const service = new UserService({
    userRepositoryRead: {
      findUserById: async (id: string) => users.get(id) ?? null,
      findUserByEmail: async (email: string) =>
        [...users.values()].find((u) => u.email === email) ?? null,
      findUserByCpf: async (cpf: string) =>
        [...users.values()].find((u) => u.cpf === cpf) ?? null,
      listUsers: async () => [...users.values()],
    },
    userRepositoryWrite: {
      createUser: async (user: IUser) => {
        users.set(user.id, user);
        return user;
      },
      updateUserById:
        overrides.updateUserById ??
        (async (id: string, data: Partial<IUser>) => {
          const existing = users.get(id);
          if (!existing) return null;
          const updated = { ...existing, ...data };
          users.set(id, updated);
          return updated;
        }),
      deleteUserById: async (id: string) => {
        const existing = users.get(id) ?? null;
        users.delete(id);
        return existing;
      },
    },
    eventPublisher: publisher,
  });

  return { service, users, publisher };
}

describe('when getUserSummary cannot find the user', () => {
  it('should return null', async () => {
    const { service } = buildService();
    await expect(
      service.getUserSummary(new Types.ObjectId().toHexString()),
    ).resolves.toBeNull();
  });
});

describe('when verifyPhone write returns null', () => {
  it('should reject with RESOURCE_NOT_FOUND', async () => {
    const user = validUserMock();
    const { service } = buildService({
      users: new Map([[user.id, user]]),
      updateUserById: async () => null,
    });

    await expect(service.verifyPhone(user.id)).rejects.toMatchObject({
      status: 404,
      errorCode: EErrorCode.RESOURCE_NOT_FOUND,
    });
  });
});

describe('when verifyUser write returns null', () => {
  it('should reject with RESOURCE_NOT_FOUND and not publish', async () => {
    const user = validUserMock();
    const { service, publisher } = buildService({
      users: new Map([[user.id, user]]),
      updateUserById: async () => null,
    });

    await expect(service.verifyUser(user.id)).rejects.toMatchObject({
      status: 404,
      errorCode: EErrorCode.RESOURCE_NOT_FOUND,
    });
    expect(publisher.publish).not.toHaveBeenCalled();
  });
});

describe('when updating a user with email and cpf conflicts', () => {
  it('should reject email conflict', async () => {
    const user = validUserMock({ email: 'a@example.com' });
    const other = validUserMock({ email: 'b@example.com' });
    const { service } = buildService({
      users: new Map([
        [user.id, user],
        [other.id, other],
      ]),
    });

    await expect(
      service.updateUserById(user.id, {
        userData: { email: 'b@example.com' },
      }, ownerActor(user.id)),
    ).rejects.toMatchObject({
      status: 409,
      errorCode: EErrorCode.RESOURCE_CONFLICT,
    });
  });

  it('should reject cpf conflict', async () => {
    const cpfOther = buildValidCpf(9001);
    const user = validUserMock({ cpf: buildValidCpf(9002) });
    const other = validUserMock({ cpf: cpfOther });
    const { service } = buildService({
      users: new Map([
        [user.id, user],
        [other.id, other],
      ]),
    });

    await expect(
      service.updateUserById(user.id, {
        userData: { cpf: cpfOther },
      }, ownerActor(user.id)),
    ).rejects.toMatchObject({
      status: 409,
      errorCode: EErrorCode.RESOURCE_CONFLICT,
    });
  });
});

describe('when updating a user to underage birthDate', () => {
  it('should reject with USER_UNDERAGE', async () => {
    const user = validUserMock();
    const { service } = buildService({
      users: new Map([[user.id, user]]),
    });

    await expect(
      service.updateUserById(user.id, {
        userData: { birthDate: '2015-06-01' },
      }, ownerActor(user.id)),
    ).rejects.toMatchObject({
      status: 400,
      errorCode: EErrorCode.USER_UNDERAGE,
    });
  });
});

describe('when an owner updates a user without fullName or phone in payload', () => {
  it('should keep existing identity fields and ignore privileged flags', async () => {
    const user = validUserMock({
      fullName: 'Keep Name',
      phone: '+5511888888888',
      verified: false,
      status: EUserStatus.PENDING_VERIFICATION,
    });
    const { service } = buildService({
      users: new Map([[user.id, user]]),
    });

    const updated = await service.updateUserById(
      user.id,
      { userData: { verified: true, status: EUserStatus.ACTIVE } },
      ownerActor(user.id),
    );

    expect(updated.fullName).toBe('Keep Name');
    expect(updated.phone).toBe('+5511888888888');
    expect(updated.verified).toBe(false);
    expect(updated.status).toBe(EUserStatus.PENDING_VERIFICATION);
  });
});

describe('when an ADMIN updates verified status via updateUserById', () => {
  it('should persist privileged fields', async () => {
    const user = validUserMock({ verified: false });
    const { service } = buildService({
      users: new Map([[user.id, user]]),
    });

    const updated = await service.updateUserById(
      user.id,
      { userData: { verified: true, status: EUserStatus.ACTIVE } },
      adminActor(),
    );

    expect(updated.verified).toBe(true);
    expect(updated.status).toBe(EUserStatus.ACTIVE);
  });
});

describe('when updateUserById write returns null', () => {
  it('should reject with RESOURCE_NOT_FOUND', async () => {
    const user = validUserMock();
    const { service } = buildService({
      users: new Map([[user.id, user]]),
      updateUserById: async () => null,
    });

    await expect(
      service.updateUserById(
        user.id,
        { userData: { fullName: 'Updated' } },
        ownerActor(user.id),
      ),
    ).rejects.toMatchObject({
      status: 404,
      errorCode: EErrorCode.RESOURCE_NOT_FOUND,
    });
  });
});
