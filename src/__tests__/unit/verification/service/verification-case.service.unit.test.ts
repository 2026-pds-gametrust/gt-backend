import { Types } from 'mongoose';
import { EErrorCode } from '../../../../domain/common/errors/enums/EErrorCode';
import { IEventPublisher } from '../../../../domain/common/messaging/event-publisher.interface';
import { IListing } from '../../../../domain/listings/entity/interfaces/listing.interface';
import { ESealType } from '../../../../domain/verification/entity/enums/ESealType';
import { EVerificationCaseStatus } from '../../../../domain/verification/entity/enums/EVerificationCaseStatus';
import { IVerificationCase } from '../../../../domain/verification/entity/interfaces/verification-case.interface';
import { VerificationCaseService } from '../../../../domain/verification/service/verification-case.service';
import { validListingMock } from '../../../__mocks__/listing.mock';

function buildService(overrides: {
  cases?: Map<string, IVerificationCase>;
  listings?: Map<string, IListing>;
  findOpenCaseByListingId?: (
    listingId: string,
  ) => Promise<IVerificationCase | null>;
  updateVerificationCaseById?: (
    id: string,
    data: Partial<IVerificationCase>,
  ) => Promise<IVerificationCase | null>;
  openCaseImpl?: (params: {
    id: string;
    listingId: string;
  }) => Promise<IVerificationCase>;
} = {}) {
  const cases = overrides.cases ?? new Map<string, IVerificationCase>();
  const listings = overrides.listings ?? new Map<string, IListing>();
  const openByListing = new Map<string, IVerificationCase>();
  for (const c of cases.values()) {
    if (
      c.status === EVerificationCaseStatus.PENDING ||
      c.status === EVerificationCaseStatus.IN_REVIEW
    ) {
      openByListing.set(c.listingId, c);
    }
  }

  const publisher: IEventPublisher = {
    publish: jest.fn().mockResolvedValue(undefined),
  };
  const sealService = {
    grantSeal: jest.fn().mockResolvedValue({ id: 'seal-1' }),
    revokeSeal: jest.fn(),
    getSealById: jest.fn(),
    listSealsByListingId: jest.fn(),
  };

  const service = new VerificationCaseService({
    verificationCaseRepositoryRead: {
      findVerificationCaseById: async (id: string) => cases.get(id) ?? null,
      findOpenCaseByListingId:
        overrides.findOpenCaseByListingId ??
        (async (listingId: string) => openByListing.get(listingId) ?? null),
      listVerificationCases: async () => [...cases.values()],
    },
    verificationCaseRepositoryWrite: {
      createVerificationCase: async (verificationCase: IVerificationCase) => {
        cases.set(verificationCase.id, verificationCase);
        openByListing.set(verificationCase.listingId, verificationCase);
        return verificationCase;
      },
      updateVerificationCaseById:
        overrides.updateVerificationCaseById ??
        (async (id: string, data: Partial<IVerificationCase>) => {
          const existing = cases.get(id);
          if (!existing) return null;
          const updated = { ...existing, ...data };
          cases.set(id, updated);
          return updated;
        }),
    },
    listingRepositoryRead: {
      findListingById: async (id: string) => listings.get(id) ?? null,
      listListings: async () => [...listings.values()],
    },
    sealService: sealService as never,
    eventPublisher: publisher,
  } as never);

  return { service, cases, listings, publisher, sealService, openByListing };
}

function openCaseFixture(
  listingId: string,
  status = EVerificationCaseStatus.PENDING,
): IVerificationCase {
  return {
    id: new Types.ObjectId().toHexString(),
    listingId,
    status,
    createdAt: new Date(),
  };
}

