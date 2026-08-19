import { Types } from 'mongoose';
import { EErrorCode } from '../../../../domain/common/errors/enums/EErrorCode';
import { EListingStatus } from '../../../../domain/listings/entity/enums/EListingStatus';
import { IListing } from '../../../../domain/listings/entity/interfaces/listing.interface';
import { ESealStatus } from '../../../../domain/verification/entity/enums/ESealStatus';
import { ESealType } from '../../../../domain/verification/entity/enums/ESealType';
import {
  backofficeActor,
  sellerActor,
} from '../../../__mocks__/actor.mock';
import { validListingMock } from '../../../__mocks__/listing.mock';

function anonymousActor() {
  return { actorId: '', groups: [] };
}

function buildService(listings: Map<string, IListing>, sealedListingIds: Set<string>) {
  const service = new (jest.requireActual(
    '../../../../domain/listings/service/listing.service',
  ).ListingService)({
    listingRepositoryRead: {
      findListingById: async (id: string) => listings.get(id) ?? null,
      listListings: async (filter: Partial<IListing> = {}) => {
        return [...listings.values()].filter((listing) =>
          Object.entries(filter).every(
            ([key, value]) =>
              listing[key as keyof IListing] === value,
          ),
        );
      },
      listPublicListings: async () => [],
      countPublicListings: async () => 0,
      listSellerListings: async () => [],
      countSellerListings: async () => 0,
    },
    listingRepositoryWrite: {
      createListing: async (listing: IListing) => listing,
      updateListingById: async () => null,
    },
    listingEventRepositoryRead: {
      listByListingId: async () => [],
      findListingEventById: async () => null,
    },
    listingEventRepositoryWrite: {
      appendListingEvent: async (event: unknown) => event as never,
    },
    userRepositoryRead: {
      findUserById: async () => null,
      findUserByEmail: async () => null,
      findUserByCpf: async () => null,
      listUsers: async () => [],
    },
    productRepositoryRead: {
      findProductById: async () => null,
      findProductBySlug: async () => null,
      findProductBySku: async () => null,
      listProducts: async () => [],
    },
    priceHistoryRepositoryWrite: {
      appendPriceHistory: async (entry: unknown) => entry as never,
    },
    eventPublisher: { publish: jest.fn().mockResolvedValue(undefined) },
    sealRepositoryRead: {
      findSealById: async () => null,
      findActiveSealByListingId: async (listingId: string) =>
        sealedListingIds.has(listingId)
          ? {
              id: 'seal-1',
              listingId,
              caseId: 'case-1',
              type: ESealType.POSSESSION,
              status: ESealStatus.GRANTED,
              grantedAt: new Date(),
              createdAt: new Date(),
            }
          : null,
      listSealsByListingId: async () => [],
      listActiveSealsByListingIds: async (listingIds: string[]) =>
        listingIds
          .filter((listingId) => sealedListingIds.has(listingId))
          .map((listingId) => ({
            id: `seal-${listingId}`,
            listingId,
            caseId: 'case-1',
            type: ESealType.POSSESSION,
            status: ESealStatus.GRANTED,
            grantedAt: new Date(),
            createdAt: new Date(),
          })),
    },
  });

  return service;
}

describe('when checking listing visibility', () => {
  it('should hide draft listings from anonymous viewers', async () => {
    const listing = validListingMock({
      id: new Types.ObjectId().toHexString(),
      status: EListingStatus.DRAFT,
    });
    const listings = new Map([[listing.id, listing]]);
    const service = buildService(listings, new Set());

    await expect(
      service.getListingById(listing.id, anonymousActor()),
    ).rejects.toMatchObject({
      status: 404,
      errorCode: EErrorCode.RESOURCE_NOT_FOUND,
    });
  });

  it('should allow the seller to read a draft listing', async () => {
    const listing = validListingMock({
      id: new Types.ObjectId().toHexString(),
      status: EListingStatus.DRAFT,
    });
    const listings = new Map([[listing.id, listing]]);
    const service = buildService(listings, new Set());

    await expect(
      service.getListingById(listing.id, sellerActor(listing.sellerId)),
    ).resolves.toMatchObject({ id: listing.id, status: EListingStatus.DRAFT });
  });

  it('should hide published listings without seal from anonymous viewers', async () => {
    const listing = validListingMock({
      id: new Types.ObjectId().toHexString(),
      status: EListingStatus.PUBLISHED,
    });
    const listings = new Map([[listing.id, listing]]);
    const service = buildService(listings, new Set());

    await expect(
      service.getListingById(listing.id, anonymousActor()),
    ).rejects.toMatchObject({
      status: 404,
      errorCode: EErrorCode.RESOURCE_NOT_FOUND,
    });
  });

  it('should expose verified published listings to anonymous viewers', async () => {
    const listing = validListingMock({
      id: new Types.ObjectId().toHexString(),
      status: EListingStatus.PUBLISHED,
    });
    const listings = new Map([[listing.id, listing]]);
    const service = buildService(listings, new Set([listing.id]));

    await expect(
      service.getListingById(listing.id, anonymousActor()),
    ).resolves.toMatchObject({
      id: listing.id,
      status: EListingStatus.PUBLISHED,
    });
  });

  it('should return only verified listings in the public catalog', async () => {
    const verified = validListingMock({
      id: new Types.ObjectId().toHexString(),
      status: EListingStatus.PUBLISHED,
    });
    const unverified = validListingMock({
      id: new Types.ObjectId().toHexString(),
      status: EListingStatus.PUBLISHED,
    });
    const draft = validListingMock({
      id: new Types.ObjectId().toHexString(),
      status: EListingStatus.DRAFT,
    });
    const listings = new Map([
      [verified.id, verified],
      [unverified.id, unverified],
      [draft.id, draft],
    ]);
    const service = buildService(listings, new Set([verified.id]));

    const page = await service.listPublicListings();
    expect(page.items.map((item: IListing) => item.id)).toEqual([verified.id]);
    expect(page.total).toBe(1);
  });

  it('should let backoffice read any listing by seller filter', async () => {
    const draft = validListingMock({
      id: new Types.ObjectId().toHexString(),
      status: EListingStatus.DRAFT,
    });
    const listings = new Map([[draft.id, draft]]);
    const service = buildService(listings, new Set());

    const result = await service.listListingsForViewer(backofficeActor(), {
      sellerId: draft.sellerId,
    });
    expect(result.map((item: IListing) => item.id)).toEqual([draft.id]);
  });

  it('should let internal reads bypass visibility checks', async () => {
    const draft = validListingMock({
      id: new Types.ObjectId().toHexString(),
      status: EListingStatus.DRAFT,
    });
    const listings = new Map([[draft.id, draft]]);
    const service = buildService(listings, new Set());

    await expect(service.getListingById(draft.id)).resolves.toMatchObject({
      id: draft.id,
    });
  });
});
