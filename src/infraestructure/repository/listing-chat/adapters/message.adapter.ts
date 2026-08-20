import { IMessage } from '../../../../domain/listing-chat/entity/interfaces/message.interface';
import { IMMessage } from '../../../db/mongo/models/listing-chat-message.model';

export function dbToInternal(doc: IMMessage): IMessage {
  return {
    id: doc.id,
    conversationId: doc.conversationId,
    senderId: doc.senderId,
    body: doc.body,
    status: doc.status,
    createdAt: doc.createdAt,
  };
}

export function internalToDb(
  message: IMessage,
): Omit<IMMessage, '_id' | 'createdAt'> & { createdAt?: Date } {
  return {
    id: message.id,
    conversationId: message.conversationId,
    senderId: message.senderId,
    body: message.body,
    status: message.status,
    createdAt: message.createdAt,
  };
}
