import { IThrowedError, serviceLogErrorHandler } from '@sauvvitech/st-packages';
import { EErrorCode } from '../../../domain/common/errors/enums/EErrorCode';
import { IChatBlock } from '../../../domain/listing-chat/entity/interfaces/chat-block.interface';
import {
  IChatBlockRepositoryRead,
  IChatBlockRepositoryWrite,
} from '../../../domain/listing-chat/repository/chat-block.repository.read';
import { ListingChatBlockModel } from '../../db/mongo/models/listing-chat-block.model';
import { dbToInternal, internalToDb } from './adapters/chat-block.adapter';

export class ChatBlockRepositoryRead implements IChatBlockRepositoryRead {
  async findBlock(
    blockerId: string,
    blockedUserId: string,
  ): Promise<IChatBlock | null> {
    try {
      const doc = await ListingChatBlockModel.findOne({
        blockerId,
        blockedUserId,
      });
      return doc ? dbToInternal(doc) : null;
    } catch (error: unknown) {
      serviceLogErrorHandler(error instanceof Error ? error : new Error(String(error)), {
        eventName: 'ChatBlockRepositoryRead.findBlock',
        eventData: { blockerId, blockedUserId },
      });
      throw {
        status: 500,
        errorCode: EErrorCode.DATABASE_ERROR,
      } as IThrowedError;
    }
  }

  async isBlockedBetween(userIdA: string, userIdB: string): Promise<boolean> {
    try {
      const doc = await ListingChatBlockModel.findOne({
        $or: [
          { blockerId: userIdA, blockedUserId: userIdB },
          { blockerId: userIdB, blockedUserId: userIdA },
        ],
      });
      return doc !== null;
    } catch (error: unknown) {
      serviceLogErrorHandler(error instanceof Error ? error : new Error(String(error)), {
        eventName: 'ChatBlockRepositoryRead.isBlockedBetween',
        eventData: { userIdA, userIdB },
      });
      throw {
        status: 500,
        errorCode: EErrorCode.DATABASE_ERROR,
      } as IThrowedError;
    }
  }
}

export class ChatBlockRepositoryWrite implements IChatBlockRepositoryWrite {
  async upsertBlock(block: IChatBlock): Promise<IChatBlock> {
    try {
      const doc = await ListingChatBlockModel.findOneAndUpdate(
        { blockerId: block.blockerId, blockedUserId: block.blockedUserId },
        { $set: internalToDb(block) },
        { upsert: true, new: true, setDefaultsOnInsert: true },
      );
      return dbToInternal(doc);
    } catch (error: unknown) {
      serviceLogErrorHandler(error instanceof Error ? error : new Error(String(error)), {
        eventName: 'ChatBlockRepositoryWrite.upsertBlock',
        eventData: { id: block.id },
      });
      throw {
        status: 500,
        errorCode: EErrorCode.DATABASE_ERROR,
      } as IThrowedError;
    }
  }
}
