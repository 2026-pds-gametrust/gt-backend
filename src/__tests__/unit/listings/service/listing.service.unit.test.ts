import { Types } from 'mongoose';
import { EErrorCode } from '../../../../domain/common/errors/enums/EErrorCode';
import { IEventPublisher } from '../../../../domain/common/messaging/event-publisher.interface';
import { IProduct } from '../../../../domain/catalog/entity/interfaces/product.interface';
import { IUser } from '../../../../domain/identity/entity/interfaces/user.interface';
import { EListingStatus } from '../../../../domain/listings/entity/enums/EListingStatus';
import { EShippingMode } from '../../../../domain/listings/entity/enums/EShippingMode';
import { IListing } from '../../../../domain/listings/entity/interfaces/listing.interface';
import { ListingService } from '../../../../domain/listings/service/listing.service';
import {
  backofficeActor,
  sellerActor,
} from '../../../__mocks__/actor.mock';
import { validListingMock } from '../../../__mocks__/listing.mock';
import { validProductMock } from '../../../__mocks__/product.mock';
import { validUserMock } from '../../../__mocks__/user.mock';

function buildService(overrides: {
  listings?: Map<string, IListing>;
  users?: Map<string, IUser>;
  products?: Map<string, IProduct>;
  updateListingById?: (
    id: string,
    data: Partial<IListing>,
  ) => Promise<IListing | null>;
} = {}) {
  const listings = overrides.listings ?? new Map<string, IListing>();
  const users = overrides.users ?? new Map<string, IUser>();
  const products = overrides.products ?? new Map<string, IProduct>();
  const events: unknown[] = [];
  const priceHistory: unknown[] = [];
  const publisher: IEventPublisher = {
    publish: jest.fn().mockResolvedValue(undefined),
  };

  const service = new ListingService({
    listingRepositoryRead: {
      findListingById: async (id: string) => listings.get(id) ?? null,
      listListings: async () => [...listings.values()],
    },
    listingRepositoryWrite: {
      createListing: async (listing: IListing) => {
        listings.set(listing.id, listing);
        return listing;
      },
      updateListingById:
        overrides.updateListingById ??
        (async (id: string, data: Partial<IListing>) => {
          const existing = listings.get(id);
          if (!existing) return null;
          const updated = { ...existing, ...data };
          listings.set(id, updated);
          return updated;
        }),
    },
    listingEventRepositoryRead: {
      listByListingId: async () => events as never[],
      findListingEventById: async () => null,
    },
    listingEventRepositoryWrite: {
      appendListingEvent: async (event: unknown) => {
        events.push(event);
        return event as never;
      },
    },
    userRepositoryRead: {
      findUserById: async (id: string) => users.get(id) ?? null,
      findUserByEmail: async () => null,
      findUserByCpf: async () => null,
      listUsers: async () => [...users.values()],
    },
    productRepositoryRead: {
      findProductById: async (id: string) => products.get(id) ?? null,
      findProductBySlug: async () => null,
      findProductBySku: async () => null,
      listProducts: async () => [...products.values()],
    },
    priceHistoryRepositoryWrite: {
      appendPriceHistory: async (entry: unknown) => {
        priceHistory.push(entry);
        return entry as never;
      },
    },
    eventPublisher: publisher,
  } as never);

  return { service, listings, users, products, publisher, priceHistory, events };
}

describe('when creating a listing without currency or correlationId', () => {
  it('should default currency to BRL and publish created event', async () => {
    const user = validUserMock();
    const product = validProductMock();
    const { service, publisher } = buildService({
      users: new Map([[user.id, user]]),
      products: new Map([[product.id, product]]),
    });

    const created = await service.createListing(
      {
        ...validListingMock({
          sellerId: user.id,
          productId: product.id,
          currency: undefined as never,
        }),
      },
      { ...sellerActor(user.id), correlationId: undefined },
    );

    expect(created.currency).toBe('BRL');
    expect(publisher.publish).toHaveBeenCalledWith(
      expect.objectContaining({ eventType: 'listings.listing.created' }),
    );
  });
});

describe('when creating a listing with actor correlationId', () => {
  it('should reuse the correlation id on the created event', async () => {
    const user = validUserMock();
    const product = validProductMock();
    const { service, publisher } = buildService({
      users: new Map([[user.id, user]]),
      products: new Map([[product.id, product]]),
    });

    await service.createListing(
      validListingMock({ sellerId: user.id, productId: product.id }),
      { ...sellerActor(user.id), correlationId: 'corr-fixed' },
    );

    expect(publisher.publish).toHaveBeenCalledWith(
      expect.objectContaining({ correlationId: 'corr-fixed' }),
    );
  });
});

