import { requireNonEmptyString } from '../../common/types/required-string';
import { EMessageStatus } from './enums/EMessageStatus';
import { IMessage } from './interfaces/message.interface';

const MAX_BODY_LENGTH = 2000;

export class MessageServiceEntity implements IMessage {
  id: string;
  conversationId: string;
  senderId: string;
  body: string;
  status: EMessageStatus;
  createdAt: Date;

  constructor(message: IMessage) {
    this.validate(message);
    this.id = message.id;
    this.conversationId = message.conversationId.trim();
    this.senderId = message.senderId.trim();
    this.body = message.body;
    this.status = message.status;
    this.createdAt = message.createdAt;
  }

  private validate(message: IMessage): void {
    requireNonEmptyString(message.id, 'id');
    requireNonEmptyString(message.conversationId, 'conversationId');
    requireNonEmptyString(message.senderId, 'senderId');
    if (!message.status) throw new Error('status is required');
    if (!message.createdAt) throw new Error('createdAt is required');

    const trimmed = message.body?.trim() ?? '';
    if (trimmed.length === 0) {
      throw new Error('body must not be empty');
    }
    if (trimmed.length > MAX_BODY_LENGTH) {
      throw new Error(`body must not exceed ${MAX_BODY_LENGTH} characters`);
    }
  }
}

export { MAX_BODY_LENGTH as MESSAGE_MAX_BODY_LENGTH };
