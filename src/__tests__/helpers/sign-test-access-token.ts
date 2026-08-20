import { randomUUID } from 'crypto';
import jwt from 'jsonwebtoken';
import {
  GT_JWT_ACCESS_SECRET,
  GT_JWT_ACCESS_TTL_SECONDS,
} from '../../configuration/env-constants/auth.env';

export function signTestAccessToken(params: {
  actorId: string;
  groups: string[];
}): string {
  return jwt.sign(
    {
      sub: params.actorId,
      groups: params.groups,
      sid: randomUUID(),
      fid: randomUUID(),
      typ: 'access',
    },
    GT_JWT_ACCESS_SECRET,
    { algorithm: 'HS256', expiresIn: GT_JWT_ACCESS_TTL_SECONDS },
  );
}

export function bearerAuthorization(
  actorId: string,
  groups: string[],
): string {
  return `Bearer ${signTestAccessToken({ actorId, groups })}`;
}
