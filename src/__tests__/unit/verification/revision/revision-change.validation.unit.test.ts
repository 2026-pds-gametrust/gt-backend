import { ERequiredChangeTarget } from '../../../../domain/verification/entity/enums/ERequiredChangeTarget';
import { EVerificationCaseStatus } from '../../../../domain/verification/entity/enums/EVerificationCaseStatus';
import { validListingMock } from '../../../__mocks__/listing.mock';
import {
  assertRequiredChangesApplied,
  buildRevisionBaseline,
  normalizeRequiredChanges,
} from '../../../../domain/verification/revision/revision-change.validation';

describe('revision-change validation', () => {
  it('should build baseline from listing media and description', () => {
    const listing = validListingMock({
      description: 'Hello',
      media: {
        photoUrls: ['https://cdn.example.com/p.jpg'],
        videoUrl: 'https://cdn.example.com/v.mp4',
        assetIds: ['p1', 'p2'],
        videoAssetId: 'v1',
      },
    });

    expect(buildRevisionBaseline(listing)).toEqual({
      assetIds: ['p1', 'p2'],
      videoAssetId: 'v1',
      description: 'Hello',
    });
  });

  it('should block resubmit when flagged photo remains', () => {
    const listing = validListingMock({
      media: {
        photoUrls: ['https://cdn.example.com/p.jpg'],
        videoUrl: 'https://cdn.example.com/v.mp4',
        assetIds: ['p1'],
        videoAssetId: 'v1',
      },
    });

    expect(() =>
      assertRequiredChangesApplied(listing, {
        id: 'case-1',
        listingId: listing.id,
        status: EVerificationCaseStatus.CHANGES_REQUESTED,
        createdAt: new Date(),
        requiredChanges: [
          {
            target: ERequiredChangeTarget.PHOTO,
            reason: 'Blurry',
            assetId: 'p1',
          },
        ],
        revisionBaseline: buildRevisionBaseline(listing),
      }),
    ).toThrow(expect.objectContaining({ status: 400 }));
  });

  it('should accept resubmit when description changed', () => {
    const baselineListing = validListingMock({
      description: 'Old text',
    });
    const updatedListing = validListingMock({
      id: baselineListing.id,
      description: 'New text',
    });

    expect(() =>
      assertRequiredChangesApplied(updatedListing, {
        id: 'case-1',
        listingId: baselineListing.id,
        status: EVerificationCaseStatus.CHANGES_REQUESTED,
        createdAt: new Date(),
        requiredChanges: [
          {
            target: ERequiredChangeTarget.DESCRIPTION,
            reason: 'Improve',
          },
        ],
        revisionBaseline: buildRevisionBaseline(baselineListing),
      }),
    ).not.toThrow();
  });

  it('should reject photo change without assetId belonging to listing', () => {
    const listing = validListingMock({
      media: {
        photoUrls: ['https://cdn.example.com/p.jpg'],
        videoUrl: 'https://cdn.example.com/v.mp4',
        assetIds: ['p1'],
        videoAssetId: 'v1',
      },
    });

    expect(() =>
      normalizeRequiredChanges(
        [
          {
            target: ERequiredChangeTarget.PHOTO,
            reason: 'Blurry',
            assetId: 'other',
          },
        ],
        listing,
      ),
    ).toThrow(expect.objectContaining({ status: 400 }));
  });
});
