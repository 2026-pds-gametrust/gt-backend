export interface IAccessTokenClaims {
  sub: string;
  groups: string[];
  sid: string;
  fid: string;
  typ: 'access';
}

export interface ITokenSigner {
  signAccessToken(claims: IAccessTokenClaims): string;
  verifyAccessToken(token: string): IAccessTokenClaims;
}
