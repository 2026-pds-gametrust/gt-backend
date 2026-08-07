import { TrustScoreServiceEntity } from '../../../../domain/trust/entity/trust-score.entity';
import { validTrustScoreMock } from '../../../__mocks__/trust.mock';

describe('when constructing a trust score entity', () => {
  it('should accept a valid trust score and trim sellerId', () => {
    const entity = new TrustScoreServiceEntity(
      validTrustScoreMock({
        sellerId: '  seller-1  ',
        score: 20,
        components: { USER_VERIFIED: 10 },
      }),
    );
    expect(entity.sellerId).toBe('seller-1');
    expect(entity.score).toBe(20);
    expect(entity.components).toEqual({ USER_VERIFIED: 10 });
  });

  it('should reject missing id', () => {
    expect(
      () => new TrustScoreServiceEntity(validTrustScoreMock({ id: ' ' })),
    ).toThrow('id is required');
  });

  it('should reject missing sellerId', () => {
    expect(
      () =>
        new TrustScoreServiceEntity(validTrustScoreMock({ sellerId: '' })),
    ).toThrow('sellerId is required');
  });

  it('should reject non-number score', () => {
    expect(
      () =>
        new TrustScoreServiceEntity(
          validTrustScoreMock({ score: '10' as any }),
        ),
    ).toThrow('score must be a number');
  });

  it('should reject NaN score', () => {
    expect(
      () =>
        new TrustScoreServiceEntity(validTrustScoreMock({ score: NaN })),
    ).toThrow('score must be a number');
  });

  it('should reject missing components', () => {
    expect(
      () =>
        new TrustScoreServiceEntity(
          validTrustScoreMock({ components: undefined as any }),
        ),
    ).toThrow('components is required');
  });
});
