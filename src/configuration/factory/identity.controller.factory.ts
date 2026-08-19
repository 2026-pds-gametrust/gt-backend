import { IdentityController } from '../../application/controllers/identity.controller';
import { IController } from '../../domain/server/interfaces/IController';
import { AuthServiceFactory } from './auth.service.factory';
import { CepServiceFactory } from './cep.service.factory';
import { ProfileServiceFactory } from './profile.service.factory';
import { UserServiceFactory } from './user.service.factory';

export class IdentityControllerFactory {
  static create(): IController {
    return new IdentityController(
      UserServiceFactory.create(),
      ProfileServiceFactory.create(),
      AuthServiceFactory.create(),
      CepServiceFactory.create(),
    );
  }
}
