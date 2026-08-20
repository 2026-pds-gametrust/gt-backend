import { Types, model } from 'mongoose';
import { IChatBlock } from '../../../../domain/listing-chat/entity/interfaces/chat-block.interface';
import { ListingChatBlockSchema } from '../schema/listing-chat-block.schema';

export interface IMChatBlock extends Omit<IChatBlock, 'createdAt'> {
  _id: Types.ObjectId;
  createdAt: Date;
}

export const ListingChatBlockModel = model<IMChatBlock>(
  'ListingChatBlock',
  ListingChatBlockSchema,
);
