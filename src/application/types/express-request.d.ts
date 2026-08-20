import type { IActorContext } from '../../domain/common/types/actor-context';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      actor: IActorContext;
    }
  }
}

export {};
