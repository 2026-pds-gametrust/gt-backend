import { EUserGroup } from '@sauvvitech/st-packages';
import { Types } from 'mongoose';
import supertest from 'supertest';
import { app } from '../../../../../jest/setup-integration-tests';
import { signTestAccessToken } from '../../../helpers/sign-test-access-token';
import { CategoryModel } from '../../../../infraestructure/db/mongo/models/category.model';
import { UserModel } from '../../../../infraestructure/db/mongo/models/user.model';
import { VerificationCaseModel } from '../../../../infraestructure/db/mongo/models/verification-case.model';
import { ProofCodeAnalysisModel } from '../../../../infraestructure/db/mongo/models/proof-code-analysis.model';
import { validCategoryMock } from '../../../__mocks__/category.mock';
import { validListingMock } from '../../../__mocks__/listing.mock';
import { validProductMock } from '../../../__mocks__/product.mock';
import { validUserMock } from '../../../__mocks__/user.mock';
import { EShippingMode } from '../../../../domain/listings/entity/enums/EShippingMode';
import { EProofCodeAnalysisStatus } from '../../../../domain/ai/entity/enums/EProofCodeAnalysisStatus';
import { EAnalysisChecklistItemStatus } from '../../../../domain/ai/entity/enums/EAnalysisChecklistItemStatus';
import { PROOF_CODE_ANALYSIS_PROMPT_VERSION } from '../../../../domain/ai/analysis/proof-code-analysis-checklist';
import { EVerificationCaseStatus } from '../../../../domain/verification/entity/enums/EVerificationCaseStatus';
import { randomUUID } from 'crypto';

async function seedListingHttp() {
  const user = validUserMock();
  await UserModel.create(user);
  const category = validCategoryMock();
  await CategoryModel.create(category);
  const product = validProductMock({
    categoryId: category.id,
    referencePriceCents: undefined,
  });

  await supertest(app.app)
    .post('/products')
    .set(
      'Authorization',
      `Bearer ${signTestAccessToken({
        actorId: 'backoffice-actor',
        groups: [EUserGroup.BACKOFFICE],
      })}`,
    )
    .send({
      id: product.id,
      categoryId: product.categoryId,
      brand: product.brand,
      model: product.model,
      slug: product.slug,
    });

  const listing = validListingMock({
    sellerId: user.id,
    productId: product.id,
    shipping: { modes: [EShippingMode.PICKUP] },
  });

  const createdListing = await supertest(app.app)
    .post('/listings')
    .set(
      'Authorization',
      `Bearer ${signTestAccessToken({
        actorId: user.id,
        groups: [EUserGroup.APP_USER],
      })}`,
    )
    .send({
      id: listing.id,
      sellerId: listing.sellerId,
      productId: listing.productId,
      title: listing.title,
      condition: listing.condition,
      priceCents: listing.priceCents,
      currency: listing.currency,
      media: listing.media,
      shipping: listing.shipping,
    });
  expect(createdListing.statusCode).toBe(201);

  return { user, listing };
}

