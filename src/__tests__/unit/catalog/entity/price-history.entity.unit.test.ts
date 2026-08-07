import { Types } from 'mongoose';
import { PriceHistoryServiceEntity } from '../../../../domain/catalog/entity/price-history.entity';
import { EPriceHistorySource } from '../../../../domain/catalog/entity/enums/EPriceHistorySource';
import { IPriceHistory } from '../../../../domain/catalog/entity/interfaces/price-history.interface';

const validPriceHistory = (
  override?: Partial<IPriceHistory>,
): IPriceHistory => ({
  id: new Types.ObjectId().toHexString(),
  productId: new Types.ObjectId().toHexString(),
  priceCents: 10000,
  currency: 'BRL',
  source: EPriceHistorySource.MANUAL,
  observedAt: new Date(),
  createdAt: new Date(),
  ...override,
});

describe('when constructing a price history entity', () => {
  it('should accept a valid entry and normalize currency', () => {
    const entity = new PriceHistoryServiceEntity(
      validPriceHistory({ currency: 'brl' }),
    );
    expect(entity.priceCents).toBe(10000);
    expect(entity.currency).toBe('BRL');
    expect(entity.source).toBe(EPriceHistorySource.MANUAL);
  });

  it('should reject missing id', () => {
    expect(
      () => new PriceHistoryServiceEntity(validPriceHistory({ id: ' ' })),
    ).toThrow('id is required');
  });

  it('should reject missing productId', () => {
    expect(
      () =>
        new PriceHistoryServiceEntity(validPriceHistory({ productId: '' })),
    ).toThrow('productId is required');
  });

  it('should reject missing source', () => {
    expect(
      () =>
        new PriceHistoryServiceEntity(
          validPriceHistory({ source: undefined as any }),
        ),
    ).toThrow('source is required');
  });

  it('should reject missing observedAt', () => {
    expect(
      () =>
        new PriceHistoryServiceEntity(
          validPriceHistory({ observedAt: undefined as any }),
        ),
    ).toThrow('observedAt is required');
  });

  it('should reject invalid money amount', () => {
    expect(
      () =>
        new PriceHistoryServiceEntity(validPriceHistory({ priceCents: -1 })),
    ).toThrow('amountCents must be a non-negative integer');
  });

  it('should reject invalid currency', () => {
    expect(
      () =>
        new PriceHistoryServiceEntity(
          validPriceHistory({ currency: 'B' as any }),
        ),
    ).toThrow('currency must be a 3-letter ISO code');
  });
});
