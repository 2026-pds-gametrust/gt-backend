import { CategoryServiceFactory } from '../../../configuration/factory/category.service.factory';
import { ListingServiceFactory } from '../../../configuration/factory/listing.service.factory';
import { ProductServiceFactory } from '../../../configuration/factory/product.service.factory';
import { VerificationCaseServiceFactory } from '../../../configuration/factory/verification-case.service.factory';
import { EvidenceItemServiceFactory } from '../../../configuration/factory/evidence-item.service.factory';
import { attachMinProofEvidence } from '../../helpers/attach-min-proof-evidence';
import { EventPublisherFactory } from '../../../configuration/factory/messaging/event-publisher.factory';
import { EListingStatus } from '../../../domain/listings/entity/enums/EListingStatus';
import { EShippingMode } from '../../../domain/listings/entity/enums/EShippingMode';
import { createEventEnvelope } from '../../../domain/common/messaging/event-envelope';
import { normalizeSynonym } from '../../../domain/common/types/normalize-synonym';
import { CategoryModel } from '../../../infraestructure/db/mongo/models/category.model';
import { SearchDocumentModel } from '../../../infraestructure/db/mongo/models/search-document.model';
import { SynonymModel } from '../../../infraestructure/db/mongo/models/synonym.model';
import { UserModel } from '../../../infraestructure/db/mongo/models/user.model';
import { VerificationCaseModel } from '../../../infraestructure/db/mongo/models/verification-case.model';
import { validCategoryMock } from '../../__mocks__/category.mock';
import { validListingMock } from '../../__mocks__/listing.mock';
import { validProductMock } from '../../__mocks__/product.mock';
import { backofficeActor, sellerActor } from '../../__mocks__/actor.mock';
import { validUserMock } from '../../__mocks__/user.mock';

const listingService = ListingServiceFactory.create();
const productService = ProductServiceFactory.create();
const categoryService = CategoryServiceFactory.create();
const verificationCaseService = VerificationCaseServiceFactory.create();

function evidenceItemService() {
  return EvidenceItemServiceFactory.create();
}

async function seedSellerAndProduct() {
  const user = validUserMock();
  await UserModel.create(user);
  const category = validCategoryMock();
  await CategoryModel.create(category);
  const product = validProductMock({
    categoryId: category.id,
    referencePriceCents: undefined,
  });
  await productService.createProduct(product);
  return { user, product };
}

describe('when listing is published with in-process event dispatch', () => {
  it('should create a search document via domain handlers', async () => {
    const { user, product } = await seedSellerAndProduct();
    const created = await listingService.createListing(
      validListingMock({
        sellerId: user.id,
        productId: product.id,
        title: 'E22 Search GPU Dispatch',
        shipping: { modes: [EShippingMode.PICKUP] },
      }),
      sellerActor(user.id),
    );

    await listingService.submitListing(created.id, sellerActor(user.id));
    await listingService.publishListing(created.id, backofficeActor());

    const doc = await SearchDocumentModel.findOne({ listingId: created.id });
    expect(doc).not.toBeNull();
    expect(doc?.title).toBe('E22 Search GPU Dispatch');
    expect(doc?.status).toBe(EListingStatus.PUBLISHED);
  });
});

describe('when category is created with in-process event dispatch', () => {
  it('should project synonyms via taxonomy handler', async () => {
    const category = validCategoryMock({
      name: 'E22 Synonym Category',
      synonyms: ['  e22 syn term '],
    });

    await categoryService.createCategory(category);

    const byName = await SynonymModel.findOne({
      normalizedTerm: normalizeSynonym(category.name),
    });
    const bySyn = await SynonymModel.findOne({
      normalizedTerm: 'e22 syn term',
    });

    expect(byName).not.toBeNull();
    expect(byName?.targetId).toBe(category.id);
    expect(bySyn).not.toBeNull();
    expect(bySyn?.targetId).toBe(category.id);
  });
});

describe('when listing is submitted with in-process event dispatch', () => {
  it('should open a verification case idempotently', async () => {
    const { user, product } = await seedSellerAndProduct();
    const created = await listingService.createListing(
      validListingMock({
        sellerId: user.id,
        productId: product.id,
        shipping: { modes: [EShippingMode.PICKUP] },
      }),
      sellerActor(user.id),
    );

    await listingService.submitListing(created.id, sellerActor(user.id));

    const cases = await VerificationCaseModel.find({ listingId: created.id });
    expect(cases.length).toBe(1);

    const router = EventPublisherFactory.getRouter();
    await router.handle(
      createEventEnvelope({
        eventId: 'replay-submit',
        eventType: 'listings.listing.submitted',
        aggregateId: created.id,
        producerModule: 'listings',
        correlationId: 'replay',
        payload: { listingId: created.id, toStatus: EListingStatus.SUBMITTED },
      }),
    );

    const afterReplay = await VerificationCaseModel.find({
      listingId: created.id,
    });
    expect(afterReplay.length).toBe(1);
  });
});

describe('when verification case is approved with in-process event dispatch', () => {
  it('should publish a SUBMITTED listing as PUBLISHED', async () => {
    const { user, product } = await seedSellerAndProduct();
    const created = await listingService.createListing(
      validListingMock({
        sellerId: user.id,
        productId: product.id,
        shipping: { modes: [EShippingMode.PICKUP] },
      }),
      sellerActor(user.id),
    );

    await listingService.submitListing(created.id, sellerActor(user.id));

    const openCase = await VerificationCaseModel.findOne({
      listingId: created.id,
    });
    expect(openCase).not.toBeNull();

    await attachMinProofEvidence(evidenceItemService(), openCase!.id, user.id);
    await verificationCaseService.assignReviewer(openCase!.id, {
      moderatorId: 'mod-e23',
    });
    await verificationCaseService.approveCase(openCase!.id);

    const published = await listingService.getListingById(created.id);
    expect(published.status).toBe(EListingStatus.PUBLISHED);
  });

  it('should no-op when listing is already PUBLISHED', async () => {
    const { user, product } = await seedSellerAndProduct();
    const created = await listingService.createListing(
      validListingMock({
        sellerId: user.id,
        productId: product.id,
        shipping: { modes: [EShippingMode.PICKUP] },
      }),
      sellerActor(user.id),
    );

    await listingService.submitListing(created.id, sellerActor(user.id));
    const openCase = await VerificationCaseModel.findOne({
      listingId: created.id,
    });
    await attachMinProofEvidence(evidenceItemService(), openCase!.id, user.id);
    await verificationCaseService.assignReviewer(openCase!.id, {
      moderatorId: 'mod-e23-idem',
    });
    await verificationCaseService.approveCase(openCase!.id);

    const router = EventPublisherFactory.getRouter();
    await expect(
      router.handle(
        createEventEnvelope({
          eventId: 'replay-approved',
          eventType: 'verification.case.approved',
          aggregateId: openCase!.id,
          producerModule: 'verification',
          correlationId: 'replay-approved',
          payload: {
            caseId: openCase!.id,
            listingId: created.id,
          },
        }),
      ),
    ).resolves.toBeUndefined();

    const listing = await listingService.getListingById(created.id);
    expect(listing.status).toBe(EListingStatus.PUBLISHED);
  });
});
