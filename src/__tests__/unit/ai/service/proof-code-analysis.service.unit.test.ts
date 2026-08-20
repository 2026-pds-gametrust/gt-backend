import { randomUUID } from 'crypto';
import { EAnalysisChecklistItemStatus } from '../../../../domain/ai/entity/enums/EAnalysisChecklistItemStatus';
import { EProofCodeAnalysisStatus } from '../../../../domain/ai/entity/enums/EProofCodeAnalysisStatus';
import { IProofCodeAnalysisProvider } from '../../../../domain/ai/provider/proof-code-analysis.provider.interface';
import { ProofCodeAnalysisService } from '../../../../domain/ai/service/proof-code-analysis.service';
import { PROOF_CODE_ANALYSIS_CHECKLIST } from '../../../../domain/ai/analysis/proof-code-analysis-checklist';
import { EEvidenceType } from '../../../../domain/verification/entity/enums/EEvidenceType';
import { EVerificationCaseStatus } from '../../../../domain/verification/entity/enums/EVerificationCaseStatus';
import { IVerificationCase } from '../../../../domain/verification/entity/interfaces/verification-case.interface';
import { IEvidenceItem } from '../../../../domain/verification/entity/interfaces/evidence-item.interface';
import { EMediaAssetStatus } from '../../../../domain/media/entity/enums/EMediaAssetStatus';
import { EMediaBucketClass } from '../../../../domain/media/entity/enums/EMediaBucketClass';
import { EMediaPurpose } from '../../../../domain/media/entity/enums/EMediaPurpose';
import { IMediaAsset } from '../../../../domain/media/entity/interfaces/media-asset.interface';

function buildCase(override?: Partial<IVerificationCase>): IVerificationCase {
  return {
    id: randomUUID(),
    listingId: randomUUID(),
    status: EVerificationCaseStatus.PENDING,
    proofCodeHash: 'a'.repeat(64),
    proofCodeIssuedAt: new Date(),
    checklist: {
      aiAnalysis: {
        analysisId: 'listing-ai-1',
        score: 80,
        items: [],
        promptVersion: 'v1',
        analyzedAt: new Date().toISOString(),
      },
    },
    createdAt: new Date(),
    ...override,
  };
}

function buildEvidence(
  caseId: string,
  override?: Partial<IEvidenceItem>,
): IEvidenceItem {
  return {
    id: randomUUID(),
    caseId,
    type: EEvidenceType.PHOTO,
    storageKey: 'evidence/photo.jpg',
    assetId: 'asset-evidence-1',
    contentHash: 'hash-1',
    createdAt: new Date(),
    ...override,
  };
}

function buildEvidenceAsset(override?: Partial<IMediaAsset>): IMediaAsset {
  return {
    id: 'asset-evidence-1',
    ownerId: 'case-1',
    purpose: EMediaPurpose.EVIDENCE,
    bucketClass: EMediaBucketClass.RESTRICTED,
    contentType: 'image/jpeg',
    byteSize: 100,
    originalKey: 'evidence/photo.jpg',
    status: EMediaAssetStatus.READY,
    variants: [],
    createdAt: new Date(),
    ...override,
  };
}

