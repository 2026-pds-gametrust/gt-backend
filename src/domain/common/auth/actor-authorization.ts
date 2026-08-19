import { EUserGroup, IThrowedError } from '@sauvvitech/st-packages';
import { EErrorCode } from '../errors/enums/EErrorCode';
import { IActorContext } from '../types/actor-context';

const SYSTEM_ACTOR_ID = 'system';
const SYSTEM_GROUP = 'SYSTEM';

export function isBackofficeOrAdmin(actor: IActorContext): boolean {
  return actor.groups.some(
    (group) =>
      group === EUserGroup.BACKOFFICE || group === EUserGroup.ADMIN,
  );
}

export function isAdmin(actor: IActorContext): boolean {
  return actor.groups.some((group) => group === EUserGroup.ADMIN);
}

export function isSystemActor(actor: IActorContext): boolean {
  return (
    actor.actorId === SYSTEM_ACTOR_ID ||
    actor.groups.some((group) => group === SYSTEM_GROUP)
  );
}

export function assertActorPresent(actor: IActorContext): void {
  if (!actor?.actorId?.trim()) {
    throw {
      status: 403,
      errorCode: EErrorCode.FIELD_INVALID,
      message: 'Actor context is required',
    } as IThrowedError;
  }
}

export function assertOwnerOrAdmin(
  actor: IActorContext,
  ownerId: string,
): void {
  assertActorPresent(actor);
  if (isBackofficeOrAdmin(actor)) {
    return;
  }
  if (actor.actorId === ownerId) {
    return;
  }
  throw {
    status: 403,
    errorCode: EErrorCode.FIELD_INVALID,
    message: 'Forbidden: actor is not the resource owner',
    details: { actorId: actor.actorId, ownerId },
  } as IThrowedError;
}

export function assertOwnerOrAdminOnly(
  actor: IActorContext,
  ownerId: string,
): void {
  assertActorPresent(actor);
  if (isAdmin(actor)) {
    return;
  }
  if (actor.actorId === ownerId) {
    return;
  }
  throw {
    status: 403,
    errorCode: EErrorCode.FIELD_INVALID,
    message: 'Forbidden: actor is not the resource owner or admin',
    details: { actorId: actor.actorId, ownerId },
  } as IThrowedError;
}

export function assertBackofficeAdminOrSystem(
  actor: IActorContext,
): void {
  assertActorPresent(actor);
  if (isBackofficeOrAdmin(actor) || isSystemActor(actor)) {
    return;
  }
  throw {
    status: 403,
    errorCode: EErrorCode.FIELD_INVALID,
    message: 'Forbidden: publish requires backoffice/admin or system actor',
    details: { actorId: actor.actorId },
  } as IThrowedError;
}

export function systemActorContext(): IActorContext {
  return {
    actorId: SYSTEM_ACTOR_ID,
    groups: [SYSTEM_GROUP],
  };
}
