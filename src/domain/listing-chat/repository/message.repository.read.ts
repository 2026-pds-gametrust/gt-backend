import { IMessage } from '../entity/interfaces/message.interface';

export interface IMessageCursor {
  createdAt: string;
  id: string;
}

export interface IParamsListMessages {
  conversationId: string;
  limit: number;
  before?: IMessageCursor;
}

export interface IMessageRepositoryRead {
  findMessageById(id: string): Promise<IMessage | null>;
  findMessageByIdAndConversation(
    id: string,
    conversationId: string,
  ): Promise<IMessage | null>;
  listMessages(params: IParamsListMessages): Promise<IMessage[]>;
  countByConversation(conversationId: string): Promise<number>;
}

export interface IMessageRepositoryWrite {
  createMessage(message: IMessage): Promise<IMessage>;
}
