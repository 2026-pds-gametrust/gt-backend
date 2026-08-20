import { IThrowedError, serviceLogErrorHandler } from '@sauvvitech/st-packages';
import { EErrorCode } from '../../../domain/common/errors/enums/EErrorCode';
import { EConversationStatus } from '../../../domain/listing-chat/entity/enums/EConversationStatus';
import { IConversation } from '../../../domain/listing-chat/entity/interfaces/conversation.interface';
import { IConversationRepositoryWrite } from '../../../domain/listing-chat/repository/conversation.repository.read';
import { ListingChatConversationModel } from '../../db/mongo/models/listing-chat-conversation.model';
import { dbToInternal, internalToDb } from './adapters/conversation.adapter';

export class ConversationRepositoryWrite implements IConversationRepositoryWrite {
  async createConversation(
    conversation: IConversation,
  ): Promise<IConversation> {
    try {
      const doc = await ListingChatConversationModel.create(
        internalToDb(conversation),
      );
      return dbToInternal(doc);
    } catch (error: unknown) {
      serviceLogErrorHandler(error instanceof Error ? error : new Error(String(error)), {
        eventName: 'ConversationRepositoryWrite.createConversation',
        eventData: { id: conversation.id },
      });
      throw error;
    }
  }

  async updateConversation(
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
  ): Promise<IConversation | null> {
    try {
      const doc = await ListingChatConversationModel.findOneAndUpdate(
        { id },
        { $set: patch },
        { new: true },
      );
      return doc ? dbToInternal(doc) : null;
    } catch (error: unknown) {
      serviceLogErrorHandler(error instanceof Error ? error : new Error(String(error)), {
        eventName: 'ConversationRepositoryWrite.updateConversation',
        eventData: { id },
      });
      throw {
        status: 500,
        errorCode: EErrorCode.DATABASE_ERROR,
      } as IThrowedError;
    }
  }

  async incrementUnread(
    id: string,
    field: 'buyerUnreadCount' | 'sellerUnreadCount',
  ): Promise<IConversation | null> {
    try {
      const doc = await ListingChatConversationModel.findOneAndUpdate(
        { id },
        { $inc: { [field]: 1 }, $set: { updatedAt: new Date() } },
        { new: true },
      );
      return doc ? dbToInternal(doc) : null;
    } catch (error: unknown) {
      serviceLogErrorHandler(error instanceof Error ? error : new Error(String(error)), {
        eventName: 'ConversationRepositoryWrite.incrementUnread',
        eventData: { id, field },
      });
      throw {
        status: 500,
        errorCode: EErrorCode.DATABASE_ERROR,
      } as IThrowedError;
    }
  }

  async resetUnread(
    id: string,
    field: 'buyerUnreadCount' | 'sellerUnreadCount',
  ): Promise<IConversation | null> {
    try {
      const doc = await ListingChatConversationModel.findOneAndUpdate(
        { id },
        { $set: { [field]: 0, updatedAt: new Date() } },
        { new: true },
      );
      return doc ? dbToInternal(doc) : null;
    } catch (error: unknown) {
      serviceLogErrorHandler(error instanceof Error ? error : new Error(String(error)), {
        eventName: 'ConversationRepositoryWrite.resetUnread',
        eventData: { id, field },
      });
      throw {
        status: 500,
        errorCode: EErrorCode.DATABASE_ERROR,
      } as IThrowedError;
    }
  }

  async setStatusForUserPair(
    userIdA: string,
    userIdB: string,
    status: EConversationStatus,
  ): Promise<number> {
    try {
      const result = await ListingChatConversationModel.updateMany(
        {
          $or: [
            { buyerId: userIdA, sellerId: userIdB },
            { buyerId: userIdB, sellerId: userIdA },
          ],
        },
        { $set: { status, updatedAt: new Date() } },
      );
      return result.modifiedCount;
    } catch (error: unknown) {
      serviceLogErrorHandler(error instanceof Error ? error : new Error(String(error)), {
        eventName: 'ConversationRepositoryWrite.setStatusForUserPair',
        eventData: { userIdA, userIdB, status },
      });
      throw {
        status: 500,
        errorCode: EErrorCode.DATABASE_ERROR,
      } as IThrowedError;
    }
  }
}
