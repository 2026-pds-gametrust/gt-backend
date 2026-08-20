import { isMinProofEvidenceEligible } from '../../../../domain/verification/proof/proof-evidence-eligibility';
import { EEvidenceType } from '../../../../domain/verification/entity/enums/EEvidenceType';
import { IEvidenceItem } from '../../../../domain/verification/entity/interfaces/evidence-item.interface';

function photo(caseId = 'c1'): IEvidenceItem {
  return {
    id: 'e1',
    caseId,
    type: EEvidenceType.PHOTO,
    storageKey: 'k',
    createdAt: new Date(),
  };
}

describe('when checking min proof evidence eligibility', () => {
  it('should require PHOTO', () => {
    expect(isMinProofEvidenceEligible([], {})).toBe(false);
  });

  it('should accept PHOTO-only when listing has no video', () => {
    expect(isMinProofEvidenceEligible([photo()], {})).toBe(true);
  });

  it('should require VIDEO when listing declares video', () => {
    expect(
      isMinProofEvidenceEligible([photo()], {
        media: { videoAssetId: 'v1' },
      }),
    ).toBe(false);
    expect(
      isMinProofEvidenceEligible(
        [
          photo(),
          {
            id: 'e2',
            caseId: 'c1',
            type: EEvidenceType.VIDEO,
            storageKey: 'vk',
            createdAt: new Date(),
          },
        ],
        { media: { videoAssetId: 'v1' } },
      ),
    ).toBe(true);
  });
});
