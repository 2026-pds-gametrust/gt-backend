import './configuration/dotenv';
import path from 'path';
import { attachActorContext } from './application/middleware/attach-actor-context';
import { CatalogControllerFactory } from './configuration/factory/catalog.controller.factory';
import { FavoritesControllerFactory } from './configuration/factory/favorites.controller.factory';
import { IdentityControllerFactory } from './configuration/factory/identity.controller.factory';
import { ListingsControllerFactory } from './configuration/factory/listings.controller.factory';
import { MessagingConsumersFactory } from './configuration/factory/messaging/messaging-consumers.factory';
import { SearchControllerFactory } from './configuration/factory/search.controller.factory';
import { TrustControllerFactory } from './configuration/factory/trust.controller.factory';
import { VerificationControllerFactory } from './configuration/factory/verification.controller.factory';
import { Server } from './domain/server/server';

const OPEN_API_SPEC_FILE_LOCATION = path.resolve(
  __dirname,
  './contracts/service.yaml',
);

const app = new Server({
  port: Number(process.env.PORT) || 3000,
  middlewaresToStart: [attachActorContext],
  controllers: [
    IdentityControllerFactory.create(),
    CatalogControllerFactory.create(),
    ListingsControllerFactory.create(),
    VerificationControllerFactory.create(),
    TrustControllerFactory.create(),
    SearchControllerFactory.create(),
    FavoritesControllerFactory.create(),
  ],
  databaseURI: process.env.DATABASE_URI,
  apiSpecLocation: OPEN_API_SPEC_FILE_LOCATION,
});

async function start() {
  await app.databaseSetup();
  MessagingConsumersFactory.start();
  app.listen();
}

start();
