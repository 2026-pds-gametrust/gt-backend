import { Types, model } from 'mongoose';
import { IMessage } from '../../../../domain/listing-chat/entity/interfaces/message.interface';
import { ListingChatMessageSchema } from '../schema/listing-chat-message.schema';

export interface IMMessage extends Omit<IMessage, 'createdAt'> {
  _id: Types.ObjectId;
  createdAt: Date;
}

export const ListingChatMessageModel = model<IMMessage>(
  'ListingChatMessage',
  ListingChatMessageSchema,
);
