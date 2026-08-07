import { ESellerLevel } from '../../../../domain/trust/entity/enums/ESellerLevel';
import { deriveSellerLevelFromScore } from '../../../../domain/trust/service/seller-level.service';

describe('when deriving seller level from score', () => {
  it('should map negative scores to NEW', () => {
    expect(deriveSellerLevelFromScore(-20)).toBe(ESellerLevel.NEW);
    expect(deriveSellerLevelFromScore(-1)).toBe(ESellerLevel.NEW);
  });

  it('should map 0 and 9 to NEW', () => {
    expect(deriveSellerLevelFromScore(0)).toBe(ESellerLevel.NEW);
    expect(deriveSellerLevelFromScore(9)).toBe(ESellerLevel.NEW);
  });

  it('should map 10 and 49 to EVOLVING', () => {
    expect(deriveSellerLevelFromScore(10)).toBe(ESellerLevel.EVOLVING);
    expect(deriveSellerLevelFromScore(49)).toBe(ESellerLevel.EVOLVING);
  });

  it('should map 50 and 99 to TRUSTED', () => {
    expect(deriveSellerLevelFromScore(50)).toBe(ESellerLevel.TRUSTED);
    expect(deriveSellerLevelFromScore(99)).toBe(ESellerLevel.TRUSTED);
  });

  it('should map 100 and above to EXCELLENT', () => {
    expect(deriveSellerLevelFromScore(100)).toBe(ESellerLevel.EXCELLENT);
    expect(deriveSellerLevelFromScore(250)).toBe(ESellerLevel.EXCELLENT);
  });
});