async function openCaseWithAnalysis(listingId: string) {
  const caseId = new Types.ObjectId().toHexString();
  const opened = await supertest(app.app).post('/verification-cases').send({
    id: caseId,
    listingId,
  });
  expect(opened.statusCode).toBe(201);

  const analysisId = randomUUID();
  await ProofCodeAnalysisModel.create({
    id: analysisId,
    caseId,
    listingId,
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

  await VerificationCaseModel.updateOne(
    { id: caseId },
    {
      $set: {
        checklist: {
          proofCodeAnalysis: {
            analysisId,
            status: EProofCodeAnalysisStatus.COMPLETED,
            items: [
              {
                id: 'proof-code-present',
                status: EAnalysisChecklistItemStatus.PASS,
                weight: 40,
                reason: 'Código presente no quadro.',
              },
            ],
            promptVersion: PROOF_CODE_ANALYSIS_PROMPT_VERSION,
            analyzedAt: new Date().toISOString(),
          },
        },
      },
    },
  );

  return { caseId, analysisId };
}

describe('when backoffice reads proof-code analysis and plaintext', () => {
  it('should return analysis hints and plaintext on authorized routes only', async () => {
    // TC-17, TC-32
    const { user, listing } = await seedListingHttp();
    const { caseId } = await openCaseWithAnalysis(listing.id);
    const backofficeToken = signTestAccessToken({
      actorId: 'backoffice-actor',
      groups: [EUserGroup.BACKOFFICE],
    });

    const analysis = await supertest(app.app)
      .get(`/verification-cases/${caseId}/proof-code-analysis`)
      .set('Authorization', `Bearer ${backofficeToken}`);
    expect(analysis.statusCode).toBe(200);
    expect(analysis.body.status).toBe(EProofCodeAnalysisStatus.COMPLETED);
    expect(JSON.stringify(analysis.body)).not.toMatch(
      /expectedCode|pepper|proofCodeHash/i,
    );
    expect(analysis.body).not.toHaveProperty('code');

    const proofCode = await supertest(app.app)
      .get(`/verification-cases/${caseId}/proof-code`)
      .set('Authorization', `Bearer ${backofficeToken}`);
    expect(proofCode.statusCode).toBe(200);
    expect(proofCode.body.code).toHaveLength(8);

    const publicListing = await supertest(app.app).get(
      `/listings/${listing.id}`,
    );
    if (publicListing.statusCode === 200) {
      expect(JSON.stringify(publicListing.body)).not.toContain(
        'proofCodeAnalysis',
      );
      expect(publicListing.body).not.toHaveProperty('code');
      expect(JSON.stringify(publicListing.body)).not.toContain(
        proofCode.body.code,
      );
    } else {
      expect([401, 403, 404]).toContain(publicListing.statusCode);
    }

    void user;
  });
});

describe('when seller tries to read another seller proof-code analysis', () => {
  it('should reject with 403', async () => {
    // TC-26
    const { listing } = await seedListingHttp();
    const { caseId } = await openCaseWithAnalysis(listing.id);
    const other = validUserMock();
    await UserModel.create(other);

    const response = await supertest(app.app)
      .get(`/verification-cases/${caseId}/proof-code-analysis`)
      .set(
        'Authorization',
        `Bearer ${signTestAccessToken({
          actorId: other.id,
          groups: [EUserGroup.APP_USER],
        })}`,
      );

    expect(response.statusCode).toBe(403);
    expect(response.body).not.toHaveProperty('items');
  });
});

describe('when seller posts reanalyze on another seller case', () => {
  it('should reject with 403', async () => {
    // TC-26
    const { listing } = await seedListingHttp();
    const { caseId } = await openCaseWithAnalysis(listing.id);
    const other = validUserMock();
    await UserModel.create(other);

    const response = await supertest(app.app)
      .post(`/verification-cases/${caseId}/proof-code-analysis/reanalyze`)
      .set(
        'Authorization',
        `Bearer ${signTestAccessToken({
          actorId: other.id,
          groups: [EUserGroup.APP_USER],
        })}`,
      );

    expect(response.statusCode).toBe(403);
  });
});

describe('when unauthenticated client posts reanalyze', () => {
  it('should return 401', async () => {
    // TC-27
    const { listing } = await seedListingHttp();
    const { caseId } = await openCaseWithAnalysis(listing.id);

    const response = await supertest(app.app).post(
      `/verification-cases/${caseId}/proof-code-analysis/reanalyze`,
    );

    expect(response.statusCode).toBe(401);
  });
});

describe('when APP_USER posts reanalyze', () => {
  it('should return 403 without mutating case status', async () => {
    // TC-27
    const { user, listing } = await seedListingHttp();
    const { caseId } = await openCaseWithAnalysis(listing.id);

    const response = await supertest(app.app)
      .post(`/verification-cases/${caseId}/proof-code-analysis/reanalyze`)
      .set(
        'Authorization',
        `Bearer ${signTestAccessToken({
          actorId: user.id,
          groups: [EUserGroup.APP_USER],
        })}`,
      );

    expect(response.statusCode).toBe(403);
    const stored = await VerificationCaseModel.findOne({ id: caseId }).lean();
    expect(stored?.status).toBe(EVerificationCaseStatus.PENDING);
  });
});

describe('when backoffice posts reanalyze', () => {
  it('should accept with 202 without approving or rejecting the case', async () => {
    // TC-31
    const { listing } = await seedListingHttp();
    const { caseId } = await openCaseWithAnalysis(listing.id);

    const response = await supertest(app.app)
      .post(`/verification-cases/${caseId}/proof-code-analysis/reanalyze`)
      .set(
        'Authorization',
        `Bearer ${signTestAccessToken({
          actorId: 'backoffice-actor',
          groups: [EUserGroup.BACKOFFICE],
        })}`,
      );

    expect(response.statusCode).toBe(202);
    expect(response.body).toMatchObject({
      caseId,
      status: 'PENDING',
    });

    const stored = await VerificationCaseModel.findOne({ id: caseId }).lean();
    expect(stored?.status).toBe(EVerificationCaseStatus.PENDING);
  });
});
