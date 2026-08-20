import { EConversationStatus } from '../entity/enums/EConversationStatus';
import { IConversation } from '../entity/interfaces/conversation.interface';

export interface IConversationCursor {
  lastMessageAt: string;
  id: string;
}

export interface IParamsListConversations {
  actorId: string;
  limit: number;
  cursor?: IConversationCursor;
}

export interface IConversationRepositoryRead {
  findConversationById(id: string): Promise<IConversation | null>;
  findByListingAndBuyer(
    listingId: string,
    buyerId: string,
  ): Promise<IConversation | null>;
  listByParticipant(params: IParamsListConversations): Promise<IConversation[]>;
  findConversationsByUserPair(
    userIdA: string,
    userIdB: string,
  ): Promise<IConversation[]>;
}

export interface IConversationRepositoryWrite {
  createConversation(conversation: IConversation): Promise<IConversation>;
  updateConversation(
    id: string,
    patch: Partial<
      Pick<
        IConversation,
        | 'status'
        | 'buyerUnreadCount'
        | 'sellerUnreadCount'
        | 'lastMessageAt'
        | 'lastMessagePreview'
        | 'updatedAt'
      >
    >,
  ): Promise<IConversation | null>;
  incrementUnread(
    id: string,
    field: 'buyerUnreadCount' | 'sellerUnreadCount',
  ): Promise<IConversation | null>;
  resetUnread(
    id: string,
    field: 'buyerUnreadCount' | 'sellerUnreadCount',
  ): Promise<IConversation | null>;
  setStatusForUserPair(
    userIdA: string,
    userIdB: string,
    status: EConversationStatus,
  ): Promise<number>;
}
