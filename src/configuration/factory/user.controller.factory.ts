import { IdentityControllerFactory } from './identity.controller.factory';
import { IController } from '../../domain/server/interfaces/IController';

/** @deprecated Prefer IdentityControllerFactory — kept for compatibility. */
export class UserControllerFactory {
  static create(): IController {
    return IdentityControllerFactory.create();
  }
}
