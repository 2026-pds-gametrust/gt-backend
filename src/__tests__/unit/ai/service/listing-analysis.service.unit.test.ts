import { randomUUID } from 'crypto';
import { EAnalysisChecklistItemStatus } from '../../../../domain/ai/entity/enums/EAnalysisChecklistItemStatus';
import { EListingAnalysisScope } from '../../../../domain/ai/entity/enums/EListingAnalysisScope';
import { EListingAnalysisStatus } from '../../../../domain/ai/entity/enums/EListingAnalysisStatus';
import { IListingAnalysisProvider } from '../../../../domain/ai/provider/listing-analysis.provider.interface';
import { ListingAnalysisService } from '../../../../domain/ai/service/listing-analysis.service';
import { EListingCondition } from '../../../../domain/listings/entity/enums/EListingCondition';
import { EListingStatus } from '../../../../domain/listings/entity/enums/EListingStatus';
import { EShippingMode } from '../../../../domain/listings/entity/enums/EShippingMode';
import { IListing } from '../../../../domain/listings/entity/interfaces/listing.interface';
import { createEventEnvelope } from '../../../../domain/common/messaging/event-envelope';

function buildListing(override?: Partial<IListing>): IListing {
  return {
    id: randomUUID(),
    sellerId: randomUUID(),
    productId: randomUUID(),
    title: 'RTX 4060 usada',
    description: 'Placa em bom estado, sem defeitos visíveis.',
    condition: EListingCondition.GOOD,
    priceCents: 250000,
    currency: 'BRL',
    media: {
      photoUrls: ['https://cdn.example.com/p1.jpg'],
      videoUrl: 'https://cdn.example.com/v1.mp4',
      assetIds: ['asset-photo-1'],
      videoAssetId: 'asset-video-1',
    },
    shipping: { modes: [EShippingMode.PICKUP] },
    acceptsOffers: false,
    buyNowEnabled: true,
    quantity: 1,
    status: EListingStatus.DRAFT,
    createdAt: new Date(),
    ...override,
  };
}

