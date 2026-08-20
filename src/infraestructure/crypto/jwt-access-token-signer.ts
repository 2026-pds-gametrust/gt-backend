import jwt, { JwtPayload } from 'jsonwebtoken';
import {
  IAccessTokenClaims,
  ITokenSigner,
} from '../../domain/identity/ports/token-signer.interface';

const SYSTEM_GROUP = 'SYSTEM';

export class JwtAccessTokenSigner implements ITokenSigner {
  constructor(
    private readonly secret: string,
    private readonly ttlSeconds: number,
  ) {}

  signAccessToken(claims: IAccessTokenClaims): string {
    const groups = (claims.groups ?? []).filter(
      (group) => group !== SYSTEM_GROUP,
    );
    return jwt.sign(
      {
        sub: claims.sub,
        groups,
        sid: claims.sid,
        fid: claims.fid,
        typ: 'access',
      },
      this.secret,
      { algorithm: 'HS256', expiresIn: this.ttlSeconds },
    );
  }

  verifyAccessToken(token: string): IAccessTokenClaims {
    const payload = jwt.verify(token, this.secret, {
      algorithms: ['HS256'],
    });
    if (typeof payload === 'string') {
      throw new Error('Invalid access token');
    }
    return this.toClaims(payload);
  }

  private toClaims(payload: JwtPayload): IAccessTokenClaims {
    const groups = Array.isArray(payload.groups)
      ? payload.groups.filter(
          (group): group is string =>
            typeof group === 'string' && group !== SYSTEM_GROUP,
        )
      : [];
    if (
      typeof payload.sub !== 'string' ||
      typeof payload.sid !== 'string' ||
      typeof payload.fid !== 'string' ||
      payload.typ !== 'access'
    ) {
      throw new Error('Invalid access token');
    }
    return {
      sub: payload.sub,
      groups,
      sid: payload.sid,
      fid: payload.fid,
      typ: 'access',
    };
  }
}
