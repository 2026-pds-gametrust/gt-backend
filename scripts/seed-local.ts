/**
 * Local-only seed: category, product, published listing, admin user, search index.
 * Requires DATABASE_URI. Admin credentials come from SEED_ADMIN_EMAIL / SEED_ADMIN_PASSWORD.
 *
 * Usage: yarn seed:local
 */
import '../src/configuration/dotenv';
import mongoose from 'mongoose';
import { EUserGroup } from '@sauvvitech/st-packages';
import { buildValidCpf } from '../src/domain/common/types/cpf';
import { systemActorContext } from '../src/domain/common/auth/actor-authorization';
import { ECategoryStatus } from '../src/domain/catalog/entity/enums/ECategoryStatus';
import { EProductStatus } from '../src/domain/catalog/entity/enums/EProductStatus';
import { EListingCondition } from '../src/domain/listings/entity/enums/EListingCondition';
import { EShippingMode } from '../src/domain/listings/entity/enums/EShippingMode';
import { EListingStatus } from '../src/domain/listings/entity/enums/EListingStatus';
import { AuthServiceFactory } from '../src/configuration/factory/auth.service.factory';
import { CategoryServiceFactory } from '../src/configuration/factory/category.service.factory';
import { ProductServiceFactory } from '../src/configuration/factory/product.service.factory';
import { ListingServiceFactory } from '../src/configuration/factory/listing.service.factory';
import { SearchReconciliationServiceFactory } from '../src/configuration/factory/search-reconciliation.service.factory';
import { CategoryRepositoryRead } from '../src/infraestructure/repository/catalog/category.repository.read';
import { ProductRepositoryRead } from '../src/infraestructure/repository/catalog/product.repository.read';
import { ListingRepositoryRead } from '../src/infraestructure/repository/listings/listing.repository.read';
import { UserRepositoryRead } from '../src/infraestructure/repository/identity/user.repository.read';
import { UserRepositoryWrite } from '../src/infraestructure/repository/identity/user.repository.write';

const SEED_CATEGORY_ID = 'seed-cat-consoles';
const SEED_PRODUCT_ID = 'seed-product-ps5-digital';
const SEED_SELLER_ID = 'seed-seller-carlos';
const SEED_LISTING_ID = 'seed-listing-ps5-carlos';
const SEED_ADMIN_ID = 'seed-admin-local';

async function main() {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('seed:local is forbidden in production');
  }

  const databaseUri = process.env.DATABASE_URI;
  if (!databaseUri) {
    throw new Error('DATABASE_URI is required');
  }

  const adminEmail = process.env.SEED_ADMIN_EMAIL?.trim();
  const adminPassword = process.env.SEED_ADMIN_PASSWORD?.trim();
  if (!adminEmail || !adminPassword) {
    throw new Error(
      'SEED_ADMIN_EMAIL and SEED_ADMIN_PASSWORD are required for yarn seed:local',
    );
  }

  await mongoose.connect(databaseUri);

  const categoryRead = new CategoryRepositoryRead();
  const productRead = new ProductRepositoryRead();
  const listingRead = new ListingRepositoryRead();
  const userRead = new UserRepositoryRead();
  const userWrite = new UserRepositoryWrite();

  const authService = AuthServiceFactory.create();
  const categoryService = CategoryServiceFactory.create();
  const productService = ProductServiceFactory.create();
  const listingService = ListingServiceFactory.create();
  const reconcileService = SearchReconciliationServiceFactory.create();

  let admin = await userRead.findUserByEmail(adminEmail.toLowerCase());
  if (!admin) {
    const session = await authService.register({
      id: SEED_ADMIN_ID,
      fullName: 'Seed Admin',
      email: adminEmail,
      phone: '11999990000',
      cpf: buildValidCpf(900001001),
      birthDate: '1985-01-15',
      password: adminPassword,
    });
    admin = session.user;
    console.log(`Created admin user ${admin.id}`);
  } else {
    console.log(`Admin already exists ${admin.id}`);
  }

  if (!admin.groups?.includes(EUserGroup.ADMIN)) {
    await userWrite.updateUserById(admin.id, {
      groups: [EUserGroup.APP_USER, EUserGroup.ADMIN],
    });
    console.log(`Granted ADMIN to ${admin.id}`);
  }

  let seller = await userRead.findUserById(SEED_SELLER_ID);
  if (!seller) {
    const session = await authService.register({
      id: SEED_SELLER_ID,
      fullName: 'Carlos Seed',
      email: 'carlos.seed@example.com',
      phone: '11988887777',
      cpf: buildValidCpf(900001002),
      birthDate: '1990-05-12',
      password: adminPassword,
    });
    seller = session.user;
    console.log(`Created seller ${seller.id}`);
  } else {
    console.log(`Seller already exists ${seller.id}`);
  }

  if (!(await categoryRead.findCategoryById(SEED_CATEGORY_ID))) {
    await categoryService.createCategory({
      id: SEED_CATEGORY_ID,
      slug: 'consoles',
      name: 'Consoles',
      synonyms: ['videogame', 'console'],
      status: ECategoryStatus.ACTIVE,
    });
    console.log(`Created category ${SEED_CATEGORY_ID}`);
  } else {
    console.log(`Category already exists ${SEED_CATEGORY_ID}`);
  }

  if (!(await productRead.findProductById(SEED_PRODUCT_ID))) {
    await productService.createProduct({
      id: SEED_PRODUCT_ID,
      categoryId: SEED_CATEGORY_ID,
      brand: 'Sony',
      model: 'PS5 Digital 1TB',
      slug: 'ps5-digital-1tb',
      status: EProductStatus.ACTIVE,
    });
    console.log(`Created product ${SEED_PRODUCT_ID}`);
  } else {
    console.log(`Product already exists ${SEED_PRODUCT_ID}`);
  }

  const sellerActor = {
    actorId: seller.id,
    groups: [EUserGroup.APP_USER],
  };

  let listing = await listingRead.findListingById(SEED_LISTING_ID);
  if (!listing) {
    listing = await listingService.createListing(
      {
        id: SEED_LISTING_ID,
        sellerId: seller.id,
        productId: SEED_PRODUCT_ID,
        title: 'PS5 Digital seminovo — seed',
        condition: EListingCondition.GOOD,
        priceCents: 320000,
        currency: 'BRL',
        media: {
          photoUrls: ['https://cdn.example.com/seed/ps5.jpg'],
          videoUrl: 'https://cdn.example.com/seed/ps5.mp4',
        },
        shipping: {
          modes: [EShippingMode.PICKUP],
        },
      },
      sellerActor,
    );
    console.log(`Created listing ${listing.id}`);
  } else {
    console.log(`Listing already exists ${listing.id}`);
  }

  if (listing.status === EListingStatus.DRAFT) {
    listing = await listingService.submitListing(listing.id, sellerActor);
    console.log(`Submitted listing ${listing.id}`);
  }

  if (listing.status === EListingStatus.SUBMITTED) {
    listing = await listingService.publishListing(
      listing.id,
      systemActorContext(),
    );
    console.log(`Published listing ${listing.id}`);
  }

  const reconcile = await reconcileService.reconcile();
  console.log(
    `Reconciled search: listings=${reconcile.listingsReindexed} synonyms=${reconcile.synonymsUpserted}`,
  );

  await mongoose.disconnect();
  console.log('seed:local done');
}

main().catch(async (error) => {
  console.error(error);
  try {
    await mongoose.disconnect();
  } catch {
    // ignore
  }
  process.exit(1);
});
