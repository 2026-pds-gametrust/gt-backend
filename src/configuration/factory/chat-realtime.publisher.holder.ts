import { IChatRealtimePublisher } from '../../domain/listing-chat/messaging/chat-realtime.publisher.interface';
import { IMessage } from '../../domain/listing-chat/entity/interfaces/message.interface';

class NoOpChatRealtimePublisher implements IChatRealtimePublisher {
  async publishMessageCreated(_params: {
    conversationId: string;
    message: IMessage;
    recipientUserIds: [string, string];
  }): Promise<void> {
    return;
  }
}

export class DelegatingChatRealtimePublisher implements IChatRealtimePublisher {
  private delegate: IChatRealtimePublisher = new NoOpChatRealtimePublisher();

  setDelegate(publisher: IChatRealtimePublisher): void {
    this.delegate = publisher;
  }

  async publishMessageCreated(params: {
    conversationId: string;
    message: IMessage;
    recipientUserIds: [string, string];
  }): Promise<void> {
    return this.delegate.publishMessageCreated(params);
  }
}

export const chatRealtimePublisher = new DelegatingChatRealtimePublisher();
