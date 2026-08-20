import { Types } from 'mongoose';
import { ListingServiceFactory } from '../../../../configuration/factory/listing.service.factory';
import { ProductServiceFactory } from '../../../../configuration/factory/product.service.factory';
import { VerificationCaseServiceFactory } from '../../../../configuration/factory/verification-case.service.factory';
import { EvidenceItemServiceFactory } from '../../../../configuration/factory/evidence-item.service.factory';
import { EAnalysisChecklistItemStatus } from '../../../../domain/ai/entity/enums/EAnalysisChecklistItemStatus';
import { EProofCodeAnalysisStatus } from '../../../../domain/ai/entity/enums/EProofCodeAnalysisStatus';
import { ERequiredChangeTarget } from '../../../../domain/verification/entity/enums/ERequiredChangeTarget';
import { EVerificationCaseStatus } from '../../../../domain/verification/entity/enums/EVerificationCaseStatus';
import { EShippingMode } from '../../../../domain/listings/entity/enums/EShippingMode';
import { CategoryModel } from '../../../../infraestructure/db/mongo/models/category.model';
import { UserModel } from '../../../../infraestructure/db/mongo/models/user.model';
import { VerificationCaseModel } from '../../../../infraestructure/db/mongo/models/verification-case.model';
import { validCategoryMock } from '../../../__mocks__/category.mock';
import { validListingMock } from '../../../__mocks__/listing.mock';
import { validProductMock } from '../../../__mocks__/product.mock';
import { attachMinProofEvidence } from '../../../helpers/attach-min-proof-evidence';
import { sellerActor } from '../../../__mocks__/actor.mock';
import { validUserMock } from '../../../__mocks__/user.mock';

const listingService = ListingServiceFactory.create();
const productService = ProductServiceFactory.create();
const verificationCaseService = VerificationCaseServiceFactory.create();
const evidenceItemService = EvidenceItemServiceFactory.create();

async function seedListing() {
  const user = validUserMock();
  await UserModel.create(user);
  const category = validCategoryMock();
  await CategoryModel.create(category);
  const product = validProductMock({
    categoryId: category.id,
    referencePriceCents: undefined,
  });
  await productService.createProduct(product);
  const listing = await listingService.createListing(
    validListingMock({
      sellerId: user.id,
      productId: product.id,
      shipping: { modes: [EShippingMode.PICKUP] },
    }),
    sellerActor(user.id),
  );
  return { user, listing };
}

async function openInReviewWithProofAi(
  listingId: string,
  sellerId: string,
  itemStatus: EAnalysisChecklistItemStatus,
) {
  const opened = await verificationCaseService.openCase({
    id: new Types.ObjectId().toHexString(),
    listingId,
  });
  await attachMinProofEvidence(evidenceItemService, opened.id, sellerId);
  await verificationCaseService.assignReviewer(opened.id, {
    moderatorId: 'mod-1',
  });

  const plaintext = (
    await verificationCaseService.getProofCodePlaintext(
      sellerActor(sellerId),
      opened.id,
    )
  ).code;

  await VerificationCaseModel.updateOne(
    { id: opened.id },
    {
      $set: {
        checklist: {
          proofCodeAnalysis: {
            analysisId: 'pca-fail-1',
            status: EProofCodeAnalysisStatus.COMPLETED,
            items: [
              {
                id: 'proof-code-present',
                status: itemStatus,
                weight: 40,
                reason: 'Código ausente ou ilegível no quadro.',
              },
            ],
            promptVersion: 'proof-code-v1',
            analyzedAt: new Date().toISOString(),
          },
        },
      },
    },
  );

  return { caseId: opened.id, plaintext };
}

describe('when moderator approves despite FAIL proof AI items', () => {
  it('should approve successfully without AI gate', async () => {
    // TC-18
    const { user, listing } = await seedListing();
    const { caseId } = await openInReviewWithProofAi(
      listing.id,
      user.id,
      EAnalysisChecklistItemStatus.FAIL,
    );

    const approved = await verificationCaseService.approveCase(caseId);
    expect(approved.status).toBe(EVerificationCaseStatus.APPROVED);
  });
});

describe('when moderator rejects despite UNCERTAIN proof AI items', () => {
  it('should reject successfully without AI gate', async () => {
    // TC-18
    const { user, listing } = await seedListing();
    const { caseId } = await openInReviewWithProofAi(
      listing.id,
      user.id,
      EAnalysisChecklistItemStatus.UNCERTAIN,
    );

    const rejected = await verificationCaseService.rejectCase(caseId, {
      reason: 'Evidência insuficiente para posse',
    });
    expect(rejected.status).toBe(EVerificationCaseStatus.REJECTED);
  });
});

describe('when moderator requests changes about code visibility', () => {
  it('should store actionable pt-BR reason without plaintext', async () => {
    // TC-19
    const { user, listing } = await seedListing();
    const { caseId, plaintext } = await openInReviewWithProofAi(
      listing.id,
      user.id,
      EAnalysisChecklistItemStatus.FAIL,
    );

    const reason =
      'Reenvie evidência com o código de posse legível e inteiro no quadro.';
    const updated = await verificationCaseService.requestChangesCase(caseId, {
      summary: reason,
      requiredChanges: [
        {
          target: ERequiredChangeTarget.DESCRIPTION,
          reason,
        },
      ],
    });

    expect(updated.status).toBe(EVerificationCaseStatus.CHANGES_REQUESTED);
    expect(updated.requiredChanges?.[0]?.reason).toContain('código');
    expect(JSON.stringify(updated)).not.toContain(plaintext);
  });
});

describe('when possession analysis is UNAVAILABLE on an eligible case', () => {
  it('should still allow assign and human decision flows', async () => {
    // TC-21
    const { user, listing } = await seedListing();
    const opened = await verificationCaseService.openCase({
      id: new Types.ObjectId().toHexString(),
      listingId: listing.id,
    });
    await attachMinProofEvidence(evidenceItemService, opened.id, user.id);

    await VerificationCaseModel.updateOne(
      { id: opened.id },
      {
        $set: {
          checklist: {
            proofCodeAnalysis: {
              analysisId: 'pca-unavail',
              status: EProofCodeAnalysisStatus.UNAVAILABLE,
              items: [],
              promptVersion: 'proof-code-v1',
              analyzedAt: new Date().toISOString(),
            },
          },
        },
      },
    );

    const assigned = await verificationCaseService.assignReviewer(opened.id, {
      moderatorId: 'mod-unavail',
    });
    expect(assigned.status).toBe(EVerificationCaseStatus.IN_REVIEW);

    const approved = await verificationCaseService.approveCase(opened.id);
    expect(approved.status).toBe(EVerificationCaseStatus.APPROVED);
  });
});