describe('when ensureOpenCaseForListing races with a concurrent create', () => {
  it('should return the raced open case after 409', async () => {
    const listing = validListingMock();
    const raced = openCaseFixture(listing.id);
    let attempts = 0;

    const { service } = buildService({
      listings: new Map([[listing.id, listing]]),
      findOpenCaseByListingId: async () => {
        attempts += 1;
        // 1: ensure sees none → openCase
        // 2: openCase sees concurrent case → 409
        // 3: ensure catch reloads raced case
        if (attempts === 1) return null;
        return raced;
      },
    });

    const result = await service.ensureOpenCaseForListing(listing.id);
    expect(result.id).toBe(raced.id);
  });

  it('should rethrow when 409 occurs but no open case is found afterward', async () => {
    const listing = validListingMock();
    let attempts = 0;
    const ghost = openCaseFixture(listing.id);

    const { service } = buildService({
      listings: new Map([[listing.id, listing]]),
      findOpenCaseByListingId: async () => {
        attempts += 1;
        if (attempts === 1) return null;
        if (attempts === 2) return ghost;
        return null;
      },
    });

    await expect(
      service.ensureOpenCaseForListing(listing.id),
    ).rejects.toMatchObject({ status: 409 });
  });

  it('should rethrow non-conflict errors from openCase', async () => {
    const { service } = buildService({
      findOpenCaseByListingId: async () => null,
    });

    await expect(
      service.ensureOpenCaseForListing('missing-listing'),
    ).rejects.toMatchObject({
      status: 404,
      errorCode: EErrorCode.RESOURCE_NOT_FOUND,
    });
  });
});
describe('when assigning a reviewer with blank moderatorId', () => {
  it('should reject with FIELD_INVALID for whitespace', async () => {
    const listing = validListingMock();
    const verificationCase = openCaseFixture(listing.id);
    const { service } = buildService({
      listings: new Map([[listing.id, listing]]),
      cases: new Map([[verificationCase.id, verificationCase]]),
    });

    await expect(
      service.assignReviewer(verificationCase.id, { moderatorId: '  ' }),
    ).rejects.toMatchObject({
      status: 400,
      errorCode: EErrorCode.FIELD_INVALID,
    });
  });

  it('should reject with FIELD_INVALID for undefined moderatorId', async () => {
    const listing = validListingMock();
    const verificationCase = openCaseFixture(listing.id);
    const { service } = buildService({
      listings: new Map([[listing.id, listing]]),
      cases: new Map([[verificationCase.id, verificationCase]]),
    });

    await expect(
      service.assignReviewer(verificationCase.id, {
        moderatorId: undefined as never,
      }),
    ).rejects.toMatchObject({
      status: 400,
      errorCode: EErrorCode.FIELD_INVALID,
    });
  });
});

describe('when assign reviewer write returns null', () => {
  it('should reject with RESOURCE_NOT_FOUND', async () => {
    const listing = validListingMock();
    const verificationCase = openCaseFixture(listing.id);
    const { service } = buildService({
      listings: new Map([[listing.id, listing]]),
      cases: new Map([[verificationCase.id, verificationCase]]),
      updateVerificationCaseById: async () => null,
    });

    await expect(
      service.assignReviewer(verificationCase.id, {
        moderatorId: 'mod-1',
      }),
    ).rejects.toMatchObject({
      status: 404,
      errorCode: EErrorCode.RESOURCE_NOT_FOUND,
    });
  });
});

describe('when approving a case whose listing is missing', () => {
  it('should reject with RESOURCE_NOT_FOUND', async () => {
    const verificationCase = openCaseFixture(
      'missing-listing',
      EVerificationCaseStatus.IN_REVIEW,
    );
    const { service } = buildService({
      cases: new Map([[verificationCase.id, verificationCase]]),
    });

    await expect(
      service.approveCase(verificationCase.id),
    ).rejects.toMatchObject({
      status: 404,
      errorCode: EErrorCode.RESOURCE_NOT_FOUND,
      details: { listingId: 'missing-listing' },
    });
  });
});

describe('when approve write returns null', () => {
  it('should reject with RESOURCE_NOT_FOUND', async () => {
    const listing = validListingMock();
    const verificationCase = openCaseFixture(
      listing.id,
      EVerificationCaseStatus.IN_REVIEW,
    );
    const { service } = buildService({
      listings: new Map([[listing.id, listing]]),
      cases: new Map([[verificationCase.id, verificationCase]]),
      updateVerificationCaseById: async () => null,
    });

    await expect(
      service.approveCase(verificationCase.id),
    ).rejects.toMatchObject({
      status: 404,
      errorCode: EErrorCode.RESOURCE_NOT_FOUND,
    });
  });
});

