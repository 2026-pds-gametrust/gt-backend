import { randomUUID } from 'crypto';
import { Logger } from 'traceability';
import { EAnalysisChecklistItemStatus } from '../../../../domain/ai/entity/enums/EAnalysisChecklistItemStatus';
import { EProofCodeAnalysisStatus } from '../../../../domain/ai/entity/enums/EProofCodeAnalysisStatus';
import {
  PROOF_CODE_ANALYSIS_CHECKLIST,
  PROOF_CODE_ANALYSIS_PROMPT_VERSION,
} from '../../../../domain/ai/analysis/proof-code-analysis-checklist';
import { IProofCodeAnalysisProvider } from '../../../../domain/ai/provider/proof-code-analysis.provider.interface';
import { ProofCodeAnalysisService } from '../../../../domain/ai/service/proof-code-analysis.service';
import { EEvidenceType } from '../../../../domain/verification/entity/enums/EEvidenceType';
import { EListingStatus } from '../../../../domain/listings/entity/enums/EListingStatus';
import { EVerificationCaseStatus } from '../../../../domain/verification/entity/enums/EVerificationCaseStatus';
import { ProofCodeAnalysisModel } from '../../../../infraestructure/db/mongo/models/proof-code-analysis.model';
import { VerificationCaseModel } from '../../../../infraestructure/db/mongo/models/verification-case.model';
import { EvidenceItemModel } from '../../../../infraestructure/db/mongo/models/evidence-item.model';
import { ListingModel } from '../../../../infraestructure/db/mongo/models/listing.model';
import { ProofCodeAnalysisRepositoryRead } from '../../../../infraestructure/repository/ai/proof-code-analysis.repository.read';
import { ProofCodeAnalysisRepositoryWrite } from '../../../../infraestructure/repository/ai/proof-code-analysis.repository.write';
import { EvidenceItemRepositoryRead } from '../../../../infraestructure/repository/verification/evidence-item.repository.read';
import { ListingRepositoryRead } from '../../../../infraestructure/repository/listings/listing.repository.read';
import { VerificationCaseRepositoryRead } from '../../../../infraestructure/repository/verification/verification-case.repository.read';
import { VerificationCaseRepositoryWrite } from '../../../../infraestructure/repository/verification/verification-case.repository.write';
import { validListingMock } from '../../../__mocks__/listing.mock';

function completedProvider(
  override?: Partial<IProofCodeAnalysisProvider>,
): IProofCodeAnalysisProvider {
  return {
    analyze: async () => ({
      modelId: 'mock-model',
      items: PROOF_CODE_ANALYSIS_CHECKLIST.map((def) => ({
        id: def.id,
        status: EAnalysisChecklistItemStatus.PASS,
        weight: def.weight,
        reason: 'Código visível e legível no quadro.',
      })),
    }),
    ...override,
  };
}

function buildService(params: {
  provider?: IProofCodeAnalysisProvider;
  eventPublisher?: { publish: (envelope: unknown) => Promise<void> };
  analysisEnabled?: boolean;
} = {}) {
  return new ProofCodeAnalysisService({
    proofCodeAnalysisRepositoryRead: new ProofCodeAnalysisRepositoryRead(),
    proofCodeAnalysisRepositoryWrite: new ProofCodeAnalysisRepositoryWrite(),
    verificationCaseRepositoryRead: new VerificationCaseRepositoryRead(),
    verificationCaseRepositoryWrite: new VerificationCaseRepositoryWrite(),
    evidenceItemRepositoryRead: new EvidenceItemRepositoryRead(),
    listingRepositoryRead: new ListingRepositoryRead(),
    mediaAssetRepositoryRead: { findMediaAssetById: async () => null },
    objectStorage: { getObject: async () => null } as never,
    analysisProvider: params.provider ?? completedProvider(),
    eventPublisher: params.eventPublisher ?? {
      publish: async () => undefined,
    },
    analysisEnabled: params.analysisEnabled ?? true,
    maxPhotosToAnalyze: 4,
    maxVideoBytes: 1024,
  });
}

async function seedCaseWithEvidence(opts?: {
  plaintextHash?: string;
  checklist?: Record<string, unknown>;
  status?: EVerificationCaseStatus;
}) {
  const listing = validListingMock({ status: EListingStatus.SUBMITTED });
  await ListingModel.create(listing);

  const caseId = randomUUID();
  await VerificationCaseModel.create({
    id: caseId,
    listingId: listing.id,
    status: opts?.status ?? EVerificationCaseStatus.PENDING,
    proofCodeHash: opts?.plaintextHash ?? 'a'.repeat(64),
    proofCodeIssuedAt: new Date(),
    checklist: opts?.checklist ?? {},
    createdAt: new Date(),
  });

  const evidenceId = randomUUID();
  await EvidenceItemModel.create({
    id: evidenceId,
    caseId,
    type: EEvidenceType.PHOTO,
    storageKey: 'private/evidence/photo.jpg',
    createdAt: new Date(),
  });

  return { listing, caseId, evidenceId };
}

