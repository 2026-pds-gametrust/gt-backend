import { IChatBlock } from '../../../../domain/listing-chat/entity/interfaces/chat-block.interface';
import { IMChatBlock } from '../../../db/mongo/models/listing-chat-block.model';

export function dbToInternal(doc: IMChatBlock): IChatBlock {
  return {
    id: doc.id,
    blockerId: doc.blockerId,
    blockedUserId: doc.blockedUserId,
    createdAt: doc.createdAt,
  };
}

export function internalToDb(
  block: IChatBlock,
): Omit<IMChatBlock, '_id' | 'createdAt'> & { createdAt?: Date } {
  return {
    id: block.id,
    blockerId: block.blockerId,
    blockedUserId: block.blockedUserId,
    createdAt: block.createdAt,
  };
}