describe('when approving without sealType', () => {
  it('should grant POSSESSION seal by default', async () => {
    const listing = validListingMock();
    const verificationCase = openCaseFixture(
      listing.id,
      EVerificationCaseStatus.IN_REVIEW,
    );
    const { service, sealService } = buildService({
      listings: new Map([[listing.id, listing]]),
      cases: new Map([[verificationCase.id, verificationCase]]),
    });

    await service.approveCase(verificationCase.id);

    expect(sealService.grantSeal).toHaveBeenCalledWith(
      expect.objectContaining({
        type: ESealType.POSSESSION,
        listingId: listing.id,
      }),
    );
  });

  it('should grant the provided sealType when set', async () => {
    const listing = validListingMock();
    const verificationCase = openCaseFixture(
      listing.id,
      EVerificationCaseStatus.IN_REVIEW,
    );
    const { service, sealService } = buildService({
      listings: new Map([[listing.id, listing]]),
      cases: new Map([[verificationCase.id, verificationCase]]),
    });

    await service.approveCase(verificationCase.id, {
      sealType: ESealType.FUNCTIONING,
    });

    expect(sealService.grantSeal).toHaveBeenCalledWith(
      expect.objectContaining({ type: ESealType.FUNCTIONING }),
    );
  });
});

describe('when rejecting without a reason', () => {
  it('should reject with FIELD_INVALID for whitespace', async () => {
    const listing = validListingMock();
    const verificationCase = openCaseFixture(
      listing.id,
      EVerificationCaseStatus.IN_REVIEW,
    );
    const { service } = buildService({
      listings: new Map([[listing.id, listing]]),
      cases: new Map([[verificationCase.id, verificationCase]]),
    });

    await expect(
      service.rejectCase(verificationCase.id, { reason: '   ' }),
    ).rejects.toMatchObject({
      status: 400,
      errorCode: EErrorCode.FIELD_INVALID,
      details: { field: 'reason' },
    });
  });

  it('should reject with FIELD_INVALID for undefined reason', async () => {
    const listing = validListingMock();
    const verificationCase = openCaseFixture(
      listing.id,
      EVerificationCaseStatus.IN_REVIEW,
    );
    const { service } = buildService({
      listings: new Map([[listing.id, listing]]),
      cases: new Map([[verificationCase.id, verificationCase]]),
    });

    await expect(
      service.rejectCase(verificationCase.id, {
        reason: undefined as never,
      }),
    ).rejects.toMatchObject({
      status: 400,
      errorCode: EErrorCode.FIELD_INVALID,
    });
  });
});

describe('when reject write returns null', () => {
  it('should reject with RESOURCE_NOT_FOUND', async () => {
    const listing = validListingMock();
    const verificationCase = openCaseFixture(
      listing.id,
      EVerificationCaseStatus.IN_REVIEW,
    );
    const { service } = buildService({
      listings: new Map([[listing.id, listing]]),
      cases: new Map([[verificationCase.id, verificationCase]]),
      updateVerificationCaseById: async () => null,
    });

    await expect(
      service.rejectCase(verificationCase.id, { reason: 'fraud' }),
    ).rejects.toMatchObject({
      status: 404,
      errorCode: EErrorCode.RESOURCE_NOT_FOUND,
    });
  });
});

describe('when transitioning from an unknown status', () => {
  it('should reject with RESOURCE_CONFLICT', async () => {
    const listing = validListingMock();
    const verificationCase = {
      ...openCaseFixture(listing.id),
      status: 'UNKNOWN' as EVerificationCaseStatus,
    };
    const { service } = buildService({
      listings: new Map([[listing.id, listing]]),
      cases: new Map([[verificationCase.id, verificationCase]]),
    });

    await expect(
      service.assignReviewer(verificationCase.id, { moderatorId: 'mod' }),
    ).rejects.toMatchObject({
      status: 409,
      errorCode: EErrorCode.RESOURCE_CONFLICT,
    });
  });
});
