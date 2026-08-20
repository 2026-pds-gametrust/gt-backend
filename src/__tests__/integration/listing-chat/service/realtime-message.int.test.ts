import { AddressInfo } from 'net';
import { io as ioClient, Socket } from 'socket.io-client';
import supertest from 'supertest';
import { Server as HttpServer } from 'http';
import { app } from '../../../../../jest/setup-integration-tests';
import { ChatSocketServerFactory } from '../../../../configuration/factory/chat-socket-server.factory';
import { ListingChatServiceFactory } from '../../../../configuration/factory/listing-chat.service.factory';
import { CHAT_SOCKET_IO_PATH } from '../../../../configuration/env-constants/listing-chat.env';
import {
  CONTACT_REMOVED_TOKEN,
} from '../../../../domain/listing-chat/service/contact-filter.util';
import { signTestAccessToken } from '../../../helpers/sign-test-access-token';
import { EUserGroup } from '@sauvvitech/st-packages';
import { seedListingChatFixture } from '../../../helpers/listing-chat-fixture';

describe('when recipient is connected via Socket.IO', () => {
  let httpServer: HttpServer;
  let serverPort: number;
  const openSockets: Socket[] = [];

  function trackSocket(socket: Socket): Socket {
    openSockets.push(socket);
    return socket;
  }

  beforeAll(async () => {
    httpServer = app.listen();
    serverPort = (httpServer.address() as AddressInfo).port;
    ChatSocketServerFactory.start(httpServer, ListingChatServiceFactory.create());
  });

  afterEach(() => {
    while (openSockets.length > 0) {
      openSockets.pop()?.disconnect();
    }
  });

  afterAll(async () => {
    await new Promise<void>((resolve, reject) => {
      httpServer.close((error) => (error ? reject(error) : resolve()));
    });
  });

  async function connectSocket(token: string): Promise<Socket> {
    const socket = trackSocket(
      ioClient(`http://127.0.0.1:${serverPort}`, {
        path: CHAT_SOCKET_IO_PATH,
        auth: { token },
        transports: ['websocket'],
      }),
    );

    await new Promise<void>((resolve, reject) => {
      socket.on('connect', () => resolve());
      socket.on('connect_error', reject);
      setTimeout(() => reject(new Error('socket connect timeout')), 5000);
    });

    return socket;
  }

  it('should receive message.created after HTTP send', async () => {
    const { buyerId, sellerId, listingId } = await seedListingChatFixture();
    const opened = await supertest(app.app)
      .post('/conversations')
      .set('Authorization', `Bearer ${signTestAccessToken({ actorId: buyerId, groups: [EUserGroup.APP_USER] })}`)
      .send({ listingId });
    const conversationId = opened.body.id;

    const sellerSocket = await connectSocket(
      signTestAccessToken({ actorId: sellerId, groups: [EUserGroup.APP_USER] }),
    );

    sellerSocket.emit('conversation:join', { conversationId });
    await new Promise<void>((resolve) => setTimeout(resolve, 200));

    const eventPromise = new Promise<{ conversationId: string; message: { body: string } }>((resolve, reject) => {
      sellerSocket.on('message.created', resolve);
      setTimeout(() => reject(new Error('message.created timeout')), 5000);
    });

    const sent = await supertest(app.app)
      .post(`/conversations/${conversationId}/messages`)
      .set('Authorization', `Bearer ${signTestAccessToken({ actorId: buyerId, groups: [EUserGroup.APP_USER] })}`)
      .send({ body: 'Chegou em tempo real?' });
    expect(sent.statusCode).toBe(201);

    const event = await eventPromise;
    expect(event.conversationId).toBe(conversationId);
    expect(event.message.body).toBe('Chegou em tempo real?');
  });

  it('should deliver masked body on message.created when contact is embedded', async () => {
    const { buyerId, sellerId, listingId } = await seedListingChatFixture();
    const opened = await supertest(app.app)
      .post('/conversations')
      .set('Authorization', `Bearer ${signTestAccessToken({ actorId: buyerId, groups: [EUserGroup.APP_USER] })}`)
      .send({ listingId });
    const conversationId = opened.body.id;

    const sellerSocket = await connectSocket(
      signTestAccessToken({ actorId: sellerId, groups: [EUserGroup.APP_USER] }),
    );

    sellerSocket.emit('conversation:join', { conversationId });
    await new Promise<void>((resolve) => setTimeout(resolve, 200));

    const eventPromise = new Promise<{ conversationId: string; message: { body: string } }>((resolve, reject) => {
      sellerSocket.on('message.created', resolve);
      setTimeout(() => reject(new Error('message.created timeout')), 5000);
    });

    const sent = await supertest(app.app)
      .post(`/conversations/${conversationId}/messages`)
      .set('Authorization', `Bearer ${signTestAccessToken({ actorId: buyerId, groups: [EUserGroup.APP_USER] })}`)
      .send({ body: 'Me liga 11999998888 amanhã' });
    expect(sent.statusCode).toBe(201);

    const event = await eventPromise;
    expect(event.message.body).toContain(CONTACT_REMOVED_TOKEN);
    expect(event.message.body).not.toContain('11999998888');
    expect(event.message.body).toBe(sent.body.body);
  });

  it('should reject join for non-participant', async () => {
    const { buyerId, listingId } = await seedListingChatFixture();
    const opened = await supertest(app.app)
      .post('/conversations')
      .set('Authorization', `Bearer ${signTestAccessToken({ actorId: buyerId, groups: [EUserGroup.APP_USER] })}`)
      .send({ listingId });

    const outsiderSocket = await connectSocket(
      signTestAccessToken({ actorId: 'outsider-user', groups: [EUserGroup.APP_USER] }),
    );

    const errorPromise = new Promise<{ code: string }>((resolve) => {
      outsiderSocket.on('error', resolve);
    });
    outsiderSocket.emit('conversation:join', {
      conversationId: opened.body.id,
    });
    const errorEvent = await errorPromise;
    expect(errorEvent.code).toBe('RESOURCE_NOT_FOUND');
  });

  it('should reject handshake without auth token', async () => {
    const socket = trackSocket(
      ioClient(`http://127.0.0.1:${serverPort}`, {
        path: CHAT_SOCKET_IO_PATH,
        transports: ['websocket'],
      }),
    );

    const error = await new Promise<Error>((resolve, reject) => {
      socket.on('connect', () => reject(new Error('should not connect')));
      socket.on('connect_error', (connectError) => resolve(connectError));
      setTimeout(() => reject(new Error('connect timeout')), 5000);
    });

    expect(error.message).toMatch(/AUTH_UNAUTHORIZED|Unauthorized/i);
  });
});
