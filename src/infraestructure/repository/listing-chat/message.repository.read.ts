import { IThrowedError, serviceLogErrorHandler } from '@sauvvitech/st-packages';
import { EErrorCode } from '../../../domain/common/errors/enums/EErrorCode';
import { IMessage } from '../../../domain/listing-chat/entity/interfaces/message.interface';
import {
  IMessageRepositoryRead,
  IParamsListMessages,
} from '../../../domain/listing-chat/repository/message.repository.read';
import { ListingChatMessageModel } from '../../db/mongo/models/listing-chat-message.model';
import { dbToInternal } from './adapters/message.adapter';

export class MessageRepositoryRead implements IMessageRepositoryRead {
  async findMessageById(id: string): Promise<IMessage | null> {
    try {
      const doc = await ListingChatMessageModel.findOne({ id });
      return doc ? dbToInternal(doc) : null;
    } catch (error: unknown) {
      serviceLogErrorHandler(error instanceof Error ? error : new Error(String(error)), {
        eventName: 'MessageRepositoryRead.findMessageById',
        eventData: { id },
      });
      throw {
        status: 500,
        errorCode: EErrorCode.DATABASE_ERROR,
      } as IThrowedError;
    }
  }

  async findMessageByIdAndConversation(
    id: string,
    conversationId: string,
  ): Promise<IMessage | null> {
    try {
      const doc = await ListingChatMessageModel.findOne({
        id,
        conversationId,
      });
      return doc ? dbToInternal(doc) : null;
    } catch (error: unknown) {
      serviceLogErrorHandler(error instanceof Error ? error : new Error(String(error)), {
        eventName: 'MessageRepositoryRead.findMessageByIdAndConversation',
        eventData: { id, conversationId },
      });
      throw {
        status: 500,
        errorCode: EErrorCode.DATABASE_ERROR,
      } as IThrowedError;
    }
  }

  async listMessages(params: IParamsListMessages): Promise<IMessage[]> {
    try {
      const filter: Record<string, unknown> = {
        conversationId: params.conversationId,
      };

      if (params.before) {
        const cursorDate = new Date(params.before.createdAt);
        filter.$or = [
          { createdAt: { $lt: cursorDate } },
          { createdAt: cursorDate, id: { $lt: params.before.id } },
        ];
      }

      const docs = await ListingChatMessageModel.find(filter)
        .sort({ createdAt: -1, id: -1 })
        .limit(params.limit);

      return docs.map(dbToInternal).reverse();
    } catch (error: unknown) {
      serviceLogErrorHandler(error instanceof Error ? error : new Error(String(error)), {
        eventName: 'MessageRepositoryRead.listMessages',
        eventData: { conversationId: params.conversationId },
      });
      throw {
        status: 500,
        errorCode: EErrorCode.DATABASE_ERROR,
      } as IThrowedError;
    }
  }

  async countByConversation(conversationId: string): Promise<number> {
    try {
      return ListingChatMessageModel.countDocuments({ conversationId });
    } catch (error: unknown) {
      serviceLogErrorHandler(error instanceof Error ? error : new Error(String(error)), {
        eventName: 'MessageRepositoryRead.countByConversation',
        eventData: { conversationId },
      });
      throw {
        status: 500,
        errorCode: EErrorCode.DATABASE_ERROR,
      } as IThrowedError;
    }
  }
}
