import { Types, model } from 'mongoose';
import { IConversation } from '../../../../domain/listing-chat/entity/interfaces/conversation.interface';
import { ListingChatConversationSchema } from '../schema/listing-chat-conversation.schema';

export interface IMConversation extends Omit<IConversation, 'updatedAt'> {
  _id: Types.ObjectId;
  updatedAt?: Date;
}

export const ListingChatConversationModel = model<IMConversation>(
  'ListingChatConversation',
  ListingChatConversationSchema,
);
