import { requireNonEmptyString } from '../../common/types/required-string';
import { IChatBlock } from './interfaces/chat-block.interface';

export class ChatBlockServiceEntity implements IChatBlock {
  id: string;
  blockerId: string;
  blockedUserId: string;
  createdAt: Date;

  constructor(block: IChatBlock) {
    this.validate(block);
    this.id = block.id;
    this.blockerId = block.blockerId.trim();
    this.blockedUserId = block.blockedUserId.trim();
    this.createdAt = block.createdAt;
  }

  private validate(block: IChatBlock): void {
    requireNonEmptyString(block.id, 'id');
    requireNonEmptyString(block.blockerId, 'blockerId');
    requireNonEmptyString(block.blockedUserId, 'blockedUserId');
    if (!block.createdAt) throw new Error('createdAt is required');
    if (block.blockerId.trim() === block.blockedUserId.trim()) {
      throw new Error('blockerId and blockedUserId must differ');
    }
  }
}
