import { Types } from 'mongoose';
import { EErrorCode } from '../../../../domain/common/errors/enums/EErrorCode';
import { IEventPublisher } from '../../../../domain/common/messaging/event-publisher.interface';
import { IListing } from '../../../../domain/listings/entity/interfaces/listing.interface';
import { EEvidenceType } from '../../../../domain/verification/entity/enums/EEvidenceType';
import { ESealType } from '../../../../domain/verification/entity/enums/ESealType';
import { EVerificationCaseStatus } from '../../../../domain/verification/entity/enums/EVerificationCaseStatus';
import { IEvidenceItem } from '../../../../domain/verification/entity/interfaces/evidence-item.interface';
import { IVerificationCase } from '../../../../domain/verification/entity/interfaces/verification-case.interface';
import { IPossessionProofCodeIssuer } from '../../../../domain/verification/ports/possession-proof-code-issuer.interface';
import { VerificationCaseService } from '../../../../domain/verification/service/verification-case.service';
import { HmacPossessionProofCodeIssuer } from '../../../../infraestructure/crypto/hmac-possession-proof-code-issuer';
import { validListingMock } from '../../../__mocks__/listing.mock';
import { sellerActor } from '../../../__mocks__/actor.mock';

function buildService(overrides: {
  cases?: Map<string, IVerificationCase>;
  listings?: Map<string, IListing>;
  evidence?: Map<string, IEvidenceItem[]>;
  findOpenCaseByListingId?: (
    listingId: string,
  ) => Promise<IVerificationCase | null>;
  findLatestChangesRequestedCaseByListingId?: (
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
  proofCodeIssuer?: IPossessionProofCodeIssuer;
  proofCodeAnalysisEnqueue?: {
    requestAnalysis: (caseId: string) => Promise<unknown>;
    findLatestStatus?: (
      caseId: string,
    ) => Promise<'PENDING' | 'COMPLETED' | 'UNAVAILABLE' | null>;
  };
} = {}) {
  const cases = overrides.cases ?? new Map<string, IVerificationCase>();
  const listings = overrides.listings ?? new Map<string, IListing>();
  const evidence =
    overrides.evidence ?? new Map<string, IEvidenceItem[]>();
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
  const proofCodeIssuer =
    overrides.proofCodeIssuer ??
    new HmacPossessionProofCodeIssuer(
      'gt-test-proof-code-pepper-min-32-chars!!',
    );

  const service = new VerificationCaseService({
    verificationCaseRepositoryRead: {
      findVerificationCaseById: async (id: string) => cases.get(id) ?? null,
      findOpenCaseByListingId:
        overrides.findOpenCaseByListingId ??
        (async (listingId: string) => openByListing.get(listingId) ?? null),
      findLatestChangesRequestedCaseByListingId:
        overrides.findLatestChangesRequestedCaseByListingId ??
        (async () => null),
      findCasesByListingIds: async () => [...cases.values()],
      listModerationQueue: async () => [],
      countModerationQueue: async () => 0,
      countModerationQueueStats: async () => ({
        total: 0,
        pending: 0,
        inReview: 0,
        approved: 0,
        changesRequested: 0,
        rejected: 0,
      }),
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
    evidenceItemRepositoryRead: {
      findEvidenceItemById: async () => null,
      listByCaseId: async (caseId: string) => evidence.get(caseId) ?? [],
    },
    listingRepositoryRead: {
      findListingById: async (id: string) => listings.get(id) ?? null,
      listListings: async () => [...listings.values()],
    },
    sealService: sealService as never,
    eventPublisher: publisher,
    proofCodeIssuer,
    proofCodeAnalysisEnqueue: overrides.proofCodeAnalysisEnqueue,
  } as never);

  return {
    service,
    cases,
    listings,
    evidence,
    publisher,
    sealService,
    openByListing,
    proofCodeIssuer,
  };
}

function photoEvidence(caseId: string): IEvidenceItem {
  return {
    id: new Types.ObjectId().toHexString(),
    caseId,
    type: EEvidenceType.PHOTO,
    storageKey: 'private/evidence/photo.jpg',
    createdAt: new Date(),
  };
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
      evidence: new Map([[verificationCase.id, [photoEvidence(verificationCase.id)]]]),
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

describe('when assigning without PHOTO evidence', () => {
  it('should reject with STATUS_REQUIRES_FIELDS', async () => {
    const listing = validListingMock();
    const verificationCase = openCaseFixture(listing.id);
    const { service } = buildService({
      listings: new Map([[listing.id, listing]]),
      cases: new Map([[verificationCase.id, verificationCase]]),
    });

    await expect(
      service.assignReviewer(verificationCase.id, { moderatorId: 'mod-1' }),
    ).rejects.toMatchObject({
      status: 400,
      errorCode: EErrorCode.STATUS_REQUIRES_FIELDS,
    });
  });
});

describe('when listing has video and assign lacks VIDEO evidence', () => {
  it('should reject with STATUS_REQUIRES_FIELDS', async () => {
    const listing = validListingMock({
      media: {
        photoUrls: ['https://cdn.example/p.jpg'],
        videoUrl: 'https://cdn.example/v.mp4',
      },
    });
    const verificationCase = openCaseFixture(listing.id);
    const { service } = buildService({
      listings: new Map([[listing.id, listing]]),
      cases: new Map([[verificationCase.id, verificationCase]]),
      evidence: new Map([[verificationCase.id, [photoEvidence(verificationCase.id)]]]),
    });

    await expect(
      service.assignReviewer(verificationCase.id, { moderatorId: 'mod-1' }),
    ).rejects.toMatchObject({
      status: 400,
      errorCode: EErrorCode.STATUS_REQUIRES_FIELDS,
    });
  });
});

describe('when retrieving proof code as owner', () => {
  it('should return 8-char non-ambiguous code bound to case', async () => {
    const listing = validListingMock({ sellerId: 'seller-1' });
    const verificationCase = openCaseFixture(listing.id);
    const { service, proofCodeIssuer } = buildService({
      listings: new Map([[listing.id, listing]]),
      cases: new Map([[verificationCase.id, verificationCase]]),
    });

    const first = await service.getProofCodePlaintext(
      sellerActor('seller-1'),
      verificationCase.id,
    );
    const second = await service.getProofCodePlaintext(
      sellerActor('seller-1'),
      verificationCase.id,
    );

    expect(first.code).toHaveLength(8);
    expect(first.code).toMatch(/^[23456789ABCDEFGHJKMNPQRSTVWXYZ]+$/);
    expect(first.code).toBe(second.code);
    expect(first.code).toBe(
      proofCodeIssuer.issueForCase(verificationCase.id).code,
    );
    expect(first.caseId).toBe(verificationCase.id);
    expect(first.listingId).toBe(listing.id);
  });
});

describe('when retrieving proof code by listing as owner', () => {
  it('should open case if missing and return the same code as case GET', async () => {
    const listing = validListingMock({ sellerId: 'seller-1' });
    const { service, proofCodeIssuer } = buildService({
      listings: new Map([[listing.id, listing]]),
      cases: new Map(),
    });

    const byListing = await service.getProofCodeForListing(
      sellerActor('seller-1'),
      listing.id,
    );

    expect(byListing.code).toHaveLength(8);
    expect(byListing.listingId).toBe(listing.id);
    expect(byListing.code).toBe(
      proofCodeIssuer.issueForCase(byListing.caseId).code,
    );

    const byCase = await service.getProofCodePlaintext(
      sellerActor('seller-1'),
      byListing.caseId,
    );
    expect(byCase.code).toBe(byListing.code);
  });
});

describe('when retrieving proof code as non-owner', () => {
  it('should reject with forbidden', async () => {
    const listing = validListingMock({ sellerId: 'seller-1' });
    const verificationCase = openCaseFixture(listing.id);
    const { service } = buildService({
      listings: new Map([[listing.id, listing]]),
      cases: new Map([[verificationCase.id, verificationCase]]),
    });

    await expect(
      service.getProofCodePlaintext(
        sellerActor('other-seller'),
        verificationCase.id,
      ),
    ).rejects.toMatchObject({
      status: 403,
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

describe('when assigning a reviewer without recent possession analysis', () => {
  it('should enqueue proof-code analysis fire-and-forget', async () => {
    // TC-12
    const listing = validListingMock({
      media: {
        photoUrls: ['https://cdn.example.com/p1.jpg'],
        assetIds: ['asset-1'],
      },
    });
    const verificationCase = {
      ...openCaseFixture(listing.id),
      proofCodeHash: 'a'.repeat(64),
      proofCodeIssuedAt: new Date(),
    };
    let resolveEnqueue!: () => void;
    const enqueued = new Promise<void>((resolve) => {
      resolveEnqueue = resolve;
    });
    const requestAnalysis = jest.fn(async () => {
      resolveEnqueue();
      return null;
    });

    const { service } = buildService({
      listings: new Map([[listing.id, listing]]),
      cases: new Map([[verificationCase.id, verificationCase]]),
      evidence: new Map([[verificationCase.id, [photoEvidence(verificationCase.id)]]]),
      proofCodeAnalysisEnqueue: {
        requestAnalysis,
        findLatestStatus: async () => null,
      },
    });

    const assigned = await service.assignReviewer(verificationCase.id, {
      moderatorId: 'mod-1',
    });
    expect(assigned.status).toBe(EVerificationCaseStatus.IN_REVIEW);

    await enqueued;
    expect(requestAnalysis).toHaveBeenCalledWith(verificationCase.id);
  });
});

describe('when assigning a reviewer with COMPLETED possession analysis', () => {
  it('should skip enqueue', async () => {
    // TC-12 skip path
    const listing = validListingMock({
      media: {
        photoUrls: ['https://cdn.example.com/p1.jpg'],
        assetIds: ['asset-1'],
      },
    });
    const verificationCase = {
      ...openCaseFixture(listing.id),
      proofCodeHash: 'a'.repeat(64),
      proofCodeIssuedAt: new Date(),
    };
    const requestAnalysis = jest.fn();

    const { service } = buildService({
      listings: new Map([[listing.id, listing]]),
      cases: new Map([[verificationCase.id, verificationCase]]),
      evidence: new Map([[verificationCase.id, [photoEvidence(verificationCase.id)]]]),
      proofCodeAnalysisEnqueue: {
        requestAnalysis,
        findLatestStatus: async () => 'COMPLETED',
      },
    });

    await service.assignReviewer(verificationCase.id, {
      moderatorId: 'mod-1',
    });

    await new Promise((resolve) => setImmediate(resolve));
    expect(requestAnalysis).not.toHaveBeenCalled();
  });
});

describe('when approving a case with FAIL proofCodeAnalysis items', () => {
  it('should approve without gating on possession AI status', async () => {
    // TC-06
    const listing = validListingMock({
      media: {
        photoUrls: ['https://cdn.example.com/p1.jpg'],
        assetIds: ['asset-1'],
      },
    });
    const verificationCase = {
      ...openCaseFixture(listing.id, EVerificationCaseStatus.IN_REVIEW),
      assignedModeratorId: 'mod-1',
      checklist: {
        proofCodeAnalysis: {
          analysisId: 'pca-1',
          status: 'COMPLETED',
          items: [
            {
              id: 'proof-code-present',
              status: 'FAIL',
              weight: 40,
              reason: 'Código ausente.',
            },
          ],
          promptVersion: 'proof-code-v1',
          analyzedAt: new Date().toISOString(),
        },
      },
    };
    const { service, sealService } = buildService({
      listings: new Map([[listing.id, listing]]),
      cases: new Map([[verificationCase.id, verificationCase]]),
    });

    const approved = await service.approveCase(verificationCase.id);
    expect(approved.status).toBe(EVerificationCaseStatus.APPROVED);
    expect(sealService.grantSeal).toHaveBeenCalled();
  });
});
