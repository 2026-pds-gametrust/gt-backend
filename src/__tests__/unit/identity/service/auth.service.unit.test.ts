import { EUserGroup } from '@sauvvitech/st-packages';
import { Logger } from 'traceability';
import { systemActorContext } from '../../../../domain/common/auth/actor-authorization';
import { EErrorCode } from '../../../../domain/common/errors/enums/EErrorCode';
import { IEventPublisher } from '../../../../domain/common/messaging/event-publisher.interface';
import { IActorContext } from '../../../../domain/common/types/actor-context';
import { EUserStatus } from '../../../../domain/identity/entity/enums/EUserStatus';
import { ICredential } from '../../../../domain/identity/entity/interfaces/credential.interface';
import { IRefreshSession } from '../../../../domain/identity/entity/interfaces/refresh-session.interface';
import { IUser } from '../../../../domain/identity/entity/interfaces/user.interface';
import {
  IAccessTokenClaims,
  ITokenSigner,
} from '../../../../domain/identity/ports/token-signer.interface';
import { IPasswordHasher } from '../../../../domain/identity/ports/password-hasher.interface';
import { IRefreshTokenHasher } from '../../../../domain/identity/ports/refresh-token-hasher.interface';
import { AuthService } from '../../../../domain/identity/service/auth.service';
import { UserService } from '../../../../domain/identity/service/user.service';
import { IProfile } from '../../../../domain/identity/entity/interfaces/profile.interface';
import { IProfileService } from '../../../../domain/identity/service/profile.service.interface';
import { validUserMock } from '../../../__mocks__/user.mock';
import { adminActor, ownerActor } from '../../../__mocks__/actor.mock';
import {
  assertNoSecretFields,
  birthDateYearsAgo,
} from '../../../helpers/auth-assertions';

const PASSWORD = 'correct-horse-battery';
const OPERATOR_GROUPS = [
  EUserGroup.BACKOFFICE,
  EUserGroup.ADMIN,
  EUserGroup.PARTNER,
  'SYSTEM',
];

function decodeAccess(token: string): IAccessTokenClaims {
  const encoded = token.replace(/^access\./, '');
  return JSON.parse(Buffer.from(encoded, 'base64url').toString('utf8'));
}

