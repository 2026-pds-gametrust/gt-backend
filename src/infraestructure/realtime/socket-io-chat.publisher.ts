import { Logger } from 'traceability';
import { IChatRealtimePublisher } from '../../domain/listing-chat/messaging/chat-realtime.publisher.interface';
import { IMessage } from '../../domain/listing-chat/entity/interfaces/message.interface';
import type { Server as SocketIOServer } from 'socket.io';

export class SocketIoChatRealtimePublisher implements IChatRealtimePublisher {
  constructor(private readonly io: SocketIOServer) {}

  async publishMessageCreated(params: {
    conversationId: string;
    message: IMessage;
    recipientUserIds: [string, string];
  }): Promise<void> {
    const room = `conversation:${params.conversationId}`;
    this.io.to(room).emit('message.created', {
      conversationId: params.conversationId,
      message: params.message,
    });
    Logger.info(
      JSON.stringify({
        eventName: 'listing_chat.realtime.delivered',
        conversationId: params.conversationId,
        messageId: params.message.id,
      }),
    );
  }
}
