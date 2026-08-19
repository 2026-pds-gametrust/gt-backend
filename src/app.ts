import './configuration/dotenv';
import path from 'path';
import { attachActorFromAccessToken } from './application/middleware/attach-actor-context';
import { CORS_ALLOWED_ORIGINS } from './configuration/env-constants/cors.env';
import { AuthControllerFactory } from './configuration/factory/auth.controller.factory';
import { CatalogControllerFactory } from './configuration/factory/catalog.controller.factory';
import { FavoritesControllerFactory } from './configuration/factory/favorites.controller.factory';
import { IdentityControllerFactory } from './configuration/factory/identity.controller.factory';
import { ListingsControllerFactory } from './configuration/factory/listings.controller.factory';
import { MediaControllerFactory } from './configuration/factory/media.controller.factory';
import { MessagingConsumersFactory } from './configuration/factory/messaging/messaging-consumers.factory';
import { SearchControllerFactory } from './configuration/factory/search.controller.factory';
import { AccessTokenRevocationCheckerFactory } from './configuration/factory/access-token-revocation-checker.factory';
import { TokenSignerFactory } from './configuration/factory/token-signer.factory';
import { TrustControllerFactory } from './configuration/factory/trust.controller.factory';
import { VerificationControllerFactory } from './configuration/factory/verification.controller.factory';
import { ListingAnalysisControllerFactory } from './configuration/factory/listing-analysis.controller.factory';
import { Server } from './domain/server/server';

const OPEN_API_SPEC_FILE_LOCATION = path.resolve(
  __dirname,
  './contracts/service.yaml',
);

const app = new Server({
  port: Number(process.env.PORT) || 3000,
  originAllowed: CORS_ALLOWED_ORIGINS,
  middlewaresToStart: [
    attachActorFromAccessToken(
      TokenSignerFactory.create(),
      AccessTokenRevocationCheckerFactory.create(),
    ),
  ],
  controllers: [
    AuthControllerFactory.create(),
    IdentityControllerFactory.create(),
    CatalogControllerFactory.create(),
    ListingsControllerFactory.create(),
    MediaControllerFactory.create(),
    VerificationControllerFactory.create(),
    ListingAnalysisControllerFactory.create(),
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
