export interface IIssuedPossessionProofCode {
  code: string;
  hash: string;
}

export interface IPossessionProofCodeIssuer {
  issueForCase(caseId: string): IIssuedPossessionProofCode;
}
