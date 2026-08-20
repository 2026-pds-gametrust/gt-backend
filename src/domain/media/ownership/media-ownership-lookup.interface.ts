export interface IMediaOwnershipLookup {
  findEvidenceSellerId(caseId: string): Promise<string | null>;
}
