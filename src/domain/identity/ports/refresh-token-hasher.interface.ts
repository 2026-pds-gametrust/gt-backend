export interface IGeneratedRefreshToken {
  plaintext: string;
  tokenHash: string;
}

export interface IRefreshTokenHasher {
  generate(): IGeneratedRefreshToken;
  hash(plaintext: string): string;
}
