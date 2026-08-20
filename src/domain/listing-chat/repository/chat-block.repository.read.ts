import { IChatBlock } from '../entity/interfaces/chat-block.interface';

export interface IChatBlockRepositoryRead {
  findBlock(blockerId: string, blockedUserId: string): Promise<IChatBlock | null>;
  isBlockedBetween(userIdA: string, userIdB: string): Promise<boolean>;
}

export interface IChatBlockRepositoryWrite {
  upsertBlock(block: IChatBlock): Promise<IChatBlock>;
}