describe('when ProofCodeAnalysisService.requestAnalysis runs', () => {
  it('should persist COMPLETED items without plaintext and preserve aiAnalysis', async () => {
    const verificationCase = buildCase();
    const evidence = buildEvidence(verificationCase.id);
    const analyses = new Map<string, unknown>();
    let patchedChecklist: Record<string, unknown> | undefined;
    const published: Array<Record<string, unknown>> = [];

    const provider: IProofCodeAnalysisProvider = {
      analyze: async (input) => {
        expect(input).not.toHaveProperty('expectedCode');
        expect(JSON.stringify(input)).not.toMatch(/plaintext|pepper|hash/i);
        return {
          modelId: 'mock-model',
          items: PROOF_CODE_ANALYSIS_CHECKLIST.map((def) => ({
            id: def.id,
            status: EAnalysisChecklistItemStatus.PASS,
            weight: def.weight,
            reason: 'Código visível e legível no quadro.',
          })),
        };
      },
    };

    const service = new ProofCodeAnalysisService({
      proofCodeAnalysisRepositoryRead: {
        findProofCodeAnalysisById: async (id) =>
          (analyses.get(id) as never) ?? null,
        findLatestByCaseId: async () => null,
      },
      proofCodeAnalysisRepositoryWrite: {
        createProofCodeAnalysis: async (analysis) => {
          analyses.set(analysis.id, { ...analysis });
          return analysis;
        },
        updateProofCodeAnalysisById: async (id, data) => {
          const current = analyses.get(id) as Record<string, unknown>;
          const updated = { ...current, ...data };
          analyses.set(id, updated);
          return updated as never;
        },
      },
      verificationCaseRepositoryRead: {
        findVerificationCaseById: async () => verificationCase,
      } as never,
      verificationCaseRepositoryWrite: {
        updateVerificationCaseById: async (
          _id: string,
          data: Partial<IVerificationCase>,
        ) => {
          patchedChecklist = data.checklist as Record<string, unknown>;
          return {
            ...verificationCase,
            checklist: data.checklist as Record<string, unknown>,
          };
        },
        setChecklistProofCodeAnalysis: async (
          _id: string,
          proofCodeAnalysis: NonNullable<IVerificationCase['checklist']>['proofCodeAnalysis'],
        ) => {
          patchedChecklist = {
            ...(verificationCase.checklist as Record<string, unknown>),
            proofCodeAnalysis,
          };
          return {
            ...verificationCase,
            checklist: patchedChecklist,
          };
        },
      } as never,
      evidenceItemRepositoryRead: {
        listByCaseId: async () => [evidence],
      } as never,
      listingRepositoryRead: {
        findListingById: async () => null,
      } as never,
      mediaAssetRepositoryRead: {
        findMediaAssetById: async () => buildEvidenceAsset(),
      },
      objectStorage: {
        getObject: async () => Buffer.from('fake-bytes'),
      } as never,
      analysisProvider: provider,
      eventPublisher: {
        publish: async (envelope) => {
          published.push(envelope.payload as Record<string, unknown>);
        },
      },
      analysisEnabled: true,
      maxPhotosToAnalyze: 4,
      maxVideoBytes: 1024,
    });

    const result = await service.requestAnalysis(verificationCase.id);

    expect(result?.status).toBe(EProofCodeAnalysisStatus.COMPLETED);
    expect(result?.items).toHaveLength(3);
    expect(result?.items.map((item) => item.id)).toEqual([
      'proof-code-present',
      'proof-code-legible',
      'proof-code-in-frame',
    ]);
    expect(patchedChecklist?.aiAnalysis).toEqual(
      verificationCase.checklist?.aiAnalysis,
    );
    expect(patchedChecklist?.proofCodeAnalysis).toMatchObject({
      analysisId: result?.id,
      status: EProofCodeAnalysisStatus.COMPLETED,
    });
    expect(published[0]).toMatchObject({
      caseId: verificationCase.id,
      analysisId: result?.id,
      status: EProofCodeAnalysisStatus.COMPLETED,
    });
    expect(JSON.stringify(published[0])).not.toMatch(/a{64}/);
  });

  it('should mark UNAVAILABLE when provider fails without throwing', async () => {
    const verificationCase = buildCase({ checklist: {} });
    const evidence = buildEvidence(verificationCase.id);
    const analyses = new Map<string, unknown>();

    const service = new ProofCodeAnalysisService({
      proofCodeAnalysisRepositoryRead: {
        findProofCodeAnalysisById: async (id) =>
          (analyses.get(id) as never) ?? null,
        findLatestByCaseId: async () => null,
      },
      proofCodeAnalysisRepositoryWrite: {
        createProofCodeAnalysis: async (analysis) => {
          analyses.set(analysis.id, { ...analysis });
          return analysis;
        },
        updateProofCodeAnalysisById: async (id, data) => {
          const current = analyses.get(id) as Record<string, unknown>;
          const updated = { ...current, ...data };
          analyses.set(id, updated);
          return updated as never;
        },
      },
      verificationCaseRepositoryRead: {
        findVerificationCaseById: async () => verificationCase,
      } as never,
      verificationCaseRepositoryWrite: {
        updateVerificationCaseById: async () => verificationCase,
        setChecklistProofCodeAnalysis: async (
          _id: string,
          proofCodeAnalysis: NonNullable<IVerificationCase['checklist']>['proofCodeAnalysis'],
        ) => ({
          ...verificationCase,
          checklist: {
            ...(verificationCase.checklist ?? {}),
            proofCodeAnalysis,
          },
        }),
      } as never,
      evidenceItemRepositoryRead: {
        listByCaseId: async () => [evidence],
      } as never,
      listingRepositoryRead: { findListingById: async () => null } as never,
      mediaAssetRepositoryRead: {
        findMediaAssetById: async () => buildEvidenceAsset(),
      },
      objectStorage: {
        getObject: async () => Buffer.from('fake'),
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

    const result = await service.requestAnalysis(verificationCase.id);
    expect(result?.status).toBe(EProofCodeAnalysisStatus.UNAVAILABLE);
  });

  it('should no-op when feature flag is disabled', async () => {
    const provider = { analyze: jest.fn() };
    const service = new ProofCodeAnalysisService({
      proofCodeAnalysisRepositoryRead: {
        findProofCodeAnalysisById: async () => null,
        findLatestByCaseId: async () => null,
      },
      proofCodeAnalysisRepositoryWrite: {
        createProofCodeAnalysis: async (a) => a,
        updateProofCodeAnalysisById: async () => null,
      },
      verificationCaseRepositoryRead: {
        findVerificationCaseById: async () => buildCase(),
      } as never,
      verificationCaseRepositoryWrite: {
        updateVerificationCaseById: async () => null,
        setChecklistProofCodeAnalysis: async () => null,
      } as never,
      evidenceItemRepositoryRead: {
        listByCaseId: async () => [],
      } as never,
      listingRepositoryRead: { findListingById: async () => null } as never,
      mediaAssetRepositoryRead: { findMediaAssetById: async () => null },
      objectStorage: { getObject: async () => null } as never,
      analysisProvider: provider as never,
      eventPublisher: { publish: async () => undefined },
      analysisEnabled: false,
      maxPhotosToAnalyze: 4,
      maxVideoBytes: 1024,
    });

    const result = await service.requestAnalysis(randomUUID());
    expect(result).toBeNull();
    expect(provider.analyze).not.toHaveBeenCalled();
  });

  it('should ignore LISTING-purpose assets as analysis source', async () => {
    const verificationCase = buildCase({ checklist: {} });
    const evidence = buildEvidence(verificationCase.id);
    const analyses = new Map<string, unknown>();
    let photosSeen = 0;

    const service = new ProofCodeAnalysisService({
      proofCodeAnalysisRepositoryRead: {
        findProofCodeAnalysisById: async (id) =>
          (analyses.get(id) as never) ?? null,
        findLatestByCaseId: async () => null,
      },
      proofCodeAnalysisRepositoryWrite: {
        createProofCodeAnalysis: async (analysis) => {
          analyses.set(analysis.id, { ...analysis });
          return analysis;
        },
        updateProofCodeAnalysisById: async (id, data) => {
          const current = analyses.get(id) as Record<string, unknown>;
          const updated = { ...current, ...data };
          analyses.set(id, updated);
          return updated as never;
        },
      },
      verificationCaseRepositoryRead: {
        findVerificationCaseById: async () => verificationCase,
      } as never,
      verificationCaseRepositoryWrite: {
        updateVerificationCaseById: async () => verificationCase,
        setChecklistProofCodeAnalysis: async (
          _id: string,
          proofCodeAnalysis: NonNullable<IVerificationCase['checklist']>['proofCodeAnalysis'],
        ) => ({
          ...verificationCase,
          checklist: {
            ...(verificationCase.checklist ?? {}),
            proofCodeAnalysis,
          },
        }),
      } as never,
      evidenceItemRepositoryRead: {
        listByCaseId: async () => [evidence],
      } as never,
      listingRepositoryRead: { findListingById: async () => null } as never,
      mediaAssetRepositoryRead: {
        findMediaAssetById: async () =>
          buildEvidenceAsset({ purpose: EMediaPurpose.LISTING }),
      },
      objectStorage: {
        getObject: async () => Buffer.from('should-not-load'),
      } as never,
      analysisProvider: {
        analyze: async (input) => {
          photosSeen = input.photos.length;
          return {
            modelId: 'mock',
            items: PROOF_CODE_ANALYSIS_CHECKLIST.map((def) => ({
              id: def.id,
              status: EAnalysisChecklistItemStatus.UNCERTAIN,
              weight: def.weight,
              reason: 'Sem evidência analisável.',
            })),
          };
        },
      },
      eventPublisher: { publish: async () => undefined },
      analysisEnabled: true,
      maxPhotosToAnalyze: 4,
      maxVideoBytes: 1024,
    });

    await service.requestAnalysis(verificationCase.id);
    expect(photosSeen).toBe(0);
  });
});

describe('when requestAnalysis completes with mixed checklist statuses', () => {
  it('should expose PASS FAIL UNCERTAIN items with non-empty pt-BR reasons', async () => {
    // TC-01, TC-09
    const verificationCase = buildCase({ checklist: {} });
    const evidence = buildEvidence(verificationCase.id);
    const analyses = new Map<string, unknown>();
    const statuses = [
      EAnalysisChecklistItemStatus.PASS,
      EAnalysisChecklistItemStatus.FAIL,
      EAnalysisChecklistItemStatus.UNCERTAIN,
    ];

    const service = new ProofCodeAnalysisService({
      proofCodeAnalysisRepositoryRead: {
        findProofCodeAnalysisById: async (id) =>
          (analyses.get(id) as never) ?? null,
        findLatestByCaseId: async () => null,
      },
      proofCodeAnalysisRepositoryWrite: {
        createProofCodeAnalysis: async (analysis) => {
          analyses.set(analysis.id, { ...analysis });
          return analysis;
        },
        updateProofCodeAnalysisById: async (id, data) => {
          const current = analyses.get(id) as Record<string, unknown>;
          const updated = { ...current, ...data };
          analyses.set(id, updated);
          return updated as never;
        },
      },
      verificationCaseRepositoryRead: {
        findVerificationCaseById: async () => verificationCase,
      } as never,
      verificationCaseRepositoryWrite: {
        updateVerificationCaseById: async () => verificationCase,
        setChecklistProofCodeAnalysis: async (
          _id: string,
          proofCodeAnalysis: NonNullable<IVerificationCase['checklist']>['proofCodeAnalysis'],
        ) => ({
          ...verificationCase,
          checklist: {
            ...(verificationCase.checklist ?? {}),
            proofCodeAnalysis,
          },
        }),
      } as never,
      evidenceItemRepositoryRead: {
        listByCaseId: async () => [evidence],
      } as never,
      listingRepositoryRead: { findListingById: async () => null } as never,
      mediaAssetRepositoryRead: {
        findMediaAssetById: async () => buildEvidenceAsset(),
      },
      objectStorage: {
        getObject: async () => Buffer.from('fake'),
      } as never,
      analysisProvider: {
        analyze: async () => ({
          modelId: 'mock',
          items: PROOF_CODE_ANALYSIS_CHECKLIST.map((def, index) => ({
            id: def.id,
            status: statuses[index],
            weight: def.weight,
            reason:
              index === 0
                ? 'Código presente no quadro.'
                : index === 1
                  ? 'Código ilegível por desfoque.'
                  : 'Incerto se o código está inteiro no frame.',
          })),
        }),
      },
      eventPublisher: { publish: async () => undefined },
      analysisEnabled: true,
      maxPhotosToAnalyze: 4,
      maxVideoBytes: 1024,
    });

    const result = await service.requestAnalysis(verificationCase.id);
    expect(result?.status).toBe(EProofCodeAnalysisStatus.COMPLETED);
    expect(result?.items).toHaveLength(3);
    for (const item of result!.items) {
      expect(['PASS', 'FAIL', 'UNCERTAIN']).toContain(item.status);
      expect(item.reason.length).toBeGreaterThan(5);
      expect(JSON.stringify(item)).not.toMatch(/expectedCode|ocrMatch|matchGate/i);
    }
  });
});

describe('when requestAnalysis runs against a stable case', () => {
  it('should leave case status unchanged and never call seal collaborators', async () => {
    // TC-05
    const verificationCase = buildCase({
      status: EVerificationCaseStatus.IN_REVIEW,
      checklist: {},
    });
    const evidence = buildEvidence(verificationCase.id);
    const analyses = new Map<string, unknown>();
    let writtenStatus: EVerificationCaseStatus | undefined;
    const sealSpy = jest.fn();

    const service = new ProofCodeAnalysisService({
      proofCodeAnalysisRepositoryRead: {
        findProofCodeAnalysisById: async (id) =>
          (analyses.get(id) as never) ?? null,
        findLatestByCaseId: async () => null,
      },
      proofCodeAnalysisRepositoryWrite: {
        createProofCodeAnalysis: async (analysis) => {
          analyses.set(analysis.id, { ...analysis });
          return analysis;
        },
        updateProofCodeAnalysisById: async (id, data) => {
          const current = analyses.get(id) as Record<string, unknown>;
          const updated = { ...current, ...data };
          analyses.set(id, updated);
          return updated as never;
        },
      },
      verificationCaseRepositoryRead: {
        findVerificationCaseById: async () => verificationCase,
      } as never,
      verificationCaseRepositoryWrite: {
        updateVerificationCaseById: async (
          _id: string,
          data: Partial<IVerificationCase>,
        ) => {
          writtenStatus = data.status;
          return {
            ...verificationCase,
            checklist: data.checklist as Record<string, unknown>,
          };
        },
        setChecklistProofCodeAnalysis: async (
          _id: string,
          proofCodeAnalysis: NonNullable<
            IVerificationCase['checklist']
          >['proofCodeAnalysis'],
        ) => ({
          ...verificationCase,
          checklist: {
            ...(verificationCase.checklist ?? {}),
            proofCodeAnalysis,
          },
        }),
      } as never,
      evidenceItemRepositoryRead: {
        listByCaseId: async () => [evidence],
      } as never,
      listingRepositoryRead: { findListingById: async () => null } as never,
      mediaAssetRepositoryRead: {
        findMediaAssetById: async () => buildEvidenceAsset(),
      },
      objectStorage: {
        getObject: async () => Buffer.from('fake'),
      } as never,
      analysisProvider: {
        analyze: async () => ({
          modelId: 'mock',
          items: PROOF_CODE_ANALYSIS_CHECKLIST.map((def) => ({
            id: def.id,
            status: EAnalysisChecklistItemStatus.FAIL,
            weight: def.weight,
            reason: 'Código ausente no quadro.',
          })),
        }),
      },
      eventPublisher: { publish: async () => undefined },
      analysisEnabled: true,
      maxPhotosToAnalyze: 4,
      maxVideoBytes: 1024,
    });

    const before = verificationCase.status;
    await service.requestAnalysis(verificationCase.id);
    expect(writtenStatus).toBeUndefined();
    expect(verificationCase.status).toBe(before);
    expect(sealSpy).not.toHaveBeenCalled();
  });
});

describe('when COMPLETED analysis already exists for the same idempotency key', () => {
  it('should return the existing analysis without calling the provider again', async () => {
    // TC-11
    const verificationCase = buildCase({ checklist: {} });
    const evidence = buildEvidence(verificationCase.id);
    const analyses = new Map<string, unknown>();
    let latest: { id: string; idempotencyKey: string; status: string } | null =
      null;
    const analyze = jest.fn().mockResolvedValue({
      modelId: 'mock',
      items: PROOF_CODE_ANALYSIS_CHECKLIST.map((def) => ({
        id: def.id,
        status: EAnalysisChecklistItemStatus.PASS,
        weight: def.weight,
        reason: 'Código visível.',
      })),
    });

    const service = new ProofCodeAnalysisService({
      proofCodeAnalysisRepositoryRead: {
        findProofCodeAnalysisById: async (id) =>
          (analyses.get(id) as never) ?? null,
        findLatestByCaseId: async () => latest as never,
      },
      proofCodeAnalysisRepositoryWrite: {
        createProofCodeAnalysis: async (analysis) => {
          analyses.set(analysis.id, { ...analysis });
          latest = analysis as never;
          return analysis;
        },
        updateProofCodeAnalysisById: async (id, data) => {
          const current = analyses.get(id) as Record<string, unknown>;
          const updated = { ...current, ...data };
          analyses.set(id, updated);
          latest = updated as never;
          return updated as never;
        },
      },
      verificationCaseRepositoryRead: {
        findVerificationCaseById: async () => verificationCase,
      } as never,
      verificationCaseRepositoryWrite: {
        updateVerificationCaseById: async () => verificationCase,
        setChecklistProofCodeAnalysis: async (
          _id: string,
          proofCodeAnalysis: NonNullable<IVerificationCase['checklist']>['proofCodeAnalysis'],
        ) => ({
          ...verificationCase,
          checklist: {
            ...(verificationCase.checklist ?? {}),
            proofCodeAnalysis,
          },
        }),
      } as never,
      evidenceItemRepositoryRead: {
        listByCaseId: async () => [evidence],
      } as never,
      listingRepositoryRead: { findListingById: async () => null } as never,
      mediaAssetRepositoryRead: {
        findMediaAssetById: async () => buildEvidenceAsset(),
      },
      objectStorage: {
        getObject: async () => Buffer.from('fake'),
      } as never,
      analysisProvider: { analyze },
      eventPublisher: { publish: async () => undefined },
      analysisEnabled: true,
      maxPhotosToAnalyze: 4,
      maxVideoBytes: 1024,
    });

    const first = await service.requestAnalysis(verificationCase.id);
    const second = await service.requestAnalysis(verificationCase.id);
    expect(first?.id).toBe(second?.id);
    expect(analyze).toHaveBeenCalledTimes(1);
  });

  it('should allow a new run when force is true', async () => {
    // TC-11 force path
    const verificationCase = buildCase({ checklist: {} });
    const evidence = buildEvidence(verificationCase.id);
    const analyses = new Map<string, unknown>();
    const analyze = jest.fn().mockResolvedValue({
      modelId: 'mock',
      items: PROOF_CODE_ANALYSIS_CHECKLIST.map((def) => ({
        id: def.id,
        status: EAnalysisChecklistItemStatus.PASS,
        weight: def.weight,
        reason: 'Código visível.',
      })),
    });

    const service = new ProofCodeAnalysisService({
      proofCodeAnalysisRepositoryRead: {
        findProofCodeAnalysisById: async (id) =>
          (analyses.get(id) as never) ?? null,
        findLatestByCaseId: async () => ({
          id: 'old-analysis',
          caseId: verificationCase.id,
          listingId: verificationCase.listingId,
          status: EProofCodeAnalysisStatus.COMPLETED,
          score: 50,
          items: [],
          promptVersion: 'proof-code-v1',
          idempotencyKey: 'any-key',
          createdAt: new Date(),
        }),
      },
      proofCodeAnalysisRepositoryWrite: {
        createProofCodeAnalysis: async (analysis) => {
          analyses.set(analysis.id, { ...analysis });
          return analysis;
        },
        updateProofCodeAnalysisById: async (id, data) => {
          const current = analyses.get(id) as Record<string, unknown>;
          const updated = { ...current, ...data };
          analyses.set(id, updated);
          return updated as never;
        },
      },
      verificationCaseRepositoryRead: {
        findVerificationCaseById: async () => verificationCase,
      } as never,
      verificationCaseRepositoryWrite: {
        updateVerificationCaseById: async () => verificationCase,
        setChecklistProofCodeAnalysis: async (
          _id: string,
          proofCodeAnalysis: NonNullable<IVerificationCase['checklist']>['proofCodeAnalysis'],
        ) => ({
          ...verificationCase,
          checklist: {
            ...(verificationCase.checklist ?? {}),
            proofCodeAnalysis,
          },
        }),
      } as never,
      evidenceItemRepositoryRead: {
        listByCaseId: async () => [evidence],
      } as never,
      listingRepositoryRead: { findListingById: async () => null } as never,
      mediaAssetRepositoryRead: {
        findMediaAssetById: async () => buildEvidenceAsset(),
      },
      objectStorage: {
        getObject: async () => Buffer.from('fake'),
      } as never,
      analysisProvider: { analyze },
      eventPublisher: { publish: async () => undefined },
      analysisEnabled: true,
      maxPhotosToAnalyze: 4,
      maxVideoBytes: 1024,
    });

    const result = await service.requestAnalysis(verificationCase.id, {
      force: true,
    });
    expect(analyze).toHaveBeenCalled();
    expect(result?.id).not.toBe('old-analysis');
    expect(result?.status).toBe(EProofCodeAnalysisStatus.COMPLETED);
  });
});

describe('when requestAnalysis publishes analyzed event with known challenge', () => {
  it('should omit plaintext hash and pepper from provider input and event payload', async () => {
    // TC-08
    const plaintext = 'AB12CD34';
    const verificationCase = buildCase({
      checklist: {},
      proofCodeHash: 'deadbeef'.repeat(8),
    });
    const evidence = buildEvidence(verificationCase.id);
    const analyses = new Map<string, unknown>();
    const published: Array<Record<string, unknown>> = [];
    let providerInput: unknown;

    const service = new ProofCodeAnalysisService({
      proofCodeAnalysisRepositoryRead: {
        findProofCodeAnalysisById: async (id) =>
          (analyses.get(id) as never) ?? null,
        findLatestByCaseId: async () => null,
      },
      proofCodeAnalysisRepositoryWrite: {
        createProofCodeAnalysis: async (analysis) => {
          analyses.set(analysis.id, { ...analysis });
          return analysis;
        },
        updateProofCodeAnalysisById: async (id, data) => {
          const current = analyses.get(id) as Record<string, unknown>;
          const updated = { ...current, ...data };
          analyses.set(id, updated);
          return updated as never;
        },
      },
      verificationCaseRepositoryRead: {
        findVerificationCaseById: async () => verificationCase,
      } as never,
      verificationCaseRepositoryWrite: {
        updateVerificationCaseById: async () => verificationCase,
        setChecklistProofCodeAnalysis: async (
          _id: string,
          proofCodeAnalysis: NonNullable<IVerificationCase['checklist']>['proofCodeAnalysis'],
        ) => ({
          ...verificationCase,
          checklist: {
            ...(verificationCase.checklist ?? {}),
            proofCodeAnalysis,
          },
        }),
      } as never,
      evidenceItemRepositoryRead: {
        listByCaseId: async () => [evidence],
      } as never,
      listingRepositoryRead: { findListingById: async () => null } as never,
      mediaAssetRepositoryRead: {
        findMediaAssetById: async () => buildEvidenceAsset(),
      },
      objectStorage: {
        getObject: async () => Buffer.from('fake'),
      } as never,
      analysisProvider: {
        analyze: async (input) => {
          providerInput = input;
          return {
            modelId: 'mock',
            items: PROOF_CODE_ANALYSIS_CHECKLIST.map((def) => ({
              id: def.id,
              status: EAnalysisChecklistItemStatus.PASS,
              weight: def.weight,
              reason: 'Código legível no quadro.',
            })),
          };
        },
      },
      eventPublisher: {
        publish: async (envelope) => {
          published.push(envelope.payload as Record<string, unknown>);
        },
      },
      analysisEnabled: true,
      maxPhotosToAnalyze: 4,
      maxVideoBytes: 1024,
    });

    await service.requestAnalysis(verificationCase.id);

    const inputJson = JSON.stringify(providerInput);
    expect(inputJson).not.toContain(plaintext);
    expect(providerInput).not.toHaveProperty('expectedCode');
    expect(providerInput).not.toHaveProperty('proofCodeHash');
    expect(providerInput).not.toHaveProperty('pepper');

    const eventJson = JSON.stringify(published[0]);
    expect(eventJson).not.toContain(plaintext);
    expect(published[0]).not.toHaveProperty('proofCodeHash');
    expect(published[0]).toMatchObject({
      caseId: verificationCase.id,
      listingId: verificationCase.listingId,
      status: EProofCodeAnalysisStatus.COMPLETED,
    });
  });
});
