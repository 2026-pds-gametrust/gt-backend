import { IThrowedError, serviceLogErrorHandler } from '@sauvvitech/st-packages';
import { EErrorCode } from '../../../domain/common/errors/enums/EErrorCode';
import { IConversation } from '../../../domain/listing-chat/entity/interfaces/conversation.interface';
import {
  IConversationRepositoryRead,
  IParamsListConversations,
} from '../../../domain/listing-chat/repository/conversation.repository.read';
import { ListingChatConversationModel } from '../../db/mongo/models/listing-chat-conversation.model';
import { dbToInternal } from './adapters/conversation.adapter';

export class ConversationRepositoryRead implements IConversationRepositoryRead {
  async findConversationById(id: string): Promise<IConversation | null> {
    try {
      const doc = await ListingChatConversationModel.findOne({ id });
      return doc ? dbToInternal(doc) : null;
    } catch (error: unknown) {
      serviceLogErrorHandler(error instanceof Error ? error : new Error(String(error)), {
        eventName: 'ConversationRepositoryRead.findConversationById',
        eventData: { id },
      });
      throw {
        status: 500,
        errorCode: EErrorCode.DATABASE_ERROR,
      } as IThrowedError;
    }
  }

  async findByListingAndBuyer(
    listingId: string,
    buyerId: string,
  ): Promise<IConversation | null> {
    try {
      const doc = await ListingChatConversationModel.findOne({
        listingId,
        buyerId,
      });
      return doc ? dbToInternal(doc) : null;
    } catch (error: unknown) {
      serviceLogErrorHandler(error instanceof Error ? error : new Error(String(error)), {
        eventName: 'ConversationRepositoryRead.findByListingAndBuyer',
        eventData: { listingId, buyerId },
      });
      throw {
        status: 500,
        errorCode: EErrorCode.DATABASE_ERROR,
      } as IThrowedError;
    }
  }

  async listByParticipant(
    params: IParamsListConversations,
  ): Promise<IConversation[]> {
    try {
      const filter: Record<string, unknown> = {
        $or: [{ buyerId: params.actorId }, { sellerId: params.actorId }],
      };

      if (params.cursor) {
        const cursorDate = new Date(params.cursor.lastMessageAt);
        filter.$and = [
          {
            $or: [
              { lastMessageAt: { $lt: cursorDate } },
              {
                lastMessageAt: cursorDate,
                id: { $lt: params.cursor.id },
              },
              {
                lastMessageAt: { $exists: false },
                createdAt: { $lt: cursorDate },
              },
            ],
          },
        ];
      }

      const docs = await ListingChatConversationModel.find(filter)
        .sort({ lastMessageAt: -1, createdAt: -1, id: -1 })
        .limit(params.limit);

      return docs.map(dbToInternal);
    } catch (error: unknown) {
      serviceLogErrorHandler(error instanceof Error ? error : new Error(String(error)), {
        eventName: 'ConversationRepositoryRead.listByParticipant',
        eventData: { actorId: params.actorId },
      });
      throw {
        status: 500,
        errorCode: EErrorCode.DATABASE_ERROR,
      } as IThrowedError;
    }
  }

  async findConversationsByUserPair(
    userIdA: string,
    userIdB: string,
  ): Promise<IConversation[]> {
    try {
      const docs = await ListingChatConversationModel.find({
        $or: [
          { buyerId: userIdA, sellerId: userIdB },
          { buyerId: userIdB, sellerId: userIdA },
        ],
      });
      return docs.map(dbToInternal);
    } catch (error: unknown) {
      serviceLogErrorHandler(error instanceof Error ? error : new Error(String(error)), {
        eventName: 'ConversationRepositoryRead.findConversationsByUserPair',
        eventData: { userIdA, userIdB },
      });
      throw {
        status: 500,
        errorCode: EErrorCode.DATABASE_ERROR,
      } as IThrowedError;
    }
  }
}