function buildAuthHarness() {
  const users = new Map<string, IUser>();
  const profiles = new Map<string, IProfile>();
  const credentialsByUserId = new Map<string, ICredential>();
  const sessionsById = new Map<string, IRefreshSession>();
  const sessionsByHash = new Map<string, IRefreshSession>();
  const publisher: IEventPublisher = {
    publish: jest.fn().mockResolvedValue(undefined),
  };

  const userRepositoryRead = {
    findUserById: async (id: string) => users.get(id) ?? null,
    findUserByEmail: async (email: string) =>
      [...users.values()].find((user) => user.email === email) ?? null,
    findUserByCpf: async (cpf: string) =>
      [...users.values()].find((user) => user.cpf === cpf) ?? null,
    listUsers: async () => [...users.values()],
    findUserIdsBySearchQuery: async () => [],
    findUsersByIds: async (ids: string[]) =>
      ids
        .map((id) => users.get(id))
        .filter((user): user is IUser => user !== undefined),
  };

  const userRepositoryWrite = {
    createUser: async (user: IUser) => {
      users.set(user.id, user);
      return user;
    },
    updateUserById: async (id: string, data: Partial<IUser>) => {
      const existing = users.get(id);
      if (!existing) return null;
      const updated = { ...existing, ...data };
      users.set(id, updated);
      return updated;
    },
    deleteUserById: async (id: string) => {
      const existing = users.get(id) ?? null;
      users.delete(id);
      return existing;
    },
  };

  const userService = new UserService({
    userRepositoryRead,
    userRepositoryWrite,
    eventPublisher: publisher,
  });

  const profileService: IProfileService = {
    createProfile: async (params) => {
      const profile: IProfile = {
        id: params.id,
        userId: params.userId,
        displayName: params.displayName,
        addresses: params.addresses ?? [],
        createdAt: new Date(),
      };
      profiles.set(params.userId, profile);
      return profile;
    },
    getProfileById: async (id) => {
      const found = [...profiles.values()].find((p) => p.id === id);
      if (!found) {
        throw {
          status: 404,
          errorCode: EErrorCode.RESOURCE_NOT_FOUND,
          message: 'Profile not found',
        };
      }
      return found;
    },
    getProfileByUserId: async (userId) => {
      const found = profiles.get(userId);
      if (!found) {
        throw {
          status: 404,
          errorCode: EErrorCode.RESOURCE_NOT_FOUND,
          message: 'Profile not found',
        };
      }
      return found;
    },
    updateProfileById: async () => {
      throw new Error('not implemented in harness');
    },
    updateProfileByUserId: async () => {
      throw new Error('not implemented in harness');
    },
    listProfiles: async () => [...profiles.values()],
    findProfilesNear: async () => [],
    getMyProfile: async (actor) => {
      const found = profiles.get(actor.actorId);
      if (!found) {
        throw {
          status: 404,
          errorCode: EErrorCode.RESOURCE_NOT_FOUND,
          message: 'Profile not found',
        };
      }
      return found;
    },
  };

  const passwordHasher: IPasswordHasher = {
    hash: jest.fn(async (plain) => `hashed:${plain}`),
    verify: jest.fn(async (plain, hash) => hash === `hashed:${plain}`),
  };

  let refreshSeq = 0;
  const refreshTokenHasher: IRefreshTokenHasher = {
    generate: () => {
      refreshSeq += 1;
      const plaintext = `refresh-${refreshSeq}`;
      return { plaintext, tokenHash: `sha:${plaintext}` };
    },
    hash: (plaintext: string) => `sha:${plaintext}`,
  };

  const tokenSigner: ITokenSigner = {
    signAccessToken: (claims) =>
      `access.${Buffer.from(JSON.stringify(claims)).toString('base64url')}`,
    verifyAccessToken: (token) => decodeAccess(token),
  };

  const service = new AuthService({
    userService,
    profileService,
    userRepositoryRead,
    userRepositoryWrite,
    credentialRepositoryRead: {
      findByUserId: async (userId) => credentialsByUserId.get(userId) ?? null,
      findCredentialById: async (id) =>
        [...credentialsByUserId.values()].find((c) => c.id === id) ?? null,
    },
    credentialRepositoryWrite: {
      createCredential: async (credential) => {
        credentialsByUserId.set(credential.userId, credential);
        return credential;
      },
      deleteByUserId: async (userId) => {
        const existing = credentialsByUserId.get(userId) ?? null;
        credentialsByUserId.delete(userId);
        return existing;
      },
    },
    refreshSessionRepositoryRead: {
      findByTokenHash: async (tokenHash) =>
        sessionsByHash.get(tokenHash) ?? null,
      findRefreshSessionById: async (id) => sessionsById.get(id) ?? null,
    },
    refreshSessionRepositoryWrite: {
      createRefreshSession: async (session) => {
        sessionsById.set(session.id, session);
        sessionsByHash.set(session.tokenHash, session);
        return session;
      },
      revokeIfUnrevoked: async (id) => {
        const session = sessionsById.get(id);
        if (!session || session.revokedAt) return null;
        session.revokedAt = new Date();
        return session;
      },
      revokeById: async (id) => {
        const session = sessionsById.get(id);
        if (!session) return null;
        session.revokedAt = new Date();
        return session;
      },
      invalidateAccessAndRevokeById: async (id) => {
        const session = sessionsById.get(id);
        if (!session) return null;
        const now = new Date();
        session.revokedAt = now;
        session.accessInvalidatedAt = now;
        return session;
      },
      revokeFamilyById: async (familyId) => {
        for (const session of sessionsById.values()) {
          if (session.familyId === familyId) {
            session.revokedAt = new Date();
          }
        }
      },
    },
    passwordHasher,
    tokenSigner,
    refreshTokenHasher,
    refreshTtlSeconds: 2_592_000,
  });

  return {
    service,
    users,
    profiles,
    credentialsByUserId,
    sessionsById,
    publisher,
    passwordHasher,
  };
}

