import { IMediaOwnershipLookup } from '../../domain/media/ownership/media-ownership-lookup.interface';
import { IListingRepositoryRead } from '../../domain/listings/repository/listing.repository.read';
import { IVerificationCaseRepositoryRead } from '../../domain/verification/repository/verification-case.repository.read';

export class EvidenceOwnershipLookup implements IMediaOwnershipLookup {
  constructor(
    private readonly verificationCaseRepositoryRead: IVerificationCaseRepositoryRead,
    private readonly listingRepositoryRead: IListingRepositoryRead,
  ) {}

  async findEvidenceSellerId(caseId: string): Promise<string | null> {
    const verificationCase =
      await this.verificationCaseRepositoryRead.findVerificationCaseById(
        caseId,
      );
    if (!verificationCase) {
      return null;
    }
    const listing = await this.listingRepositoryRead.findListingById(
      verificationCase.listingId,
    );
    return listing?.sellerId ?? null;
  }
}
