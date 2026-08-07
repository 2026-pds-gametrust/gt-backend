import { EUserGroup } from '@sauvvitech/st-packages';
import { EErrorCode } from '../../../domain/common/errors/enums/EErrorCode';
import {
  assertActorPresent,
  assertBackofficeAdminOrSystem,
  assertOwnerOrAdmin,
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
