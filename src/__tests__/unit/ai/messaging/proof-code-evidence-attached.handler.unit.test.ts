import { randomUUID } from 'crypto';
import { createEventEnvelope } from '../../../../domain/common/messaging/event-envelope';
import { ProofCodeEvidenceAttachedHandler } from '../../../../domain/ai/messaging/handlers/proof-code-evidence-attached.handler';
import { EEvidenceType } from '../../../../domain/verification/entity/enums/EEvidenceType';
import { EVerificationCaseStatus } from '../../../../domain/verification/entity/enums/EVerificationCaseStatus';
import { EShippingMode } from '../../../../domain/listings/entity/enums/EShippingMode';
import { validListingMock } from '../../../__mocks__/listing.mock';

describe('when evidence attached handler receives eligible PHOTO', () => {
  it('should enqueue requestAnalysis fire-and-forget without awaiting provider', async () => {
    // TC-13 trigger / TC-20 async contract at handler boundary
    const caseId = randomUUID();
    const listing = validListingMock({
      shipping: { modes: [EShippingMode.PICKUP] },
      media: {
        photoUrls: ['https://cdn.example.com/p1.jpg'],
        assetIds: ['asset-photo-1'],
      },
    });
    let resolveAnalysis!: () => void;
    const analysisStarted = new Promise<void>((resolve) => {
      resolveAnalysis = resolve;
    });
    let analysisCalls = 0;

    const handler = new ProofCodeEvidenceAttachedHandler({
      proofCodeAnalysisService: {
        requestAnalysis: async () => {
          analysisCalls += 1;
          resolveAnalysis();
          await new Promise(() => undefined);
          return null;
        },
      } as never,
      verificationCaseRepositoryRead: {
        findVerificationCaseById: async () => ({
          id: caseId,
          listingId: listing.id,
          status: EVerificationCaseStatus.PENDING,
          proofCodeHash: 'a'.repeat(64),
          proofCodeIssuedAt: new Date(),
          createdAt: new Date(),
        }),
      } as never,
      evidenceItemRepositoryRead: {
        listByCaseId: async () => [
          {
            id: randomUUID(),
            caseId,
            type: EEvidenceType.PHOTO,
            storageKey: 'private/evidence/photo.jpg',
            createdAt: new Date(),
          },
        ],
      } as never,
      listingRepositoryRead: {
        findListingById: async () => listing,
      } as never,
    });

    await handler.handle(
      createEventEnvelope({
        eventId: randomUUID(),
        eventType: 'verification.evidence.attached',
        aggregateId: caseId,
        producerModule: 'verification',
        correlationId: randomUUID(),
        payload: {
          caseId,
          listingId: listing.id,
          evidenceId: randomUUID(),
          type: EEvidenceType.PHOTO,
        },
      }),
    );

    await analysisStarted;
    expect(analysisCalls).toBe(1);
  });
});

describe('when evidence attached handler lacks proof-code challenge', () => {
  it('should skip enqueue', async () => {
    const requestAnalysis = jest.fn();
    const handler = new ProofCodeEvidenceAttachedHandler({
      proofCodeAnalysisService: { requestAnalysis } as never,
      verificationCaseRepositoryRead: {
        findVerificationCaseById: async () => ({
          id: randomUUID(),
          listingId: randomUUID(),
          status: EVerificationCaseStatus.PENDING,
          createdAt: new Date(),
        }),
      } as never,
      evidenceItemRepositoryRead: {
        listByCaseId: async () => [],
      } as never,
      listingRepositoryRead: {
        findListingById: async () => null,
      } as never,
    });

    await handler.handle(
      createEventEnvelope({
        eventId: randomUUID(),
        eventType: 'verification.evidence.attached',
        aggregateId: randomUUID(),
        producerModule: 'verification',
        correlationId: randomUUID(),
        payload: { caseId: randomUUID(), type: EEvidenceType.PHOTO },
      }),
    );

    expect(requestAnalysis).not.toHaveBeenCalled();
  });
});

describe('when evidence attached handler receives non-media type', () => {
  it('should skip enqueue for TEXT evidence', async () => {
    const requestAnalysis = jest.fn();
    const handler = new ProofCodeEvidenceAttachedHandler({
      proofCodeAnalysisService: { requestAnalysis } as never,
      verificationCaseRepositoryRead: {
        findVerificationCaseById: async () => null,
      } as never,
      evidenceItemRepositoryRead: {
        listByCaseId: async () => [],
      } as never,
      listingRepositoryRead: {
        findListingById: async () => null,
      } as never,
    });

    await handler.handle(
      createEventEnvelope({
        eventId: randomUUID(),
        eventType: 'verification.evidence.attached',
        aggregateId: randomUUID(),
        producerModule: 'verification',
        correlationId: randomUUID(),
        payload: { caseId: randomUUID(), type: 'NOTE' },
      }),
    );

    expect(requestAnalysis).not.toHaveBeenCalled();
  });
});