function registerPayload(override?: Partial<IUser> & { password?: string }) {
  const user = validUserMock(override);
  return {
    id: user.id,
    fullName: user.fullName,
    email: user.email,
    phone: user.phone,
    cpf: user.cpf,
    birthDate: user.birthDate,
    password: override?.password ?? PASSWORD,
  };
}

function actorFromAccess(token: string): IActorContext {
  const claims = decodeAccess(token);
  return {
    actorId: claims.sub,
    groups: claims.groups,
    sessionId: claims.sid,
  };
}

describe('when registering an adult with a non-empty password', () => {
  it('should issue an APP_USER session without secrets or operator groups', async () => {
    const { service, credentialsByUserId, users, profiles } = buildAuthHarness();
    const payload = registerPayload();

    const session = await service.register(payload);

    expect(session.user.groups).toEqual([EUserGroup.APP_USER]);
    expect(session.accessToken).toBeTruthy();
    expect(session.refreshToken).toBeTruthy();
    assertNoSecretFields(session);
    expect(session.user).not.toHaveProperty('password');
    expect(session.user).not.toHaveProperty('passwordHash');
    OPERATOR_GROUPS.forEach((group) => {
      expect(session.user.groups).not.toContain(group);
    });
    expect(decodeAccess(session.accessToken).groups).toEqual([
      EUserGroup.APP_USER,
    ]);

    const stored = users.get(session.user.id);
    expect(stored?.groups).toEqual([EUserGroup.APP_USER]);
    const credential = credentialsByUserId.get(session.user.id);
    expect(credential).toBeDefined();
    expect(credential?.passwordHash).toBe(`hashed:${PASSWORD}`);
    expect(credential?.passwordHash).not.toBe(PASSWORD);
    expect(profiles.get(session.user.id)?.displayName).toBe(
      session.user.fullName,
    );
    expect(profiles.get(session.user.id)?.addresses).toEqual([]);
  });
});

describe('when registering with a duplicate email', () => {
  it('should reject with 400 FIELD_INVALID without identifier details or tokens', async () => {
    const { service, credentialsByUserId, sessionsById, passwordHasher } =
      buildAuthHarness();
    const first = registerPayload();
    await service.register(first);

    let thrown: unknown;
    try {
      await service.register(
        registerPayload({
          email: first.email,
        }),
      );
    } catch (error) {
      thrown = error;
    }

    expect(thrown).toEqual(
      expect.objectContaining({
        status: 400,
        errorCode: EErrorCode.FIELD_INVALID,
      }),
    );
    const serialized = JSON.stringify(thrown);
    expect(serialized).not.toContain(first.email);
    expect(serialized).not.toContain(first.cpf);
    expect((thrown as { details?: unknown }).details).toBeUndefined();
    expect(passwordHasher.hash).toHaveBeenCalled();
    expect(credentialsByUserId.size).toBe(1);
    expect(sessionsById.size).toBe(1);
  });
});

describe('when registering with a duplicate CPF', () => {
  it('should reject with 400 FIELD_INVALID without identifier details or tokens', async () => {
    const { service, credentialsByUserId, sessionsById, passwordHasher } =
      buildAuthHarness();
    const first = registerPayload();
    await service.register(first);

    let thrown: unknown;
    try {
      await service.register(
        registerPayload({
          cpf: first.cpf,
        }),
      );
    } catch (error) {
      thrown = error;
    }

    expect(thrown).toEqual(
      expect.objectContaining({
        status: 400,
        errorCode: EErrorCode.FIELD_INVALID,
      }),
    );
    const serialized = JSON.stringify(thrown);
    expect(serialized).not.toContain(first.email);
    expect(serialized).not.toContain(first.cpf);
    expect((thrown as { details?: unknown }).details).toBeUndefined();
    expect(passwordHasher.hash).toHaveBeenCalled();
    expect(credentialsByUserId.size).toBe(1);
    expect(sessionsById.size).toBe(1);
  });
});