describe('when creating a listing for a missing product', () => {
  it('should reject with RESOURCE_NOT_FOUND', async () => {
    const user = validUserMock();
    const { service } = buildService({
      users: new Map([[user.id, user]]),
    });

    await expect(
      service.createListing(
        validListingMock({ sellerId: user.id, productId: 'missing' }),
        sellerActor(user.id),
      ),
    ).rejects.toMatchObject({
      status: 404,
      errorCode: EErrorCode.RESOURCE_NOT_FOUND,
      details: { productId: 'missing' },
    });
  });
});

describe('when updating listing price', () => {
  it('should append price history when priceCents changes', async () => {
    const user = validUserMock();
    const product = validProductMock();
    const listing = validListingMock({
      sellerId: user.id,
      productId: product.id,
      priceCents: 1000,
      status: EListingStatus.DRAFT,
    });
    const { service, priceHistory } = buildService({
      users: new Map([[user.id, user]]),
      products: new Map([[product.id, product]]),
      listings: new Map([[listing.id, listing]]),
    });

    const updated = await service.updateListingById(
      listing.id,
      { listingData: { priceCents: 1500, listPriceCents: 1500 } },
      sellerActor(user.id),
    );

    expect(updated.priceCents).toBe(1500);
    expect(priceHistory).toHaveLength(1);
  });
});

describe('when update listing write returns null', () => {
  it('should reject with RESOURCE_NOT_FOUND', async () => {
    const user = validUserMock();
    const product = validProductMock();
    const listing = validListingMock({
      sellerId: user.id,
      productId: product.id,
      status: EListingStatus.DRAFT,
    });
    const { service } = buildService({
      users: new Map([[user.id, user]]),
      products: new Map([[product.id, product]]),
      listings: new Map([[listing.id, listing]]),
      updateListingById: async () => null,
    });

    await expect(
      service.updateListingById(
        listing.id,
        { listingData: { title: 'Nope' } },
        sellerActor(user.id),
      ),
    ).rejects.toMatchObject({
      status: 404,
      errorCode: EErrorCode.RESOURCE_NOT_FOUND,
    });
  });
});

describe('when transitioning status and write returns null', () => {
  it('should reject with RESOURCE_NOT_FOUND on pause', async () => {
    const user = validUserMock();
    const listing = validListingMock({
      sellerId: user.id,
      status: EListingStatus.PUBLISHED,
    });
    const { service } = buildService({
      users: new Map([[user.id, user]]),
      listings: new Map([[listing.id, listing]]),
      updateListingById: async () => null,
    });

    await expect(
      service.pauseListing(listing.id, sellerActor(user.id)),
    ).rejects.toMatchObject({
      status: 404,
      errorCode: EErrorCode.RESOURCE_NOT_FOUND,
    });
  });
});

describe('when pausing from an invalid status', () => {
  it('should reject with RESOURCE_CONFLICT', async () => {
    const user = validUserMock();
    const listing = validListingMock({
      sellerId: user.id,
      status: EListingStatus.DRAFT,
    });
    const { service } = buildService({
      users: new Map([[user.id, user]]),
      listings: new Map([[listing.id, listing]]),
    });

    await expect(
      service.pauseListing(listing.id, sellerActor(user.id)),
    ).rejects.toMatchObject({
      status: 409,
      errorCode: EErrorCode.RESOURCE_CONFLICT,
      message: 'Invalid listing status transition',
    });
  });
});

describe('when publishing from an unknown status', () => {
  it('should reject with RESOURCE_CONFLICT via empty allowed transitions', async () => {
    const listing = validListingMock({
      status: 'UNKNOWN' as EListingStatus,
      shipping: { modes: [EShippingMode.PICKUP] },
    });
    const { service } = buildService({
      listings: new Map([[listing.id, listing]]),
    });

    await expect(
      service.publishListing(listing.id, backofficeActor()),
    ).rejects.toMatchObject({
      status: 409,
      errorCode: EErrorCode.RESOURCE_CONFLICT,
    });
  });
});