describe('when proof-code analysis is applied to a verification case', () => {
  it('should write only checklist.proofCodeAnalysis and keep aiAnalysis', async () => {
    // TC-04 / TC-15 coexistence
    const listing = validListingMock({ status: EListingStatus.SUBMITTED });
    await ListingModel.create(listing);

    const caseId = randomUUID();
    await VerificationCaseModel.create({
      id: caseId,
      listingId: listing.id,
      status: EVerificationCaseStatus.PENDING,
      checklist: {
        aiAnalysis: {
          analysisId: 'listing-ai',
          score: 70,
          items: [],
          promptVersion: 'v1',
          analyzedAt: new Date().toISOString(),
        },
      },
      createdAt: new Date(),
    });

    const analysisId = randomUUID();
    await ProofCodeAnalysisModel.create({
      id: analysisId,
      caseId,
      listingId: listing.id,
      status: EProofCodeAnalysisStatus.COMPLETED,
      score: 90,
      items: [
        {
          id: 'proof-code-present',
          status: EAnalysisChecklistItemStatus.PASS,
          weight: 40,
          reason: 'Código presente no quadro.',
        },
      ],
      promptVersion: PROOF_CODE_ANALYSIS_PROMPT_VERSION,
      idempotencyKey: randomUUID().slice(0, 32),
      createdAt: new Date(),
    });

    const service = buildService({ analysisEnabled: false });
    await service.applyAnalysisToVerificationCase(caseId, analysisId);

    const updated = await VerificationCaseModel.findOne({ id: caseId });
    expect(updated?.checklist?.aiAnalysis).toMatchObject({
      analysisId: 'listing-ai',
      score: 70,
    });
    expect(updated?.checklist?.proofCodeAnalysis).toMatchObject({
      analysisId,
      status: EProofCodeAnalysisStatus.COMPLETED,
      score: 90,
    });
  });
});

describe('when requestAnalysis completes with a stub provider', () => {
  it('should persist COMPLETED snapshot without mutating case status or seals', async () => {
    // TC-13, TC-16, TC-24, TC-30, TC-32
    const { caseId, listing } = await seedCaseWithEvidence({
      checklist: {
        aiAnalysis: {
          analysisId: 'listing-ai',
          score: 55,
          items: [],
          promptVersion: 'v1',
          analyzedAt: new Date().toISOString(),
        },
      },
    });
    const published: Array<Record<string, unknown>> = [];
    const service = buildService({
      eventPublisher: {
        publish: async (envelope) => {
          published.push(
            (envelope as { payload: Record<string, unknown> }).payload,
          );
        },
      },
    });

    const before = await VerificationCaseModel.findOne({ id: caseId }).lean();
    const result = await service.requestAnalysis(caseId);

    expect(result?.status).toBe(EProofCodeAnalysisStatus.COMPLETED);
    expect(result?.items.length).toBeGreaterThanOrEqual(1);
    for (const item of result!.items) {
      expect(['PASS', 'FAIL', 'UNCERTAIN']).toContain(item.status);
      expect(item.reason.length).toBeGreaterThan(0);
      expect(JSON.stringify(item)).not.toMatch(
        /expectedCode|ocrMatch|matchGate/i,
      );
    }

    const stored = await ProofCodeAnalysisModel.findOne({ id: result!.id }).lean();
    expect(JSON.stringify(stored)).not.toMatch(/expectedCode|pepper|plaintext/i);
    expect(stored).not.toHaveProperty('proofCodePlaintext');
    expect(stored).not.toHaveProperty('proofCodeHash');

    const after = await VerificationCaseModel.findOne({ id: caseId }).lean();
    expect(after?.status).toBe(before?.status);
    expect(after?.checklist?.aiAnalysis).toMatchObject({
      analysisId: 'listing-ai',
      score: 55,
    });
    expect(after?.checklist?.proofCodeAnalysis).toMatchObject({
      analysisId: result?.id,
      status: EProofCodeAnalysisStatus.COMPLETED,
    });
    expect(JSON.stringify(after?.checklist?.proofCodeAnalysis)).not.toContain(
      'a'.repeat(64),
    );

    expect(published[0]).toMatchObject({
      caseId,
      listingId: listing.id,
      analysisId: result?.id,
      status: EProofCodeAnalysisStatus.COMPLETED,
    });
    expect(published[0]).not.toHaveProperty('proofCodeHash');
    expect(Object.keys(published[0]).sort()).toEqual(
      ['analysisId', 'caseId', 'listingId', 'status'].sort(),
    );
  });
});

