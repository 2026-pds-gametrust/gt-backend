import { Types } from 'mongoose';
import { UserService } from '../../../../domain/identity/service/user.service';
import { IUser } from '../../../../domain/identity/entity/interfaces/user.interface';
import { EErrorCode } from '../../../../domain/common/errors/enums/EErrorCode';
import { buildValidCpf } from '../../../../domain/common/types/cpf';
import { EUserStatus } from '../../../../domain/identity/entity/enums/EUserStatus';

function birthDateYearsAgo(years: number, dayOffset = 0): string {
  const today = new Date();
  const year = today.getUTCFullYear() - years;
  const month = today.getUTCMonth();
  const day = today.getUTCDate() + dayOffset;
  const date = new Date(Date.UTC(year, month, day));
  const yyyy = date.getUTCFullYear();
  const mm = String(date.getUTCMonth() + 1).padStart(2, '0');
  const dd = String(date.getUTCDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

function buildUserService(store: Map<string, IUser>) {
  return new UserService({
    userRepositoryRead: {
      findUserById: async (id) => store.get(id) ?? null,
      findUserByEmail: async (email) =>
        [...store.values()].find((user) => user.email === email) ?? null,
      findUserByCpf: async (cpf) =>
        [...store.values()].find((user) => user.cpf === cpf) ?? null,
      listUsers: async () => [...store.values()],
    },
    userRepositoryWrite: {
      createUser: async (user) => {
        store.set(user.id, user);
        return user;
      },
      updateUserById: async (id, data) => {
        const existing = store.get(id);
        if (!existing) return null;
        const updated = { ...existing, ...data } as IUser;
        store.set(id, updated);
        return updated;
      },
      deleteUserById: async () => null,
    },
    eventPublisher: {
      publish: jest.fn().mockResolvedValue(undefined),
    },
  });
}

describe('when creating a user at the adult age boundary', () => {
  it('should accept a user who turns 18 today in UTC', async () => {
    const service = buildUserService(new Map());
    const created = await service.createUser({
      id: new Types.ObjectId().toHexString(),
      fullName: 'Adult Today',
      email: `adult-today-${Date.now()}@email.com`,
      phone: '+5511999999999',
      cpf: buildValidCpf(Date.now()),
      birthDate: birthDateYearsAgo(18, 0),
      status: EUserStatus.PENDING_VERIFICATION,
    });

    expect(created.fullName).toBe('Adult Today');
  });

  it('should reject a user one day before turning 18', async () => {
    const service = buildUserService(new Map());

    await expect(
      service.createUser({
        id: new Types.ObjectId().toHexString(),
        fullName: 'Almost Adult',
        email: `almost-adult-${Date.now()}@email.com`,
        phone: '+5511999999999',
        cpf: buildValidCpf(Date.now() + 1),
        birthDate: birthDateYearsAgo(18, 1),
        status: EUserStatus.PENDING_VERIFICATION,
      }),
    ).rejects.toMatchObject({
      status: 400,
      errorCode: EErrorCode.USER_UNDERAGE,
    });
  });

  it('should accept a user older than 18', async () => {
    const service = buildUserService(new Map());
    const created = await service.createUser({
      id: new Types.ObjectId().toHexString(),
      fullName: 'Older Adult',
      email: `older-adult-${Date.now()}@email.com`,
      phone: '+5511999999999',
      cpf: buildValidCpf(Date.now() + 2),
      birthDate: birthDateYearsAgo(30, 0),
      status: EUserStatus.PENDING_VERIFICATION,
    });

    expect(created.id).toBeDefined();
  });
});
