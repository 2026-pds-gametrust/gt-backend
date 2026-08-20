import { ListingChatController } from '../../application/controllers/listing-chat.controller';
import { IController } from '../../domain/server/interfaces/IController';
import { ListingChatServiceFactory } from './listing-chat.service.factory';

export class ListingChatControllerFactory {
  static create(): IController {
    return new ListingChatController(ListingChatServiceFactory.create());
  }
}
