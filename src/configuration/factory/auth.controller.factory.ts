import { AuthController } from '../../application/controllers/auth.controller';
import { createAuthRateLimit } from '../../application/middleware/auth-rate-limit';
import { IController } from '../../domain/server/interfaces/IController';
import { AuthRateLimitStoreFactory } from './auth-rate-limit-store.factory';
import { AuthServiceFactory } from './auth.service.factory';

export class AuthControllerFactory {
  static create(): IController {
    return new AuthController(
      AuthServiceFactory.create(),
      createAuthRateLimit(AuthRateLimitStoreFactory.create()),
    );
  }
}
