import { IThrowedError, serviceLogErrorHandler } from '@sauvvitech/st-packages';
import { EErrorCode } from '../../../domain/common/errors/enums/EErrorCode';
import { IMessage } from '../../../domain/listing-chat/entity/interfaces/message.interface';
import { IMessageRepositoryWrite } from '../../../domain/listing-chat/repository/message.repository.read';
import { ListingChatMessageModel } from '../../db/mongo/models/listing-chat-message.model';
import { dbToInternal, internalToDb } from './adapters/message.adapter';

export class MessageRepositoryWrite implements IMessageRepositoryWrite {
  async createMessage(message: IMessage): Promise<IMessage> {
    try {
      const doc = await ListingChatMessageModel.create(internalToDb(message));
      return dbToInternal(doc);
    } catch (error: unknown) {
      serviceLogErrorHandler(error instanceof Error ? error : new Error(String(error)), {
        eventName: 'MessageRepositoryWrite.createMessage',
        eventData: { id: message.id },
      });
      throw {
        status: 500,
        errorCode: EErrorCode.DATABASE_ERROR,
      } as IThrowedError;
    }
  }
}
