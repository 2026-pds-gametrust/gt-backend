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
