import { IActorContext } from '../../common/types/actor-context';
import { IListingRepositoryRead } from '../../listings/repository/listing.repository.read';
import { IProfileRepositoryRead } from '../../identity/repository/profile.repository.read';
import { IConversation } from '../entity/interfaces/conversation.interface';
import { IMessage } from '../entity/interfaces/message.interface';
import { IChatReport } from '../entity/interfaces/chat-report.interface';
import { EChatReportTargetType } from '../entity/enums/EChatReportTargetType';
import {
  IChatBlockRepositoryRead,
  IChatBlockRepositoryWrite,
} from '../repository/chat-block.repository.read';
import {
  IChatReportRepositoryRead,
  IChatReportRepositoryWrite,
} from '../repository/chat-report.repository.read';
import {
  IConversationRepositoryRead,
  IConversationRepositoryWrite,
} from '../repository/conversation.repository.read';
import {
  IMessageRepositoryRead,
  IMessageRepositoryWrite,
} from '../repository/message.repository.read';
import { IChatRealtimePublisher } from '../messaging/chat-realtime.publisher.interface';

export interface IConversationSummary extends IConversation {
  listing: { id: string; title: string };
  otherParticipant: { userId: string; displayName?: string };
}

export interface IConversationPage {
  items: IConversationSummary[];
  nextCursor?: string;
}

export interface IMessagePage {
  items: IMessage[];
  nextCursor?: string;
}

export interface IChatReportPage {
  items: IChatReport[];
  nextCursor?: string;
}

export interface IParamsListingChatService {
  conversationRepositoryRead: IConversationRepositoryRead;
  conversationRepositoryWrite: IConversationRepositoryWrite;
  messageRepositoryRead: IMessageRepositoryRead;
  messageRepositoryWrite: IMessageRepositoryWrite;
  chatBlockRepositoryRead: IChatBlockRepositoryRead;
  chatBlockRepositoryWrite: IChatBlockRepositoryWrite;
  chatReportRepositoryRead: IChatReportRepositoryRead;
  chatReportRepositoryWrite: IChatReportRepositoryWrite;
  listingRepositoryRead: IListingRepositoryRead;
  profileRepositoryRead: IProfileRepositoryRead;
  chatRealtimePublisher: IChatRealtimePublisher;
}

export interface IListingChatService {
  openConversation(
    listingId: string,
    actor: IActorContext,
  ): Promise<IConversation>;
  getConversation(
    conversationId: string,
    actor: IActorContext,
  ): Promise<IConversation>;
  listConversations(
    actor: IActorContext,
    limit?: number,
    cursor?: string,
  ): Promise<IConversationPage>;
  sendMessage(
    conversationId: string,
    body: string,
    actor: IActorContext,
  ): Promise<IMessage>;
  listMessages(
    conversationId: string,
    actor: IActorContext,
    limit?: number,
    before?: string,
  ): Promise<IMessagePage>;
  markConversationRead(
    conversationId: string,
    actor: IActorContext,
  ): Promise<void>;
  blockParticipant(
    conversationId: string,
    actor: IActorContext,
  ): Promise<void>;
  createReport(
    conversationId: string,
    actor: IActorContext,
    reason: string,
    targetType: EChatReportTargetType,
    targetId?: string,
  ): Promise<IChatReport>;
  listChatReports(
    limit?: number,
    cursor?: string,
  ): Promise<IChatReportPage>;
  assertConversationParticipantForRealtime(
    conversationId: string,
    actorId: string,
  ): Promise<void>;
}