describe('when requestAnalysis runs with a mocked provider', () => {
  it('should persist COMPLETED analysis and publish ai.listing.analyzed', async () => {
    const listing = buildListing();
    const analyses = new Map<string, unknown>();
    const published: string[] = [];

    const provider: IListingAnalysisProvider = {
      analyze: async () => ({
        modelId: 'mock-model',
        items: [
          {
            id: 'photo-front-visible',
            status: EAnalysisChecklistItemStatus.PASS,
            weight: 15,
            reason: 'Produto visível.',
          },
          {
            id: 'photo-lighting-focus',
            status: EAnalysisChecklistItemStatus.FAIL,
            weight: 10,
            reason: 'Foto escura.',
          },
        ],
      }),
    };

    const service = new ListingAnalysisService({
      listingAnalysisRepositoryRead: {
        findLatestByListingIdAndScope: async () => null,
        findListingAnalysisById: async (id) => analyses.get(id) as never,
        findLatestByListingId: async () => null,
      },
      listingAnalysisRepositoryWrite: {
        createListingAnalysis: async (analysis) => {
          analyses.set(analysis.id, { ...analysis });
          return analysis;
        },
        updateListingAnalysisById: async (id, data) => {
          const current = analyses.get(id) as Record<string, unknown>;
          const updated = { ...current, ...data };
          analyses.set(id, updated);
          return updated as never;
        },
      },
      listingRepositoryRead: {
        findListingById: async (id: string) => (id === listing.id ? listing : null),
        findListingIdsByMediaAssetId: async () => [listing.id],
      } as never,
      listingRepositoryWrite: {
        updateListingById: async () => listing,
      } as never,
      mediaAssetRepositoryRead: {
        findMediaAssetById: async () => null,
      },
      objectStorage: {
        getObject: async () => Buffer.from('fake'),
      } as never,
      verificationCaseRepositoryRead: {
        findOpenCaseByListingId: async () => null,
      } as never,
      verificationCaseRepositoryWrite: {
        updateVerificationCaseById: async () => null,
      } as never,
      analysisProvider: provider,
      eventPublisher: {
        publish: async (envelope) => {
          published.push(envelope.eventType);
        },
      },
      analysisEnabled: true,
      maxPhotosToAnalyze: 4,
      maxVideoBytes: 1024,
    });

    const result = await service.requestAnalysis(
      listing.id,
      EListingAnalysisScope.DRAFT,
    );

    expect(result?.status).toBe(EListingAnalysisStatus.COMPLETED);
    expect(result?.score).toBeGreaterThan(0);
    expect(published).toContain('ai.listing.analyzed');
  });

  it('should mark analysis UNAVAILABLE when provider fails', async () => {
    const listing = buildListing();
    const analyses = new Map<string, unknown>();

    const service = new ListingAnalysisService({
      listingAnalysisRepositoryRead: {
        findLatestByListingIdAndScope: async () => null,
        findListingAnalysisById: async () => null,
        findLatestByListingId: async () => null,
      },
      listingAnalysisRepositoryWrite: {
        createListingAnalysis: async (analysis) => {
          analyses.set(analysis.id, { ...analysis });
          return analysis;
        },
        updateListingAnalysisById: async (id, data) => {
          const current = analyses.get(id) as Record<string, unknown>;
          const updated = { ...current, ...data };
          analyses.set(id, updated);
          return updated as never;
        },
      },
      listingRepositoryRead: {
        findListingById: async () => listing,
        findListingIdsByMediaAssetId: async () => [],
      } as never,
      listingRepositoryWrite: {
        updateListingById: async () => listing,
      } as never,
      mediaAssetRepositoryRead: {
        findMediaAssetById: async () => null,
      },
      objectStorage: { getObject: async () => null } as never,
      verificationCaseRepositoryRead: {
        findOpenCaseByListingId: async () => null,
      } as never,
      verificationCaseRepositoryWrite: {
        updateVerificationCaseById: async () => null,
      } as never,
      analysisProvider: {
        analyze: async () => {
          throw new Error('provider_down');
        },
      },
      eventPublisher: { publish: async () => undefined },
      analysisEnabled: true,
      maxPhotosToAnalyze: 4,
      maxVideoBytes: 1024,
    });

    const result = await service.requestAnalysis(
      listing.id,
      EListingAnalysisScope.DRAFT,
    );

    expect(result?.status).toBe(EListingAnalysisStatus.UNAVAILABLE);
  });

  it('should retry SUBMIT without video when provider rejects video payload', async () => {
    const listing = buildListing({ status: EListingStatus.SUBMITTED });
    const analyses = new Map<string, unknown>();
    let analyzeCalls = 0;

    const photoAsset = {
      id: 'asset-photo-1',
      purpose: 'LISTING',
      status: 'READY',
      contentType: 'image/jpeg',
      bucketClass: 'PUBLIC',
      ownerId: listing.sellerId,
      variants: [
        {
          size: 'CARD',
          format: 'JPEG',
          storageKey: 'photo-key',
          byteSize: 100,
        },
      ],
    };
    const videoAsset = {
      id: 'asset-video-1',
      purpose: 'LISTING',
      status: 'READY',
      contentType: 'video/mp4',
      bucketClass: 'PUBLIC',
      ownerId: listing.sellerId,
      variants: [
        {
          size: 'ORIGINAL',
          format: 'MP4',
          storageKey: 'video-key',
          byteSize: 500,
        },
      ],
    };

    const service = new ListingAnalysisService({
      listingAnalysisRepositoryRead: {
        findLatestByListingIdAndScope: async () => null,
        findListingAnalysisById: async () => null,
        findLatestByListingId: async () => null,
      },
      listingAnalysisRepositoryWrite: {
        createListingAnalysis: async (analysis) => {
          analyses.set(analysis.id, { ...analysis });
          return analysis;
        },
        updateListingAnalysisById: async (id, data) => {
          const current = analyses.get(id) as Record<string, unknown>;
          const updated = { ...current, ...data };
          analyses.set(id, updated);
          return updated as never;
        },
      },
      listingRepositoryRead: {
        findListingById: async () => listing,
        findListingIdsByMediaAssetId: async () => [],
      } as never,
      listingRepositoryWrite: {
        updateListingById: async () => listing,
      } as never,
      mediaAssetRepositoryRead: {
        findMediaAssetById: async (id: string) =>
          id === photoAsset.id ? (photoAsset as never) : (videoAsset as never),
      },
      objectStorage: {
        getObject: async ({ key }: { key: string }) =>
          key === 'photo-key' || key === 'video-key'
            ? Buffer.from('x'.repeat(64))
            : null,
      } as never,
      verificationCaseRepositoryRead: {
        findOpenCaseByListingId: async () => null,
      } as never,
      verificationCaseRepositoryWrite: {
        updateVerificationCaseById: async () => null,
      } as never,
      analysisProvider: {
        analyze: async (input) => {
          analyzeCalls += 1;
          if (input.video) {
            throw new Error('gemini_http_400');
          }
          return {
            modelId: 'mock-model',
            items: [
              {
                id: 'photo-front-visible',
                status: EAnalysisChecklistItemStatus.PASS,
                weight: 15,
                reason: 'ok',
              },
            ],
          };
        },
      },
      eventPublisher: { publish: async () => undefined },
      analysisEnabled: true,
      maxPhotosToAnalyze: 4,
      maxVideoBytes: 10_000,
    });

    const result = await service.requestAnalysis(
      listing.id,
      EListingAnalysisScope.SUBMIT,
    );

    expect(analyzeCalls).toBe(2);
    expect(result?.status).toBe(EListingAnalysisStatus.COMPLETED);
  });
});