describe('when registering one day before turning 18', () => {
  it('should reject with 400 USER_UNDERAGE and leave no credential or tokens', async () => {
    const { service, credentialsByUserId, sessionsById, users } =
      buildAuthHarness();

    await expect(
      service.register(
        registerPayload({
          birthDate: birthDateYearsAgo(18, 1),
        }),
      ),
    ).rejects.toMatchObject({
      status: 400,
      errorCode: EErrorCode.USER_UNDERAGE,
    });

    expect(users.size).toBe(0);
    expect(credentialsByUserId.size).toBe(0);
    expect(sessionsById.size).toBe(0);
  });
});

describe('when registering on the 18th birthday', () => {
  it('should accept the adult and issue tokens', async () => {
    const { service } = buildAuthHarness();

    const session = await service.register(
      registerPayload({
        birthDate: birthDateYearsAgo(18, 0),
      }),
    );

    expect(session.accessToken).toBeTruthy();
    expect(session.refreshToken).toBeTruthy();
  });
});

describe('when logging in with a correct email and password', () => {
  it('should return tokens and a public User without a password hash', async () => {
    const { service } = buildAuthHarness();
    const payload = registerPayload();
    await service.register(payload);

    const session = await service.login({
      email: payload.email,
      password: PASSWORD,
    });

    expect(session.user.email).toBe(payload.email.toLowerCase());
    expect(session.accessToken).toBeTruthy();
    expect(session.refreshToken).toBeTruthy();
    assertNoSecretFields(session);
  });
});

describe('when logging in with an unknown email', () => {
  it('should reject with 401 AUTH_INVALID_CREDENTIALS after dummy verify', async () => {
    const { service, passwordHasher, sessionsById } = buildAuthHarness();

    await expect(
      service.login({
        email: 'unknown@example.com',
        password: PASSWORD,
      }),
    ).rejects.toMatchObject({
      status: 401,
      errorCode: EErrorCode.AUTH_INVALID_CREDENTIALS,
    });

    expect(passwordHasher.verify).toHaveBeenCalled();
    expect(sessionsById.size).toBe(0);
  });
});

describe('when logging in with a known email and wrong password', () => {
  it('should reject with the same 401 AUTH_INVALID_CREDENTIALS', async () => {
    const { service } = buildAuthHarness();
    const payload = registerPayload();
    await service.register(payload);

    await expect(
      service.login({
        email: payload.email,
        password: 'wrong-password',
      }),
    ).rejects.toMatchObject({
      status: 401,
      errorCode: EErrorCode.AUTH_INVALID_CREDENTIALS,
    });
  });
});

describe('when logging in as a user with no credential', () => {
  it('should reject with the same 401 AUTH_INVALID_CREDENTIALS', async () => {
    const { service, users, passwordHasher } = buildAuthHarness();
    const user = validUserMock();
    users.set(user.id, user);

    await expect(
      service.login({
        email: user.email,
        password: PASSWORD,
      }),
    ).rejects.toMatchObject({
      status: 401,
      errorCode: EErrorCode.AUTH_INVALID_CREDENTIALS,
    });
    expect(passwordHasher.verify).toHaveBeenCalled();
  });
});

