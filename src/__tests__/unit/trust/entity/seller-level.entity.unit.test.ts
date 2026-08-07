import { SellerLevelServiceEntity } from '../../../../domain/trust/entity/seller-level.entity';
import { ESellerLevel } from '../../../../domain/trust/entity/enums/ESellerLevel';
import { validSellerLevelMock } from '../../../__mocks__/trust.mock';

describe('when constructing a seller level entity', () => {
  it('should accept a valid seller level and trim sellerId', () => {
    const entity = new SellerLevelServiceEntity(
      validSellerLevelMock({
        sellerId: '  seller-1  ',
        level: ESellerLevel.EVOLVING,
      }),
    );
    expect(entity.sellerId).toBe('seller-1');
    expect(entity.level).toBe(ESellerLevel.EVOLVING);
  });

  it('should reject missing id', () => {
    expect(
      () => new SellerLevelServiceEntity(validSellerLevelMock({ id: ' ' })),
    ).toThrow('id is required');
  });

  it('should reject missing sellerId', () => {
    expect(
      () =>
        new SellerLevelServiceEntity(
          validSellerLevelMock({ sellerId: '' }),
        ),
    ).toThrow('sellerId is required');
  });

  it('should reject missing level', () => {
    expect(
      () =>
        new SellerLevelServiceEntity(
          validSellerLevelMock({ level: undefined as any }),
        ),
    ).toThrow('level is required');
  });
});