describe('when possession provider fails while listing aiAnalysis exists', () => {
  it('should persist UNAVAILABLE without clearing aiAnalysis', async () => {
    // TC-15, TC-21
    const { caseId } = await seedCaseWithEvidence({
      checklist: {
        aiAnalysis: {
          analysisId: 'listing-ai-ok',
          score: 80,
          items: [],
          promptVersion: 'v1',
          analyzedAt: new Date().toISOString(),
        },
      },
    });

    const service = buildService({
      provider: {
        analyze: async () => {
          throw new Error('provider_down');
        },
      },
    });

    const result = await service.requestAnalysis(caseId);
    expect(result?.status).toBe(EProofCodeAnalysisStatus.UNAVAILABLE);

    const after = await VerificationCaseModel.findOne({ id: caseId }).lean();
    expect(after?.status).toBe(EVerificationCaseStatus.PENDING);
    expect(after?.checklist?.aiAnalysis).toMatchObject({
      analysisId: 'listing-ai-ok',
      score: 80,
    });
    expect(after?.checklist?.proofCodeAnalysis).toMatchObject({
      status: EProofCodeAnalysisStatus.UNAVAILABLE,
    });
  });
});

describe('when requestAnalysis logs during success and failure', () => {
  it('should never log the proof-code plaintext challenge', async () => {
    // TC-23
    const plaintext = 'ZX9Y8W7V';
    const { caseId } = await seedCaseWithEvidence();
    const infoSpy = jest
      .spyOn(Logger, 'info')
      .mockImplementation((() => Logger) as typeof Logger.info);

    const service = buildService({
      provider: {
        analyze: async () => {
          throw new Error('provider_timeout');
        },
      },
    });

    await service.requestAnalysis(caseId);

    const logged = infoSpy.mock.calls.map((call) => JSON.stringify(call));
    expect(logged.some((line) => line.includes(plaintext))).toBe(false);
    expect(logged.some((line) => line.includes('proofCodeHash'))).toBe(false);
    infoSpy.mockRestore();
  });
});

describe('when new PHOTO evidence changes the idempotency key', () => {
  it('should produce a newer analysisId while leaving case status unchanged', async () => {
    // TC-25
    const { caseId } = await seedCaseWithEvidence();
    const service = buildService();

    const first = await service.requestAnalysis(caseId);
    expect(first?.status).toBe(EProofCodeAnalysisStatus.COMPLETED);

    await EvidenceItemModel.create({
      id: randomUUID(),
      caseId,
      type: EEvidenceType.PHOTO,
      storageKey: 'private/evidence/photo-2.jpg',
      createdAt: new Date(),
    });

    const second = await service.requestAnalysis(caseId);
    expect(second?.id).not.toBe(first?.id);
    expect(second?.status).toBe(EProofCodeAnalysisStatus.COMPLETED);

    const after = await VerificationCaseModel.findOne({ id: caseId }).lean();
    expect(after?.status).toBe(EVerificationCaseStatus.PENDING);
    expect(after?.checklist?.proofCodeAnalysis).toMatchObject({
      analysisId: second?.id,
    });
  });
});

describe('when force reanalyze is requested', () => {
  it('should run a new analysis even when COMPLETED exists for the same key', async () => {
    // TC-11 / TC-31 service force path
    const { caseId } = await seedCaseWithEvidence();
    const analyze = jest.fn().mockResolvedValue({
      modelId: 'mock',
      items: PROOF_CODE_ANALYSIS_CHECKLIST.map((def) => ({
        id: def.id,
        status: EAnalysisChecklistItemStatus.PASS,
        weight: def.weight,
        reason: 'Código ok.',
      })),
    });
    const service = buildService({ provider: { analyze } });

    const first = await service.requestAnalysis(caseId);
    const forced = await service.requestAnalysis(caseId, { force: true });
    expect(analyze).toHaveBeenCalledTimes(2);
    expect(forced?.id).not.toBe(first?.id);

    const after = await VerificationCaseModel.findOne({ id: caseId }).lean();
    expect(after?.status).toBe(EVerificationCaseStatus.PENDING);
  });
});
