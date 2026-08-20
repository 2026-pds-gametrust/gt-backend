import { NextFunction, Request, Response } from 'express';
import { Logger } from 'traceability';
import { IActorContext } from '../../domain/common/types/actor-context';
import { IAccessTokenRevocationChecker } from '../../domain/identity/ports/access-token-revocation-checker.interface';
import { ITokenSigner } from '../../domain/identity/ports/token-signer.interface';

declare global {
  // Express Request augmentation requires a namespace merge.
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      actor: IActorContext;
    }
  }
}

function emptyActor(correlationId?: string): IActorContext {
  return {
    actorId: '',
    groups: [],
    ...(correlationId ? { correlationId } : {}),
  };
}

function readBearerToken(req: Request): string | undefined {
  const header = req.header('authorization') ?? req.header('Authorization');
  if (!header?.startsWith('Bearer ')) {
    return undefined;
  }
  const token = header.slice('Bearer '.length).trim();
  return token.length > 0 ? token : undefined;
}

/**
 * Builds `req.actor` from a verified access token only.
 * Client `x-user-id` / `x-user-groups` are never trusted as identity.
 * On success, those headers are mirrored from the token for `authorizeByGroup`.
 * Logout-revoked `sid` is treated as unauthenticated (empty actor).
 */
export function attachActorFromAccessToken(
  tokenSigner: ITokenSigner,
  revocationChecker: IAccessTokenRevocationChecker,
) {
  return async (
    req: Request,
    _res: Response,
    next: NextFunction,
  ): Promise<void> => {
    delete req.headers['x-user-id'];
    delete req.headers['x-user-groups'];

    const correlationId =
      req.header('x-correlation-id')?.trim() || undefined;
    const token = readBearerToken(req);

    if (!token) {
      req.actor = emptyActor(correlationId);
      next();
      return;
    }

    try {
      const claims = tokenSigner.verifyAccessToken(token);
      let invalidated = false;
      try {
        invalidated = await revocationChecker.isAccessInvalidated(claims.sid);
      } catch {
        Logger.info(
          `auth.access.revocation_check.failure sid=${claims.sid}`,
        );
        req.actor = emptyActor(correlationId);
        next();
        return;
      }

      if (invalidated) {
        req.actor = emptyActor(correlationId);
        next();
        return;
      }

      const groups = claims.groups ?? [];
      req.actor = {
        actorId: claims.sub,
        groups,
        sessionId: claims.sid,
        ...(correlationId ? { correlationId } : {}),
      };
      req.headers['x-user-id'] = claims.sub;
      req.headers['x-user-groups'] = groups.join(',');
    } catch {
      req.actor = emptyActor(correlationId);
    }

    next();
  };
}