describe('when listing analysis encounters EVIDENCE-purpose assets', () => {
  it('should ignore restricted evidence and not load vault bytes', async () => {
    // TC-28
    const listing = buildListing({
      media: {
        photoUrls: [],
        assetIds: ['evidence-asset-1'],
        videoAssetId: undefined,
      },
    });
    const analyses = new Map<string, unknown>();
    const getObject = jest.fn();
    let photosSeen = -1;

    const service = new ListingAnalysisService({
      listingAnalysisRepositoryRead: {
        findLatestByListingIdAndScope: async () => null,
        findListingAnalysisById: async (id) => analyses.get(id) as never,
        findLatestByListingId: async () => null,
      },
      listingAnalysisRepositoryWrite: {
        createListingAnalysis: async (analysis) => {
          analyses.set(analysis.id, { ...analysis });
          return analysis;
        },
        updateListingAnalysisById: async (id, data) => {
          const current = analyses.get(id) as Record<string, unknown>;
          const updated = { ...current, ...data };
          analyses.set(id, updated);
          return updated as never;
        },
      },
      listingRepositoryRead: {
        findListingById: async () => listing,
        findListingIdsByMediaAssetId: async () => [],
      } as never,
      listingRepositoryWrite: {
        updateListingById: async () => listing,
      } as never,
      mediaAssetRepositoryRead: {
        findMediaAssetById: async () =>
          ({
            id: 'evidence-asset-1',
            ownerId: listing.sellerId,
            purpose: 'EVIDENCE',
            bucketClass: 'RESTRICTED',
            contentType: 'image/jpeg',
            byteSize: 100,
            originalKey: 'restricted/evidence.jpg',
            status: 'READY',
            variants: [],
            createdAt: new Date(),
          }) as never,
      },
      objectStorage: { getObject } as never,
      verificationCaseRepositoryRead: {
        findOpenCaseByListingId: async () => null,
      } as never,
      verificationCaseRepositoryWrite: {
        updateVerificationCaseById: async () => null,
      } as never,
      analysisProvider: {
        analyze: async (input) => {
          photosSeen = input.photos.length;
          return {
            modelId: 'mock',
            items: [
              {
                id: 'photo-front-visible',
                status: EAnalysisChecklistItemStatus.UNCERTAIN,
                weight: 15,
                reason: 'Sem mídia pública.',
              },
            ],
          };
        },
      },
      eventPublisher: { publish: async () => undefined },
      analysisEnabled: true,
      maxPhotosToAnalyze: 4,
      maxVideoBytes: 1024,
    });

    await service.requestAnalysis(listing.id, EListingAnalysisScope.DRAFT);
    expect(photosSeen).toBe(0);
    expect(getObject).not.toHaveBeenCalled();
  });
});

describe('when handleAnalyzedEvent runs', () => {
  it('should write qualityHints on listing', async () => {
    const listing = buildListing();
    let qualityHints: unknown;

    const analysis = {
      id: randomUUID(),
      listingId: listing.id,
      scope: EListingAnalysisScope.DRAFT,
      status: EListingAnalysisStatus.COMPLETED,
      score: 80,
      items: [],
      promptVersion: 'v1',
      idempotencyKey: 'abc',
      createdAt: new Date(),
    };

    const service = new ListingAnalysisService({
      listingAnalysisRepositoryRead: {
        findLatestByListingIdAndScope: async () => null,
        findListingAnalysisById: async () => analysis,
        findLatestByListingId: async () => analysis,
      },
      listingAnalysisRepositoryWrite: {
        createListingAnalysis: async () => analysis,
        updateListingAnalysisById: async () => analysis,
      },
      listingRepositoryRead: {
        findListingById: async () => listing,
      } as never,
      listingRepositoryWrite: {
        updateListingById: async (_id: string, data: Partial<IListing>) => {
          qualityHints = data.qualityHints;
          return listing;
        },
      } as never,
      mediaAssetRepositoryRead: { findMediaAssetById: async () => null },
      objectStorage: { getObject: async () => null } as never,
      verificationCaseRepositoryRead: {
        findOpenCaseByListingId: async () => null,
      } as never,
      verificationCaseRepositoryWrite: {
        updateVerificationCaseById: async () => null,
      } as never,
      analysisProvider: { analyze: async () => ({ items: [], modelId: 'm' }) },
      eventPublisher: { publish: async () => undefined },
      analysisEnabled: true,
      maxPhotosToAnalyze: 4,
      maxVideoBytes: 1024,
    });

    await service.handleAnalyzedEvent(
      createEventEnvelope({
        eventId: randomUUID(),
        eventType: 'ai.listing.analyzed',
        aggregateId: listing.id,
        producerModule: 'ai',
        correlationId: randomUUID(),
        payload: {
          analysisId: analysis.id,
          listingId: listing.id,
          scope: EListingAnalysisScope.DRAFT,
          status: EListingAnalysisStatus.COMPLETED,
          score: 80,
        },
      }),
    );

    expect(qualityHints).toMatchObject({
      analysisId: analysis.id,
      score: 80,
      status: EListingAnalysisStatus.COMPLETED,
    });
  });
});
