import { EEvidenceType } from '../entity/enums/EEvidenceType';
import { IEvidenceItem } from '../entity/interfaces/evidence-item.interface';

/** Minimal listing shape needed for VIDEO evidence gate (proof-code MVP BR-06). */
export interface IProofEvidenceListingMedia {
  media?: {
    videoAssetId?: string;
    videoUrl?: string;
  };
}

/**
 * PHOTO required; VIDEO required when the listing declares video.
 * Pure helper shared by assign gate and proof-code AI triggers.
 */
export function isMinProofEvidenceEligible(
  evidence: IEvidenceItem[],
  listing: IProofEvidenceListingMedia,
): boolean {
  const hasPhoto = evidence.some((item) => item.type === EEvidenceType.PHOTO);
  if (!hasPhoto) {
    return false;
  }

  const listingHasVideo = Boolean(
    listing.media?.videoAssetId || listing.media?.videoUrl,
  );
  if (!listingHasVideo) {
    return true;
  }

  return evidence.some((item) => item.type === EEvidenceType.VIDEO);
}
