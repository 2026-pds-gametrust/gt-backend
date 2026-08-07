import { bootstrapTest } from '../src/__tests__/testUtils';
import { Server } from '../src/domain/server/server';
import { CategoryAttributeSchemaModel } from '../src/infraestructure/db/mongo/models/category-attribute-schema.model';
import { CategoryModel } from '../src/infraestructure/db/mongo/models/category.model';
import { FavoriteModel } from '../src/infraestructure/db/mongo/models/favorite.model';
import { ListingEventModel } from '../src/infraestructure/db/mongo/models/listing-event.model';
import { ListingModel } from '../src/infraestructure/db/mongo/models/listing.model';
import { PriceHistoryModel } from '../src/infraestructure/db/mongo/models/price-history.model';
import { ProductModel } from '../src/infraestructure/db/mongo/models/product.model';
import { ProfileModel } from '../src/infraestructure/db/mongo/models/profile.model';
import { QueryLogModel } from '../src/infraestructure/db/mongo/models/query-log.model';
import { SearchDocumentModel } from '../src/infraestructure/db/mongo/models/search-document.model';
import { ServiceTaxonomyModel } from '../src/infraestructure/db/mongo/models/service-taxonomy.model';
import { SynonymModel } from '../src/infraestructure/db/mongo/models/synonym.model';
import { UserModel } from '../src/infraestructure/db/mongo/models/user.model';
import { MongooseDatabase } from './setup-db';

let dbInstance: MongooseDatabase;
export let app: Server;

beforeAll(async () => {
  const bootstrap = await bootstrapTest();
  dbInstance = bootstrap.dbInstance;
  app = bootstrap.app;
});

afterAll(async () => {
  await UserModel.deleteMany({});
  await ProfileModel.deleteMany({});
  await CategoryModel.deleteMany({});
  await ServiceTaxonomyModel.deleteMany({});
  await CategoryAttributeSchemaModel.deleteMany({});
  await ProductModel.deleteMany({});
  await PriceHistoryModel.deleteMany({});
  await ListingModel.deleteMany({});
  await ListingEventModel.deleteMany({});
  await SearchDocumentModel.deleteMany({});
  await SynonymModel.deleteMany({});
  await QueryLogModel.deleteMany({});
  await FavoriteModel.deleteMany({});
  await dbInstance?.close();
});
