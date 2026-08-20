import { MediaController } from '../../application/controllers/media.controller';
import { IController } from '../../domain/server/interfaces/IController';
import { MediaAssetServiceFactory } from './media-asset.service.factory';

export class MediaControllerFactory {
  static create(): IController {
    return new MediaController(MediaAssetServiceFactory.create());
  }
}
