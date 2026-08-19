import { EUserGroup } from '@sauvvitech/st-packages';
import { EErrorCode } from '../../../domain/common/errors/enums/EErrorCode';
import {
  assertActorPresent,
  assertBackofficeAdminOrSystem,
  assertOwnerOrAdmin,
  assertOwnerOrAdminOnly,
  isBackofficeOrAdmin,
  isSystemActor,
  systemActorContext,
} from '../../../domain/common/auth/actor-authorization';

describe('when checking actor authorization helpers', () => {
  it('should detect backoffice and admin groups', () => {
    expect(
      isBackofficeOrAdmin({ actorId: 'a', groups: [EUserGroup.BACKOFFICE] }),
    ).toBe(true);
    expect(
      isBackofficeOrAdmin({ actorId: 'a', groups: [EUserGroup.ADMIN] }),
    ).toBe(true);
    expect(isBackofficeOrAdmin({ actorId: 'a', groups: [] })).toBe(false);
  });

  it('should detect system actors by id or group', () => {
    expect(isSystemActor({ actorId: 'system', groups: [] })).toBe(true);
    expect(isSystemActor({ actorId: 'x', groups: ['SYSTEM'] })).toBe(true);
    expect(isSystemActor({ actorId: 'x', groups: [] })).toBe(false);
  });

  it('should require actor id', () => {
    try {
      assertActorPresent({ actorId: '  ', groups: [] });
      fail('expected throw');
    } catch (error) {
      expect(error).toMatchObject({
        status: 403,
        errorCode: EErrorCode.FIELD_INVALID,
      });
    }
  });

  it('should allow owner or backoffice on assertOwnerOrAdmin', () => {
    expect(() =>
      assertOwnerOrAdmin({ actorId: 'owner', groups: [] }, 'owner'),
    ).not.toThrow();
    expect(() =>
      assertOwnerOrAdmin(
        { actorId: 'mod', groups: [EUserGroup.BACKOFFICE] },
        'owner',
      ),
    ).not.toThrow();
    try {
      assertOwnerOrAdmin({ actorId: 'other', groups: [] }, 'owner');
      fail('expected throw');
    } catch (error) {
      expect(error).toMatchObject({
        status: 403,
        errorCode: EErrorCode.FIELD_INVALID,
      });
    }
  });

  it('should allow owner or admin only, not backoffice, on User PII', () => {
    expect(() =>
      assertOwnerOrAdminOnly({ actorId: 'owner', groups: [] }, 'owner'),
    ).not.toThrow();
    expect(() =>
      assertOwnerOrAdminOnly(
        { actorId: 'admin', groups: [EUserGroup.ADMIN] },
        'owner',
      ),
    ).not.toThrow();
    try {
      assertOwnerOrAdminOnly(
        { actorId: 'mod', groups: [EUserGroup.BACKOFFICE] },
        'owner',
      );
      fail('expected throw');
    } catch (error) {
      expect(error).toMatchObject({
        status: 403,
        errorCode: EErrorCode.FIELD_INVALID,
      });
    }
    try {
      assertOwnerOrAdminOnly({ actorId: 'other', groups: [] }, 'owner');
      fail('expected throw');
    } catch (error) {
      expect(error).toMatchObject({
        status: 403,
        errorCode: EErrorCode.FIELD_INVALID,
      });
    }
  });

  it('should allow backoffice admin or system on publish gate', () => {
    expect(() =>
      assertBackofficeAdminOrSystem(systemActorContext()),
    ).not.toThrow();
    expect(() =>
      assertBackofficeAdminOrSystem({
        actorId: 'mod',
        groups: [EUserGroup.ADMIN],
      }),
    ).not.toThrow();
    try {
      assertBackofficeAdminOrSystem({ actorId: 'user', groups: [] });
      fail('expected throw');
    } catch (error) {
      expect(error).toMatchObject({ status: 403 });
    }
  });
});

describe('when the actor is the User PII owner', () => {
  it('should not throw on assertOwnerOrAdminOnly', () => {
    expect(() =>
      assertOwnerOrAdminOnly({ actorId: 'owner', groups: [] }, 'owner'),
    ).not.toThrow();
  });
});

describe('when the actor has ADMIN and is not the owner', () => {
  it('should not throw on assertOwnerOrAdminOnly', () => {
    expect(() =>
      assertOwnerOrAdminOnly(
        { actorId: 'admin', groups: [EUserGroup.ADMIN] },
        'owner',
      ),
    ).not.toThrow();
  });
});

describe('when the actor has BACKOFFICE only and is not the owner', () => {
  it('should reject with 403 FIELD_INVALID', () => {
    try {
      assertOwnerOrAdminOnly(
        { actorId: 'mod', groups: [EUserGroup.BACKOFFICE] },
        'owner',
      );
      fail('expected throw');
    } catch (error) {
      expect(error).toMatchObject({
        status: 403,
        errorCode: EErrorCode.FIELD_INVALID,
      });
    }
  });
});

describe('when the actor is another APP_USER', () => {
  it('should reject with 403 FIELD_INVALID', () => {
    try {
      assertOwnerOrAdminOnly({ actorId: 'other', groups: [] }, 'owner');
      fail('expected throw');
    } catch (error) {
      expect(error).toMatchObject({
        status: 403,
        errorCode: EErrorCode.FIELD_INVALID,
      });
    }
  });
});

describe('when systemActorContext is used outside HTTP', () => {
  it('should still include SYSTEM', () => {
    expect(systemActorContext().groups).toContain('SYSTEM');
  });
});
