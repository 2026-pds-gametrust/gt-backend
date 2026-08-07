import { ListingServiceEntity } from '../../../../domain/listings/entity/listing.entity';
import { EShippingMode } from '../../../../domain/listings/entity/enums/EShippingMode';
import { EWarrantyType } from '../../../../domain/listings/entity/enums/EWarrantyType';
import { validListingMock } from '../../../__mocks__/listing.mock';

describe('when constructing a listing entity', () => {
  it('should accept a valid listing and normalize media cover', () => {
    const entity = new ListingServiceEntity(validListingMock());
    expect(entity.quantity).toBe(1);
    expect(entity.media.coverPhotoUrl).toBe(entity.media.photoUrls[0]);
  });

  it('should accept listPriceCents equal to priceCents', () => {
    const listing = validListingMock({
      priceCents: 1000,
      listPriceCents: 1000,
    });
    expect(new ListingServiceEntity(listing).listPriceCents).toBe(1000);
  });

  it('should accept warranty NONE without validating months', () => {
    const entity = new ListingServiceEntity(
      validListingMock({
        warranty: { type: EWarrantyType.NONE, months: 0 },
      }),
    );
    expect(entity.warranty?.type).toBe(EWarrantyType.NONE);
  });

  it('should reject missing id', () => {
    expect(
      () => new ListingServiceEntity(validListingMock({ id: '  ' })),
    ).toThrow('id is required');
  });

  it('should reject missing sellerId', () => {
    expect(
      () => new ListingServiceEntity(validListingMock({ sellerId: '' })),
    ).toThrow('sellerId is required');
  });

  it('should reject missing productId', () => {
    expect(
      () => new ListingServiceEntity(validListingMock({ productId: '' })),
    ).toThrow('productId is required');
  });

  it('should reject missing title', () => {
    expect(
      () => new ListingServiceEntity(validListingMock({ title: '   ' })),
    ).toThrow('title is required');
  });

  it('should reject quantity different from 1', () => {
    expect(
      () => new ListingServiceEntity(validListingMock({ quantity: 2 })),
    ).toThrow('quantity must be 1');
  });

  it('should reject negative priceCents', () => {
    expect(
      () => new ListingServiceEntity(validListingMock({ priceCents: -1 })),
    ).toThrow('amountCents must be a non-negative integer');
  });

  it('should reject non-integer priceCents', () => {
    expect(
      () => new ListingServiceEntity(validListingMock({ priceCents: 10.5 })),
    ).toThrow('amountCents must be a non-negative integer');
  });

  it('should reject invalid currency length', () => {
    expect(
      () =>
        new ListingServiceEntity(
          validListingMock({ currency: 'BR' as any }),
        ),
    ).toThrow('currency must be a 3-letter ISO code');
  });

  it('should reject listPriceCents below priceCents', () => {
    expect(
      () =>
        new ListingServiceEntity(
          validListingMock({ priceCents: 1000, listPriceCents: 999 }),
        ),
    ).toThrow('listPriceCents must be an integer >= priceCents');
  });

  it('should reject non-integer listPriceCents', () => {
    expect(
      () =>
        new ListingServiceEntity(
          validListingMock({ priceCents: 1000, listPriceCents: 1000.5 }),
        ),
    ).toThrow('listPriceCents must be an integer >= priceCents');
  });

  it('should reject missing media', () => {
    expect(
      () =>
        new ListingServiceEntity(
          validListingMock({ media: undefined as any }),
        ),
    ).toThrow('media is required');
  });

  it('should reject empty shipping modes', () => {
    expect(
      () =>
        new ListingServiceEntity(
          validListingMock({ shipping: { modes: [] } }),
        ),
    ).toThrow('shipping.modes is required and must be non-empty');
  });

  it('should reject missing shipping modes', () => {
    expect(
      () =>
        new ListingServiceEntity(
          validListingMock({ shipping: undefined as any }),
        ),
    ).toThrow('shipping.modes is required and must be non-empty');
  });

  it('should reject invalid warranty months', () => {
    expect(
      () =>
        new ListingServiceEntity(
          validListingMock({
            warranty: { type: EWarrantyType.SELLER, months: 0 },
          }),
        ),
    ).toThrow('warranty.months must be an integer >= 1');
  });

  it('should reject non-integer warranty months', () => {
    expect(
      () =>
        new ListingServiceEntity(
          validListingMock({
            warranty: { type: EWarrantyType.SELLER, months: 1.5 },
          }),
        ),
    ).toThrow('warranty.months must be an integer >= 1');
  });

  it('should accept SHIPPING mode without failing entity validation', () => {
    const entity = new ListingServiceEntity(
      validListingMock({
        shipping: { modes: [EShippingMode.SHIPPING] },
      }),
    );
    expect(entity.shipping.modes).toContain(EShippingMode.SHIPPING);
  });
});
