import { handleTranslatedError } from '@sauvvitech/st-packages';
import { NextFunction, Request, Response } from 'express';
import { EErrorCode } from '../../domain/common/errors/enums/EErrorCode';
import type { IActorContext } from '../../domain/common/types/actor-context';
import { ErrorCatalog } from '../../infraestructure/i18n/error-catalog';

type RequestWithActor = Request & { actor?: IActorContext };

export function requireAccessToken(
  req: RequestWithActor,
  res: Response,
  next: NextFunction,
): void {
  if (!req.actor?.actorId?.trim()) {
    handleTranslatedError(
      {
        status: 401,
        errorCode: EErrorCode.AUTH_UNAUTHORIZED,
        message: 'Access token required',
      },
      ErrorCatalog,
      res,
    );
    return;
  }
  next();
}
