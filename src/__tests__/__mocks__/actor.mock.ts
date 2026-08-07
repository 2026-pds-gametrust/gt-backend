import { EUserGroup } from '@sauvvitech/st-packages';
import { IActorContext } from '../../domain/common/types/actor-context';

export function sellerActor(actorId: string): IActorContext {
  return { actorId, groups: [] };
}

export function backofficeActor(
  actorId = 'backoffice-actor',
): IActorContext {
  return { actorId, groups: [EUserGroup.BACKOFFICE] };
}

export function systemActor(): IActorContext {
  return { actorId: 'system', groups: ['SYSTEM'] };
}
