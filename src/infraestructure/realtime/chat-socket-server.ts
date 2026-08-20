import { Server as HttpServer } from 'http';
import { Logger } from 'traceability';
import { Server as SocketIOServer, Socket } from 'socket.io';
import { CORS_ALLOWED_ORIGINS } from '../../configuration/env-constants/cors.env';
import { CHAT_SOCKET_IO_PATH } from '../../configuration/env-constants/listing-chat.env';
import { AccessTokenRevocationCheckerFactory } from '../../configuration/factory/access-token-revocation-checker.factory';
import { TokenSignerFactory } from '../../configuration/factory/token-signer.factory';
import { ListingChatService } from '../../domain/listing-chat/service/listing-chat.service';

export class ChatSocketServer {
  private io?: SocketIOServer;

  constructor(private readonly listingChatService: ListingChatService) {}

  start(httpServer: HttpServer): SocketIOServer {
    this.io = new SocketIOServer(httpServer, {
      path: CHAT_SOCKET_IO_PATH,
      cors: {
        origin: CORS_ALLOWED_ORIGINS.length > 0 ? CORS_ALLOWED_ORIGINS : false,
        credentials: true,
      },
      connectTimeout: 10_000,
    });

    const tokenSigner = TokenSignerFactory.create();
    const revocationChecker = AccessTokenRevocationCheckerFactory.create();

    this.io.use(async (socket, next) => {
      try {
        const token =
          (socket.handshake.auth?.token as string | undefined)?.trim() ||
          this.readBearerFromHeader(socket);

        if (!token) {
          next(new Error('AUTH_UNAUTHORIZED'));
          return;
        }

        const claims = tokenSigner.verifyAccessToken(token);
        const invalidated = await revocationChecker.isAccessInvalidated(
          claims.sid,
        );
        if (invalidated) {
          next(new Error('AUTH_UNAUTHORIZED'));
          return;
        }

        socket.data.actorId = claims.sub;
        next();
      } catch {
        next(new Error('AUTH_UNAUTHORIZED'));
      }
    });

    this.io.on('connection', (socket: Socket) => {
      socket.on('conversation:join', async (payload: { conversationId?: string }) => {
        try {
          const conversationId = String(payload?.conversationId ?? '').trim();
          if (!conversationId) {
            socket.emit('error', { code: 'FIELD_INVALID' });
            return;
          }

          await this.listingChatService.assertConversationParticipantForRealtime(
            conversationId,
            socket.data.actorId,
          );

          await socket.join(`conversation:${conversationId}`);
        } catch {
          socket.emit('error', { code: 'RESOURCE_NOT_FOUND' });
        }
      });

      socket.on('conversation:leave', async (payload: { conversationId?: string }) => {
        const conversationId = String(payload?.conversationId ?? '').trim();
        if (conversationId) {
          await socket.leave(`conversation:${conversationId}`);
        }
      });
    });

    Logger.info(
      JSON.stringify({
        eventName: 'listing_chat.socket.started',
        path: CHAT_SOCKET_IO_PATH,
      }),
    );

    return this.io;
  }

  getIo(): SocketIOServer | undefined {
    return this.io;
  }

  private readBearerFromHeader(socket: Socket): string | undefined {
    const header = socket.handshake.headers.authorization;
    if (!header?.startsWith('Bearer ')) return undefined;
    const token = header.slice('Bearer '.length).trim();
    return token.length > 0 ? token : undefined;
  }
}
