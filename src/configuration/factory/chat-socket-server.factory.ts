import { Server as HttpServer } from 'http';
import { ChatSocketServer } from '../../infraestructure/realtime/chat-socket-server';
import { SocketIoChatRealtimePublisher } from '../../infraestructure/realtime/socket-io-chat.publisher';
import { ListingChatService } from '../../domain/listing-chat/service/listing-chat.service';
import { chatRealtimePublisher } from './chat-realtime.publisher.holder';

let chatSocketServer: ChatSocketServer | null = null;

export class ChatSocketServerFactory {
  static start(httpServer: HttpServer, listingChatService: ListingChatService) {
    chatSocketServer = new ChatSocketServer(listingChatService);
    const io = chatSocketServer.start(httpServer);
    chatRealtimePublisher.setDelegate(new SocketIoChatRealtimePublisher(io));
    return chatSocketServer;
  }

  static getInstance(): ChatSocketServer | null {
    return chatSocketServer;
  }
}
