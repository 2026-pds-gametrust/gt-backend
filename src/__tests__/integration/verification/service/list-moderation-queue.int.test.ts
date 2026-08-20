import { Types } from 'mongoose';
import { ListingServiceFactory } from '../../../../configuration/factory/listing.service.factory';
import { ProductServiceFactory } from '../../../../configuration/factory/product.service.factory';
import { VerificationCaseServiceFactory } from '../../../../configuration/factory/verification-case.service.factory';
import { VerificationCaseRepositoryWrite } from '../../../../infraestructure/repository/verification/verification-case.repository.write';
import { EVerificationCaseStatus } from '../../../../domain/verification/entity/enums/EVerificationCaseStatus';
import { EShippingMode } from '../../../../domain/listings/entity/enums/EShippingMode';
import { CategoryModel } from '../../../../infraestructure/db/mongo/models/category.model';
import { UserModel } from '../../../../infraestructure/db/mongo/models/user.model';
import { ProfileModel } from '../../../../infraestructure/db/mongo/models/profile.model';
import { validCategoryMock } from '../../../__mocks__/category.mock';
import { validListingMock } from '../../../__mocks__/listing.mock';
import { validProductMock } from '../../../__mocks__/product.mock';
import { sellerActor } from '../../../__mocks__/actor.mock';
import { validUserMock } from '../../../__mocks__/user.mock';
import { validProfileMock } from '../../../__mocks__/profile.mock';

const listingService = ListingServiceFactory.create();
const productService = ProductServiceFactory.create();
const verificationCaseService = VerificationCaseServiceFactory.create();
const verificationCaseRepositoryWrite = new VerificationCaseRepositoryWrite();

async function seedListing(params?: { title?: string; fullName?: string }) {
  const user = validUserMock({
    fullName: params?.fullName ?? 'Carlos Vendedor',
  });
  await UserModel.create(user);
  await ProfileModel.create(
    validProfileMock({
      userId: user.id,
      displayName: 'Carlos GT',
    }),
  );
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
      title: params?.title ?? 'RTX 4090 seminovo',
      shipping: { modes: [EShippingMode.PICKUP] },
      media: {
        photoUrls: ['https://cdn.example.com/photo.jpg'],
        coverPhotoUrl: 'https://cdn.example.com/photo.jpg',
        videoUrl: 'https://cdn.example.com/video.mp4',
      },
    }),
    sellerActor(user.id),
  );
  return { user, product, listing };
}

describe('when we list the moderation queue', () => {
  it('should filter by status and enrich listing and seller data', async () => {
    const { listing } = await seedListing({ title: 'Placa RTX moderacao' });
    const opened = await verificationCaseService.openCase({
      id: new Types.ObjectId().toHexString(),
      listingId: listing.id,
    });

    const page = await verificationCaseService.listModerationQueue({
      status: EVerificationCaseStatus.PENDING,
      q: 'Placa RTX',
    });

    expect(page.total).toBeGreaterThanOrEqual(1);
    expect(page.items.some((item) => item.id === opened.id)).toBe(true);
    const match = page.items.find((item) => item.id === opened.id);
    expect(match?.listingTitle).toBe('Placa RTX moderacao');
    expect(match?.sellerDisplayName).toBe('Carlos GT');
    expect(match?.listingCoverPhotoUrl).toBe('https://cdn.example.com/photo.jpg');
    expect(page.stats.pending).toBeGreaterThanOrEqual(1);
  });

  it('should return empty items when search does not match', async () => {
    await seedListing();
    const page = await verificationCaseService.listModerationQueue({
      q: 'termo-que-nao-existe-xyz',
    });
    expect(page.items).toEqual([]);
    expect(page.total).toBe(0);
  });

  it('should expose aiAnalysisScore and filter by score range', async () => {
    const { listing: lowListing } = await seedListing({ title: 'Score baixo GPU' });
    const { listing: highListing } = await seedListing({ title: 'Score alto GPU' });

    const lowCase = await verificationCaseService.openCase({
      id: new Types.ObjectId().toHexString(),
      listingId: lowListing.id,
    });
    const highCase = await verificationCaseService.openCase({
      id: new Types.ObjectId().toHexString(),
      listingId: highListing.id,
    });

    await verificationCaseRepositoryWrite.updateVerificationCaseById(lowCase.id, {
      checklist: {
        aiAnalysis: {
          analysisId: 'analysis-low',
          score: 25,
          items: [],
          promptVersion: 'v1',
          analyzedAt: new Date().toISOString(),
        },
      },
    });
    await verificationCaseRepositoryWrite.updateVerificationCaseById(highCase.id, {
      checklist: {
        aiAnalysis: {
          analysisId: 'analysis-high',
          score: 85,
          items: [],
          promptVersion: 'v1',
          analyzedAt: new Date().toISOString(),
        },
      },
    });

    const lowPage = await verificationCaseService.listModerationQueue({
      minScore: 0,
      maxScore: 40,
      q: 'Score baixo',
    });
    expect(lowPage.items.some((item) => item.id === lowCase.id)).toBe(true);
    expect(lowPage.items.some((item) => item.id === highCase.id)).toBe(false);
    const lowMatch = lowPage.items.find((item) => item.id === lowCase.id);
    expect(lowMatch?.aiAnalysisScore).toBe(25);

    const highPage = await verificationCaseService.listModerationQueue({
      minScore: 71,
      maxScore: 100,
      q: 'Score alto',
    });
    expect(highPage.items.some((item) => item.id === highCase.id)).toBe(true);
    expect(highPage.items.find((item) => item.id === highCase.id)?.aiAnalysisScore).toBe(85);
  });

  it('should paginate filtered results with limit and offset', async () => {
    for (let index = 0; index < 3; index += 1) {
      const { listing } = await seedListing({ title: `Paginacao GPU ${index}` });
      const opened = await verificationCaseService.openCase({
        id: new Types.ObjectId().toHexString(),
        listingId: listing.id,
      });
      await verificationCaseRepositoryWrite.updateVerificationCaseById(opened.id, {
        checklist: {
          aiAnalysis: {
            analysisId: `analysis-${index}`,
            score: 10 + index,
            items: [],
            promptVersion: 'v1',
            analyzedAt: new Date().toISOString(),
          },
        },
      });
    }

    const firstPage = await verificationCaseService.listModerationQueue({
      q: 'Paginacao GPU',
      minScore: 0,
      maxScore: 100,
      limit: 2,
      offset: 0,
    });
    const secondPage = await verificationCaseService.listModerationQueue({
      q: 'Paginacao GPU',
      minScore: 0,
      maxScore: 100,
      limit: 2,
      offset: 2,
    });

    expect(firstPage.total).toBeGreaterThanOrEqual(3);
    expect(firstPage.items).toHaveLength(2);
    expect(firstPage.limit).toBe(2);
    expect(firstPage.offset).toBe(0);
    expect(secondPage.items.length).toBeGreaterThanOrEqual(1);
    expect(secondPage.offset).toBe(2);

    const firstIds = new Set(firstPage.items.map((item) => item.id));
    for (const item of secondPage.items) {
      expect(firstIds.has(item.id)).toBe(false);
    }
  });
});