describe('when comparing login failure shapes', () => {
  it('should make unknown email, wrong password and missing credential indistinguishable', async () => {
    const { service, users } = buildAuthHarness();
    const payload = registerPayload();
    await service.register(payload);
    const provisioned = validUserMock();
    users.set(provisioned.id, provisioned);

    const failures = await Promise.allSettled([
      service.login({ email: 'missing@example.com', password: PASSWORD }),
      service.login({ email: payload.email, password: 'nope' }),
      service.login({ email: provisioned.email, password: PASSWORD }),
    ]);

    const shapes = failures.map((result) => {
      expect(result.status).toBe('rejected');
      const error = (result as PromiseRejectedResult).reason as {
        status: number;
        errorCode: string;
        message: string;
      };
      expect(error.message).not.toMatch(/not found|wrong password|no credential/i);
      return { status: error.status, errorCode: error.errorCode };
    });

    expect(shapes[0]).toEqual(shapes[1]);
    expect(shapes[1]).toEqual(shapes[2]);
    expect(shapes[0]).toEqual({
      status: 401,
      errorCode: EErrorCode.AUTH_INVALID_CREDENTIALS,
    });
  });
});

describe('when a BLOCKED user logs in with the correct password', () => {
  it('should reject with 401 AUTH_INVALID_CREDENTIALS and issue no tokens', async () => {
    const { service, users, sessionsById } = buildAuthHarness();
    const payload = registerPayload();
    const registered = await service.register(payload);
    const before = sessionsById.size;
    const stored = users.get(registered.user.id)!;
    users.set(stored.id, { ...stored, status: EUserStatus.BLOCKED });

    await expect(
      service.login({
        email: payload.email,
        password: PASSWORD,
      }),
    ).rejects.toMatchObject({
      status: 401,
      errorCode: EErrorCode.AUTH_INVALID_CREDENTIALS,
    });
    expect(sessionsById.size).toBe(before);
  });
});

describe('when a PENDING_VERIFICATION user logs in', () => {
  it('should issue tokens because only BLOCKED is forbidden', async () => {
    const { service } = buildAuthHarness();
    const payload = registerPayload();
    const registered = await service.register(payload);
    expect(registered.user.status).toBe(EUserStatus.PENDING_VERIFICATION);

    const session = await service.login({
      email: payload.email,
      password: PASSWORD,
    });
    expect(session.accessToken).toBeTruthy();
    expect(session.refreshToken).toBeTruthy();
  });
});

describe('when a PENDING_VERIFICATION user refreshes a valid token', () => {
  it('should issue a new token pair', async () => {
    const { service } = buildAuthHarness();
    const registered = await service.register(registerPayload());

    const refreshed = await service.refresh({
      refreshToken: registered.refreshToken,
    });
    expect(refreshed.accessToken).toBeTruthy();
    expect(refreshed.refreshToken).not.toBe(registered.refreshToken);
  });
});

describe('when refreshing a valid refresh token', () => {
  it('should rotate R1 to R2 without setting accessInvalidatedAt', async () => {
    const { service, sessionsById } = buildAuthHarness();
    const registered = await service.register(registerPayload());
    const r1 = registered.refreshToken;
    const originalSid = decodeAccess(registered.accessToken).sid;

    const rotated = await service.refresh({ refreshToken: r1 });
    const r2 = rotated.refreshToken;

    expect(r2).toBeTruthy();
    expect(r2).not.toBe(r1);
    expect(rotated.accessToken).not.toBe(registered.accessToken);

    const originalSession = sessionsById.get(originalSid);
    expect(originalSession?.revokedAt).toBeInstanceOf(Date);
    expect(originalSession?.accessInvalidatedAt).toBeUndefined();

    const later = await service.refresh({ refreshToken: r2 });
    expect(later.refreshToken).toBeTruthy();
    expect(later.refreshToken).not.toBe(r2);
  });
});

describe('when a revoked refresh token is reused', () => {
  it('should fail with 401 AUTH_INVALID_CREDENTIALS and revoke the family so R2 also fails', async () => {
    const { service, sessionsById } = buildAuthHarness();
    const registered = await service.register(registerPayload());
    const r1 = registered.refreshToken;
    const rotated = await service.refresh({ refreshToken: r1 });
    const r2 = rotated.refreshToken;
    const before = sessionsById.size;

    await expect(service.refresh({ refreshToken: r1 })).rejects.toMatchObject({
      status: 401,
      errorCode: EErrorCode.AUTH_INVALID_CREDENTIALS,
    });
    expect(sessionsById.size).toBe(before);

    await expect(service.refresh({ refreshToken: r2 })).rejects.toMatchObject({
      status: 401,
      errorCode: EErrorCode.AUTH_INVALID_CREDENTIALS,
    });
  });
});

