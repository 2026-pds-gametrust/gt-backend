import { NextFunction, Request, Response } from 'express';
import { IActorContext } from '../../domain/common/types/actor-context';

declare global {
  namespace Express {
    interface Request {
      actor: IActorContext;
    }
  }
}

function parseGroupsHeader(raw: string | undefined): string[] {
  if (!raw?.trim()) {
    return [];
  }
  return raw
    .split(',')
    .map((group) => group.trim())
    .filter((group) => group.length > 0);
}

/**
 * Builds `req.actor` from gateway headers.
 * Groups format matches `authorizeByGroup` (comma-separated).
 */
export function attachActorContext(
  req: Request,
  _res: Response,
  next: NextFunction,
): void {
  const actorId = (req.header('x-user-id') ?? '').trim();
  const groups = parseGroupsHeader(req.header('x-user-groups'));
  const correlationId =
    req.header('x-correlation-id')?.trim() || undefined;

  req.actor = {
    actorId,
    groups,
    ...(correlationId ? { correlationId } : {}),
  };

  next();
}
