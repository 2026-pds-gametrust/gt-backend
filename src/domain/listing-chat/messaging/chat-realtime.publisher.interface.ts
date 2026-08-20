import { IMessage } from '../entity/interfaces/message.interface';

export interface IChatRealtimePublisher {
  publishMessageCreated(params: {
    conversationId: string;
    message: IMessage;
    recipientUserIds: [string, string];
  }): Promise<void>;
}