describe('when a BLOCKED user refreshes', () => {
  it('should reject with the same 401 AUTH_INVALID_CREDENTIALS and issue no tokens', async () => {
    const { service, users, sessionsById } = buildAuthHarness();
    const registered = await service.register(registerPayload());
    const stored = users.get(registered.user.id)!;
    users.set(stored.id, { ...stored, status: EUserStatus.BLOCKED });
    const before = sessionsById.size;

    await expect(
      service.refresh({ refreshToken: registered.refreshToken }),
    ).rejects.toMatchObject({
      status: 401,
      errorCode: EErrorCode.AUTH_INVALID_CREDENTIALS,
    });
    expect(sessionsById.size).toBe(before);
  });
});

describe('when logging out a session', () => {
  it('should revoke refresh, set accessInvalidatedAt, and treat a repeated logout as success', async () => {
    const { service, sessionsById } = buildAuthHarness();
    const registered = await service.register(registerPayload());
    const actor = actorFromAccess(registered.accessToken);
    const sid = actor.sessionId!;

    await expect(service.logout(actor)).resolves.toBeUndefined();
    expect(sessionsById.get(sid)?.revokedAt).toBeInstanceOf(Date);
    expect(sessionsById.get(sid)?.accessInvalidatedAt).toBeInstanceOf(Date);

    await expect(service.logout(actor)).resolves.toBeUndefined();

    await expect(
      service.refresh({ refreshToken: registered.refreshToken }),
    ).rejects.toMatchObject({
      status: 401,
      errorCode: EErrorCode.AUTH_INVALID_CREDENTIALS,
    });
  });
});

describe('when an ADMIN assigns BACKOFFICE to another user', () => {
  it('should persist BACKOFFICE on the target', async () => {
    const { service } = buildAuthHarness();
    const admin = await service.register(registerPayload());
    const camila = await service.register(registerPayload());

    const updated = await service.assignGroups(
      adminActor(admin.user.id),
      camila.user.id,
      [EUserGroup.BACKOFFICE],
    );

    expect(updated.groups).toEqual([EUserGroup.BACKOFFICE]);
  });
});

describe('when an ADMIN assigns ADMIN or BACKOFFICE to self', () => {
  it('should reject with 403 FIELD_INVALID and leave groups unchanged', async () => {
    const { service, users } = buildAuthHarness();
    const admin = await service.register(registerPayload());
    users.set(admin.user.id, {
      ...users.get(admin.user.id)!,
      groups: [EUserGroup.ADMIN],
    });
    const before = users.get(admin.user.id)!.groups;

    await expect(
      service.assignGroups(adminActor(admin.user.id), admin.user.id, [
        EUserGroup.ADMIN,
      ]),
    ).rejects.toMatchObject({
      status: 403,
      errorCode: EErrorCode.FIELD_INVALID,
    });
    await expect(
      service.assignGroups(adminActor(admin.user.id), admin.user.id, [
        EUserGroup.BACKOFFICE,
      ]),
    ).rejects.toMatchObject({
      status: 403,
      errorCode: EErrorCode.FIELD_INVALID,
    });
    expect(users.get(admin.user.id)!.groups).toEqual(before);
  });
});

describe('when assigning SYSTEM via AuthService', () => {
  it('should reject with 400 FIELD_INVALID and never persist SYSTEM', async () => {
    const { service, users } = buildAuthHarness();
    const admin = await service.register(registerPayload());
    const target = await service.register(registerPayload());

    await expect(
      service.assignGroups(adminActor(admin.user.id), target.user.id, [
        'SYSTEM',
      ]),
    ).rejects.toMatchObject({
      status: 400,
      errorCode: EErrorCode.FIELD_INVALID,
    });
    expect(users.get(target.user.id)!.groups).not.toContain('SYSTEM');
  });
});

