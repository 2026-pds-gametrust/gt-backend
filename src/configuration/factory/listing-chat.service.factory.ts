import { ListingChatService } from '../../domain/listing-chat/service/listing-chat.service';
import { ProfileRepositoryRead } from '../../infraestructure/repository/identity/profile.repository.read';
import { ListingRepositoryRead } from '../../infraestructure/repository/listings/listing.repository.read';
import {
  ChatBlockRepositoryRead,
  ChatBlockRepositoryWrite,
} from '../../infraestructure/repository/listing-chat/chat-block.repository';
import {
  ChatReportRepositoryRead,
  ChatReportRepositoryWrite,
} from '../../infraestructure/repository/listing-chat/chat-report.repository';
import { ConversationRepositoryRead } from '../../infraestructure/repository/listing-chat/conversation.repository.read';
import { ConversationRepositoryWrite } from '../../infraestructure/repository/listing-chat/conversation.repository.write';
import { MessageRepositoryRead } from '../../infraestructure/repository/listing-chat/message.repository.read';
import { MessageRepositoryWrite } from '../../infraestructure/repository/listing-chat/message.repository.write';
import { chatRealtimePublisher } from './chat-realtime.publisher.holder';

let listingChatServiceInstance: ListingChatService | null = null;

export class ListingChatServiceFactory {
  static create(): ListingChatService {
    if (listingChatServiceInstance) {
      return listingChatServiceInstance;
    }

    listingChatServiceInstance = new ListingChatService({
      conversationRepositoryRead: new ConversationRepositoryRead(),
      conversationRepositoryWrite: new ConversationRepositoryWrite(),
      messageRepositoryRead: new MessageRepositoryRead(),
      messageRepositoryWrite: new MessageRepositoryWrite(),
      chatBlockRepositoryRead: new ChatBlockRepositoryRead(),
      chatBlockRepositoryWrite: new ChatBlockRepositoryWrite(),
      chatReportRepositoryRead: new ChatReportRepositoryRead(),
      chatReportRepositoryWrite: new ChatReportRepositoryWrite(),
      listingRepositoryRead: new ListingRepositoryRead(),
      profileRepositoryRead: new ProfileRepositoryRead(),
      chatRealtimePublisher,
    });

    return listingChatServiceInstance;
  }
}