describe('when submitting without photos or shipping modes', () => {
  it('should reject when photoUrls are missing', async () => {
    const user = validUserMock();
    const listing = validListingMock({
      sellerId: user.id,
      media: { photoUrls: [] },
      shipping: { modes: [EShippingMode.PICKUP] },
    });
    const { service } = buildService({
      users: new Map([[user.id, user]]),
      listings: new Map([[listing.id, listing]]),
    });

    await expect(
      service.submitListing(listing.id, sellerActor(user.id)),
    ).rejects.toMatchObject({
      status: 400,
      errorCode: EErrorCode.FIELD_INVALID,
      details: { field: 'media.photoUrls' },
    });
  });

  it('should reject when media is undefined', async () => {
    const user = validUserMock();
    const listing = {
      ...validListingMock({
        sellerId: user.id,
        shipping: { modes: [EShippingMode.PICKUP] },
      }),
      media: undefined,
    } as unknown as IListing;
    const { service } = buildService({
      users: new Map([[user.id, user]]),
      listings: new Map([[listing.id, listing]]),
    });

    await expect(
      service.submitListing(listing.id, sellerActor(user.id)),
    ).rejects.toMatchObject({
      status: 400,
      errorCode: EErrorCode.FIELD_INVALID,
      details: { field: 'media.photoUrls' },
    });
  });

  it('should reject when shipping modes are missing', async () => {
    const user = validUserMock();
    const listing = validListingMock({
      sellerId: user.id,
      shipping: { modes: [] },
    });
    const { service } = buildService({
      users: new Map([[user.id, user]]),
      listings: new Map([[listing.id, listing]]),
    });

    await expect(
      service.submitListing(listing.id, sellerActor(user.id)),
    ).rejects.toMatchObject({
      status: 400,
      errorCode: EErrorCode.FIELD_INVALID,
      details: { field: 'shipping.modes' },
    });
  });

  it('should reject when shipping is undefined', async () => {
    const user = validUserMock();
    const listing = {
      ...validListingMock({ sellerId: user.id }),
      shipping: undefined,
    } as unknown as IListing;
    const { service } = buildService({
      users: new Map([[user.id, user]]),
      listings: new Map([[listing.id, listing]]),
    });

    await expect(
      service.submitListing(listing.id, sellerActor(user.id)),
    ).rejects.toMatchObject({
      status: 400,
      errorCode: EErrorCode.FIELD_INVALID,
      details: { field: 'shipping.modes' },
    });
  });
});

describe('when publishing with SHIPPING and missing dimensions', () => {
  it('should reject when packageLengthCm is missing', async () => {
    const listing = validListingMock({
      status: EListingStatus.SUBMITTED,
      shipping: {
        modes: [EShippingMode.SHIPPING],
        packageWeightGrams: 500,
        packageWidthCm: 10,
        packageHeightCm: 10,
      },
    });
    const { service } = buildService({
      listings: new Map([[listing.id, listing]]),
    });

    await expect(
      service.publishListing(listing.id, backofficeActor()),
    ).rejects.toMatchObject({
      status: 400,
      errorCode: EErrorCode.FIELD_INVALID,
      details: { field: 'shipping' },
    });
  });

  it('should reject when packageWidthCm is zero', async () => {
    const listing = validListingMock({
      status: EListingStatus.SUBMITTED,
      shipping: {
        modes: [EShippingMode.SHIPPING],
        packageWeightGrams: 500,
        packageLengthCm: 10,
        packageWidthCm: 0,
        packageHeightCm: 10,
      },
    });
    const { service } = buildService({
      listings: new Map([[listing.id, listing]]),
    });

    await expect(
      service.publishListing(listing.id, backofficeActor()),
    ).rejects.toMatchObject({
      status: 400,
      errorCode: EErrorCode.FIELD_INVALID,
    });
  });

  it('should reject when packageHeightCm is missing', async () => {
    const listing = validListingMock({
      status: EListingStatus.SUBMITTED,
      shipping: {
        modes: [EShippingMode.SHIPPING],
        packageWeightGrams: 500,
        packageLengthCm: 10,
        packageWidthCm: 10,
      },
    });
    const { service } = buildService({
      listings: new Map([[listing.id, listing]]),
    });

    await expect(
      service.publishListing(listing.id, backofficeActor()),
    ).rejects.toMatchObject({
      status: 400,
      errorCode: EErrorCode.FIELD_INVALID,
    });
  });
});

describe('when applyVerificationApproved hits all skip reasons', () => {
  it('should skip missing listingId, missing listing, published and draft', async () => {
    const published = validListingMock({ status: EListingStatus.PUBLISHED });
    const draft = validListingMock({ status: EListingStatus.DRAFT });
    const { service } = buildService({
      listings: new Map([
        [published.id, published],
        [draft.id, draft],
      ]),
    });

    const base = {
      eventType: 'verification.case.approved',
      producerModule: 'verification',
      schemaVersion: 1,
      occurredAt: new Date().toISOString(),
      correlationId: 'c1',
    };

    await expect(
      service.applyVerificationApproved({
        ...base,
        eventId: 'e1',
        aggregateId: 'a1',
        payload: {},
      }),
    ).resolves.toBeUndefined();

    await expect(
      service.applyVerificationApproved({
        ...base,
        eventId: 'e2',
        aggregateId: 'a2',
        payload: { listingId: 'missing' },
      }),
    ).resolves.toBeUndefined();

    await expect(
      service.applyVerificationApproved({
        ...base,
        eventId: 'e3',
        aggregateId: 'a3',
        payload: { listingId: published.id },
      }),
    ).resolves.toBeUndefined();

    await expect(
      service.applyVerificationApproved({
        ...base,
        eventId: 'e4',
        aggregateId: 'a4',
        payload: { listingId: draft.id },
      }),
    ).resolves.toBeUndefined();
  });
});