describe('when minting an access JWT for a user whose stored groups include SYSTEM', () => {
  it('should omit SYSTEM from claims while systemActorContext still has SYSTEM', async () => {
    const { service, users } = buildAuthHarness();
    const payload = registerPayload();
    const registered = await service.register(payload);
    users.set(registered.user.id, {
      ...users.get(registered.user.id)!,
      groups: [EUserGroup.APP_USER, 'SYSTEM'],
    });

    const session = await service.login({
      email: payload.email,
      password: PASSWORD,
    });
    const claims = decodeAccess(session.accessToken);
    expect(claims.groups).not.toContain('SYSTEM');
    expect(session.user.groups).not.toContain('SYSTEM');
    expect(systemActorContext().groups).toContain('SYSTEM');
  });
});

describe('when register succeeds', () => {
  it('should publish identity.user.registered with { userId } only', async () => {
    const { service, publisher } = buildAuthHarness();
    const payload = registerPayload();
    const session = await service.register(payload);

    expect(publisher.publish).toHaveBeenCalledTimes(1);
    const envelope = (publisher.publish as jest.Mock).mock.calls[0][0];
    expect(envelope).toMatchObject({
      eventType: 'identity.user.registered',
      payload: { userId: session.user.id },
    });
    expect(Object.keys(envelope.payload)).toEqual(['userId']);
    const serialized = JSON.stringify(envelope.payload);
    expect(serialized).not.toContain(payload.email);
    expect(serialized).not.toContain(payload.cpf);
    expect(serialized).not.toContain(PASSWORD);
    expect(serialized).not.toContain(session.accessToken);
    expect(serialized).not.toContain(session.refreshToken);
  });
});

describe('when login refresh or logout succeed', () => {
  it('should emit no additional events', async () => {
    const { service, publisher } = buildAuthHarness();
    const payload = registerPayload();
    const registered = await service.register(payload);
    expect(publisher.publish).toHaveBeenCalledTimes(1);

    await service.login({ email: payload.email, password: PASSWORD });
    const refreshed = await service.refresh({
      refreshToken: registered.refreshToken,
    });
    await service.logout(actorFromAccess(refreshed.accessToken));

    expect(publisher.publish).toHaveBeenCalledTimes(1);
  });
});

describe('when auth outcomes are logged', () => {
  it('should omit password, hash, full token, Authorization and CPF', async () => {
    const infoSpy = jest.spyOn(Logger, 'info').mockImplementation(() => Logger);
    const { service } = buildAuthHarness();
    const payload = registerPayload();
    const registered = await service.register(payload);
    await service
      .login({ email: 'nobody@example.com', password: PASSWORD })
      .catch(() => undefined);
    await service.refresh({ refreshToken: registered.refreshToken });
    await service
      .refresh({ refreshToken: registered.refreshToken })
      .catch(() => undefined);

    const logged = infoSpy.mock.calls.map((args) => JSON.stringify(args)).join('\n');
    expect(logged).toContain('auth.register.success');
    expect(logged).toContain('auth.login.failure');
    expect(logged).toContain('auth.refresh.reuse');
    expect(logged).not.toContain(PASSWORD);
    expect(logged).not.toContain(`hashed:${PASSWORD}`);
    expect(logged).not.toContain(registered.accessToken);
    expect(logged).not.toContain(registered.refreshToken);
    expect(logged).not.toContain(payload.cpf);
    expect(logged).not.toMatch(/authorization/i);
    infoSpy.mockRestore();
  });
});

describe('when logging out without a session id', () => {
  it('should succeed without revoking other sessions', async () => {
    const { service } = buildAuthHarness();
    const registered = await service.register(registerPayload());

    await expect(
      service.logout(ownerActor(registered.user.id)),
    ).resolves.toBeUndefined();

    const refreshed = await service.refresh({
      refreshToken: registered.refreshToken,
    });
    expect(refreshed.refreshToken).toBeTruthy();
  });
});
