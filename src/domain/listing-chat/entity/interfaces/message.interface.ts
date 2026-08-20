import { EMessageStatus } from '../enums/EMessageStatus';

export interface IMessage {
  id: string;
  conversationId: string;
  senderId: string;
  body: string;
  status: EMessageStatus;
  createdAt: Date;
}
