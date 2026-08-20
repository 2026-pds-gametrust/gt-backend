import { IThrowedError } from '@sauvvitech/st-packages';
import { randomUUID } from 'crypto';
import { Logger } from 'traceability';
import { assertActorPresent } from '../../common/auth/actor-authorization';
import { EErrorCode } from '../../common/errors/enums/EErrorCode';
import { IActorContext } from '../../common/types/actor-context';
import { IProfileRepositoryRead } from '../../identity/repository/profile.repository.read';
import { EListingStatus } from '../../listings/entity/enums/EListingStatus';
import { IListingRepositoryRead } from '../../listings/repository/listing.repository.read';
import { ChatBlockServiceEntity } from '../entity/chat-block.entity';
import { ChatReportServiceEntity } from '../entity/chat-report.entity';
import { ConversationServiceEntity } from '../entity/conversation.entity';
import { MessageServiceEntity } from '../entity/message.entity';
import { EChatReportTargetType } from '../entity/enums/EChatReportTargetType';
import { EConversationStatus } from '../entity/enums/EConversationStatus';
import { EMessageStatus } from '../entity/enums/EMessageStatus';
import { IChatReport } from '../entity/interfaces/chat-report.interface';
import { IConversation } from '../entity/interfaces/conversation.interface';
import { IMessage } from '../entity/interfaces/message.interface';
import { IChatRealtimePublisher } from '../messaging/chat-realtime.publisher.interface';
import {
  IChatBlockRepositoryRead,
  IChatBlockRepositoryWrite,
} from '../repository/chat-block.repository.read';
import {
  IChatReportRepositoryRead,
  IChatReportRepositoryWrite,
} from '../repository/chat-report.repository.read';
import {
  IConversationRepositoryRead,
  IConversationRepositoryWrite,
} from '../repository/conversation.repository.read';
import {
  IMessageRepositoryRead,
  IMessageRepositoryWrite,
} from '../repository/message.repository.read';
import { applyContactFilter } from './contact-filter.util';
import {
  IChatReportPage,
  IConversationPage,
  IConversationSummary,
  IListingChatService,
  IMessagePage,
  IParamsListingChatService,
} from './listing-chat.service.interface';

const DEFAULT_CONVERSATION_LIMIT = 20;
const MAX_CONVERSATION_LIMIT = 50;
const DEFAULT_MESSAGE_LIMIT = 50;
const MAX_MESSAGE_LIMIT = 50;
const DEFAULT_REPORT_LIMIT = 20;
const MAX_REPORT_LIMIT = 50;
const PREVIEW_MAX_LENGTH = 120;

export class ListingChatService implements IListingChatService {
  private readonly conversationRepositoryRead: IConversationRepositoryRead;
  private readonly conversationRepositoryWrite: IConversationRepositoryWrite;
  private readonly messageRepositoryRead: IMessageRepositoryRead;
  private readonly messageRepositoryWrite: IMessageRepositoryWrite;
  private readonly chatBlockRepositoryRead: IChatBlockRepositoryRead;
  private readonly chatBlockRepositoryWrite: IChatBlockRepositoryWrite;
  private readonly chatReportRepositoryRead: IChatReportRepositoryRead;
  private readonly chatReportRepositoryWrite: IChatReportRepositoryWrite;
  private readonly listingRepositoryRead: IListingRepositoryRead;
  private readonly profileRepositoryRead: IProfileRepositoryRead;
  private readonly chatRealtimePublisher: IChatRealtimePublisher;

  constructor(params: IParamsListingChatService) {
    this.conversationRepositoryRead = params.conversationRepositoryRead;
    this.conversationRepositoryWrite = params.conversationRepositoryWrite;
    this.messageRepositoryRead = params.messageRepositoryRead;
    this.messageRepositoryWrite = params.messageRepositoryWrite;
    this.chatBlockRepositoryRead = params.chatBlockRepositoryRead;
    this.chatBlockRepositoryWrite = params.chatBlockRepositoryWrite;
    this.chatReportRepositoryRead = params.chatReportRepositoryRead;
    this.chatReportRepositoryWrite = params.chatReportRepositoryWrite;
    this.listingRepositoryRead = params.listingRepositoryRead;
    this.profileRepositoryRead = params.profileRepositoryRead;
    this.chatRealtimePublisher = params.chatRealtimePublisher;
  }

  async openConversation(
    listingId: string,
    actor: IActorContext,
  ): Promise<IConversation> {
    assertActorPresent(actor);
    const buyerId = actor.actorId;

    const listing = await this.listingRepositoryRead.findListingById(listingId);
    if (!listing || listing.status !== EListingStatus.PUBLISHED) {
      throw {
        status: 403,
        errorCode: EErrorCode.CHAT_NOT_ELIGIBLE,
        message: 'Listing is not eligible for chat',
        details: { listingId },
      } as IThrowedError;
    }

    if (buyerId === listing.sellerId) {
      throw {
        status: 403,
        errorCode: EErrorCode.CHAT_NOT_ELIGIBLE,
        message: 'Seller cannot open conversation on own listing',
        details: { listingId, sellerId: listing.sellerId },
      } as IThrowedError;
    }

    const existing =
      await this.conversationRepositoryRead.findByListingAndBuyer(
        listingId,
        buyerId,
      );
    if (existing) {
      return existing;
    }

    const now = new Date();
    const entity = new ConversationServiceEntity({
      id: randomUUID(),
      listingId,
      buyerId,
      sellerId: listing.sellerId,
      status: EConversationStatus.ACTIVE,
      buyerUnreadCount: 0,
      sellerUnreadCount: 0,
      createdAt: now,
    });

    try {
      const created =
        await this.conversationRepositoryWrite.createConversation(entity);
      Logger.info(
        JSON.stringify({
          eventName: 'listing_chat.conversation.created',
          conversationId: created.id,
          listingId: created.listingId,
          buyerId: created.buyerId,
        }),
      );
      return created;
    } catch {
      const raced =
        await this.conversationRepositoryRead.findByListingAndBuyer(
          listingId,
          buyerId,
        );
      if (raced) {
        return raced;
      }
      throw {
        status: 500,
        errorCode: EErrorCode.DATABASE_ERROR,
      } as IThrowedError;
    }
  }

  async getConversation(
    conversationId: string,
    actor: IActorContext,
  ): Promise<IConversation> {
    const conversation = await this.getConversationForParticipant(
      conversationId,
      actor,
    );
    return conversation;
  }

  async listConversations(
    actor: IActorContext,
    limit?: number,
    cursor?: string,
  ): Promise<IConversationPage> {
    assertActorPresent(actor);
    const clampedLimit = this.clampLimit(
      limit,
      DEFAULT_CONVERSATION_LIMIT,
      MAX_CONVERSATION_LIMIT,
    );
    const decodedCursor = cursor
      ? this.decodeConversationCursor(cursor)
      : undefined;

    const conversations =
      await this.conversationRepositoryRead.listByParticipant({
        actorId: actor.actorId,
        limit: clampedLimit + 1,
        cursor: decodedCursor,
      });

    const hasMore = conversations.length > clampedLimit;
    const pageItems = hasMore
      ? conversations.slice(0, clampedLimit)
      : conversations;

    const listingIds = [...new Set(pageItems.map((c) => c.listingId))];
    const listings = await this.listingRepositoryRead.findListingsByIds(
      listingIds,
    );
    const listingMap = new Map(listings.map((l) => [l.id, l]));

    const otherUserIds = pageItems.map((c) =>
      c.buyerId === actor.actorId ? c.sellerId : c.buyerId,
    );
    const profiles =
      await this.profileRepositoryRead.findProfilesByUserIds(otherUserIds);
    const profileMap = new Map(profiles.map((p) => [p.userId, p]));

    const items: IConversationSummary[] = pageItems.map((conversation) => {
      const listing = listingMap.get(conversation.listingId);
      const otherUserId =
        conversation.buyerId === actor.actorId
          ? conversation.sellerId
          : conversation.buyerId;
      const profile = profileMap.get(otherUserId);
      return {
        ...conversation,
        listing: {
          id: conversation.listingId,
          title: listing?.title ?? '',
        },
        otherParticipant: {
          userId: otherUserId,
          displayName: profile?.displayName,
        },
      };
    });

    let nextCursor: string | undefined;
    if (hasMore && pageItems.length > 0) {
      const last = pageItems[pageItems.length - 1];
      nextCursor = this.encodeConversationCursor({
        lastMessageAt: (last.lastMessageAt ?? last.createdAt).toISOString(),
        id: last.id,
      });
    }

    return { items, nextCursor };
  }

  async sendMessage(
    conversationId: string,
    body: string,
    actor: IActorContext,
  ): Promise<IMessage> {
    assertActorPresent(actor);
    const conversation = await this.getConversationForParticipant(
      conversationId,
      actor,
    );

    if (conversation.status === EConversationStatus.BLOCKED) {
      throw {
        status: 409,
        errorCode: EErrorCode.CHAT_CONVERSATION_BLOCKED,
        message: 'Conversation is blocked',
        details: { conversationId },
      } as IThrowedError;
    }

    const otherUserId = this.getOtherParticipantId(conversation, actor.actorId);
    const blocked = await this.chatBlockRepositoryRead.isBlockedBetween(
      actor.actorId,
      otherUserId,
    );
    if (blocked) {
      throw {
        status: 409,
        errorCode: EErrorCode.CHAT_CONVERSATION_BLOCKED,
        message: 'Users are blocked',
        details: { conversationId },
      } as IThrowedError;
    }

    const trimmed = body?.trim() ?? '';
    if (trimmed.length === 0) {
      throw {
        status: 422,
        errorCode: EErrorCode.FIELD_INVALID,
        message: 'Message body must not be empty',
      } as IThrowedError;
    }

    const filterResult = applyContactFilter(trimmed);
    if (filterResult.outcome === 'REJECT') {
      Logger.info(
        JSON.stringify({
          eventName: 'listing_chat.content.rejected',
          conversationId,
          senderId: actor.actorId,
        }),
      );
      throw {
        status: 422,
        errorCode: EErrorCode.CHAT_CONTENT_REJECTED,
        message: 'Message content rejected',
        details: { conversationId },
      } as IThrowedError;
    }

    let entity: MessageServiceEntity;
    try {
      entity = new MessageServiceEntity({
        id: randomUUID(),
        conversationId,
        senderId: actor.actorId,
        body: filterResult.maskedBody,
        status: EMessageStatus.VISIBLE,
        createdAt: new Date(),
      });
    } catch (error: unknown) {
      throw {
        status: 422,
        errorCode:
          error instanceof Error && error.message.includes('exceed')
            ? EErrorCode.FIELD_MAX_LENGTH
            : EErrorCode.FIELD_INVALID,
      } as IThrowedError;
    }

    const created = await this.messageRepositoryWrite.createMessage(entity);

    const preview =
      created.body.length > PREVIEW_MAX_LENGTH
        ? `${created.body.slice(0, PREVIEW_MAX_LENGTH)}…`
        : created.body;

    await this.conversationRepositoryWrite.updateConversation(conversationId, {
      lastMessageAt: created.createdAt,
      lastMessagePreview: preview,
      updatedAt: new Date(),
    });

    const unreadField =
      actor.actorId === conversation.buyerId
        ? 'sellerUnreadCount'
        : 'buyerUnreadCount';
    await this.conversationRepositoryWrite.incrementUnread(
      conversationId,
      unreadField,
    );

    Logger.info(
      JSON.stringify({
        eventName: 'listing_chat.message.sent',
        messageId: created.id,
        conversationId,
        senderId: actor.actorId,
        maskedApplied: filterResult.maskedBody !== trimmed,
      }),
    );

    await this.chatRealtimePublisher.publishMessageCreated({
      conversationId,
      message: created,
      recipientUserIds: [conversation.buyerId, conversation.sellerId],
    });

    return created;
  }

  async listMessages(
    conversationId: string,
    actor: IActorContext,
    limit?: number,
    before?: string,
  ): Promise<IMessagePage> {
    assertActorPresent(actor);
    await this.getConversationForParticipant(conversationId, actor);

    const clampedLimit = this.clampLimit(
      limit,
      DEFAULT_MESSAGE_LIMIT,
      MAX_MESSAGE_LIMIT,
    );
    const decodedBefore = before ? this.decodeMessageCursor(before) : undefined;

    const messages = await this.messageRepositoryRead.listMessages({
      conversationId,
      limit: clampedLimit + 1,
      before: decodedBefore,
    });

    const hasMore = messages.length > clampedLimit;
    const pageItems = hasMore
      ? messages.slice(-clampedLimit)
      : messages;

    await this.resetUnreadForActor(conversationId, actor.actorId);

    let nextCursor: string | undefined;
    if (hasMore && pageItems.length > 0) {
      const oldest = pageItems[0];
      nextCursor = this.encodeMessageCursor({
        createdAt: oldest.createdAt.toISOString(),
        id: oldest.id,
      });
    }

    return { items: pageItems, nextCursor };
  }

  async markConversationRead(
    conversationId: string,
    actor: IActorContext,
  ): Promise<void> {
    assertActorPresent(actor);
    await this.getConversationForParticipant(conversationId, actor);
    await this.resetUnreadForActor(conversationId, actor.actorId);
  }

  async blockParticipant(
    conversationId: string,
    actor: IActorContext,
  ): Promise<void> {
    assertActorPresent(actor);
    const conversation = await this.getConversationForParticipant(
      conversationId,
      actor,
    );

    const blockedUserId = this.getOtherParticipantId(
      conversation,
      actor.actorId,
    );

    const blockEntity = new ChatBlockServiceEntity({
      id: randomUUID(),
      blockerId: actor.actorId,
      blockedUserId,
      createdAt: new Date(),
    });

    await this.chatBlockRepositoryWrite.upsertBlock(blockEntity);

    const affected =
      await this.conversationRepositoryWrite.setStatusForUserPair(
        actor.actorId,
        blockedUserId,
        EConversationStatus.BLOCKED,
      );

    Logger.info(
      JSON.stringify({
        eventName: 'listing_chat.block.created',
        blockerId: actor.actorId,
        blockedUserId,
        conversationsAffected: affected,
      }),
    );
  }

  async createReport(
    conversationId: string,
    actor: IActorContext,
    reason: string,
    targetType: EChatReportTargetType,
    targetId?: string,
  ): Promise<IChatReport> {
    assertActorPresent(actor);
    await this.getConversationForParticipant(conversationId, actor);

    const resolvedTargetId =
      targetType === EChatReportTargetType.CONVERSATION
        ? conversationId
        : targetId;

    if (!resolvedTargetId?.trim()) {
      throw {
        status: 422,
        errorCode: EErrorCode.FIELD_INVALID,
        message: 'targetId is required for message reports',
      } as IThrowedError;
    }

    if (targetType === EChatReportTargetType.MESSAGE) {
      const message =
        await this.messageRepositoryRead.findMessageByIdAndConversation(
          resolvedTargetId,
          conversationId,
        );
      if (!message) {
        throw {
          status: 404,
          errorCode: EErrorCode.RESOURCE_NOT_FOUND,
          message: 'Message not found',
          details: { messageId: resolvedTargetId },
        } as IThrowedError;
      }
    }

    let reportEntity: ChatReportServiceEntity;
    try {
      reportEntity = new ChatReportServiceEntity({
        id: randomUUID(),
        reporterId: actor.actorId,
        targetType,
        targetId: resolvedTargetId,
        conversationId,
        reason,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    } catch (error: unknown) {
      throw {
        status: 422,
        errorCode:
          error instanceof Error && error.message.includes('exceed')
            ? EErrorCode.FIELD_MAX_LENGTH
            : EErrorCode.FIELD_INVALID,
      } as IThrowedError;
    }

    const upserted =
      await this.chatReportRepositoryWrite.upsertReport(reportEntity);

    Logger.info(
      JSON.stringify({
        eventName: 'listing_chat.report.created',
        reportId: upserted.id,
        targetType: upserted.targetType,
      }),
    );

    return upserted;
  }

  async listChatReports(
    limit?: number,
    cursor?: string,
  ): Promise<IChatReportPage> {
    const clampedLimit = this.clampLimit(
      limit,
      DEFAULT_REPORT_LIMIT,
      MAX_REPORT_LIMIT,
    );
    const decodedCursor = cursor ? this.decodeReportCursor(cursor) : undefined;

    const reports = await this.chatReportRepositoryRead.listReports({
      limit: clampedLimit + 1,
      cursor: decodedCursor,
    });

    const hasMore = reports.length > clampedLimit;
    const pageItems = hasMore ? reports.slice(0, clampedLimit) : reports;

    let nextCursor: string | undefined;
    if (hasMore && pageItems.length > 0) {
      const last = pageItems[pageItems.length - 1];
      nextCursor = this.encodeReportCursor({
        createdAt: last.createdAt.toISOString(),
        id: last.id,
      });
    }

    return { items: pageItems, nextCursor };
  }

  async assertConversationParticipantForRealtime(
    conversationId: string,
    actorId: string,
  ): Promise<void> {
    const conversation =
      await this.conversationRepositoryRead.findConversationById(
        conversationId,
      );
    if (!conversation) {
      throw {
        status: 404,
        errorCode: EErrorCode.RESOURCE_NOT_FOUND,
        message: 'Conversation not found',
      } as IThrowedError;
    }
    if (
      conversation.buyerId !== actorId &&
      conversation.sellerId !== actorId
    ) {
      throw {
        status: 404,
        errorCode: EErrorCode.RESOURCE_NOT_FOUND,
        message: 'Conversation not found',
      } as IThrowedError;
    }
  }

  private async getConversationForParticipant(
    conversationId: string,
    actor: IActorContext,
  ): Promise<IConversation> {
    assertActorPresent(actor);
    const conversation =
      await this.conversationRepositoryRead.findConversationById(
        conversationId,
      );
    this.assertConversationParticipant(conversation, actor);
    return conversation!;
  }

  private assertConversationParticipant(
    conversation: IConversation | null,
    actor: IActorContext,
  ): void {
    if (
      !conversation ||
      (conversation.buyerId !== actor.actorId &&
        conversation.sellerId !== actor.actorId)
    ) {
      throw {
        status: 404,
        errorCode: EErrorCode.RESOURCE_NOT_FOUND,
        message: 'Conversation not found',
      } as IThrowedError;
    }
  }

  private getOtherParticipantId(
    conversation: IConversation,
    actorId: string,
  ): string {
    return conversation.buyerId === actorId
      ? conversation.sellerId
      : conversation.buyerId;
  }

  private async resetUnreadForActor(
    conversationId: string,
    actorId: string,
  ): Promise<void> {
    const conversation =
      await this.conversationRepositoryRead.findConversationById(
        conversationId,
      );
    if (!conversation) return;

    const field =
      actorId === conversation.buyerId
        ? 'buyerUnreadCount'
        : actorId === conversation.sellerId
          ? 'sellerUnreadCount'
          : undefined;
    if (!field) return;

    await this.conversationRepositoryWrite.resetUnread(conversationId, field);
  }

  private clampLimit(
    limit: number | undefined,
    defaultLimit: number,
    maxLimit: number,
  ): number {
    const parsed = Number(limit ?? defaultLimit);
    if (!Number.isFinite(parsed) || parsed < 1) return defaultLimit;
    return Math.min(Math.floor(parsed), maxLimit);
  }

  private encodeConversationCursor(params: {
    lastMessageAt: string;
    id: string;
  }): string {
    return Buffer.from(JSON.stringify(params)).toString('base64url');
  }

  private decodeConversationCursor(cursor: string): {
    lastMessageAt: string;
    id: string;
  } {
    const parsed = this.parseCursorPayload(cursor, 'Invalid cursor');
    const lastMessageAt = this.assertValidIsoDate(
      parsed.lastMessageAt,
      'Invalid cursor',
    );
    const id = this.assertValidCursorId(parsed.id, 'Invalid cursor');
    return { lastMessageAt, id };
  }

  private encodeMessageCursor(params: {
    createdAt: string;
    id: string;
  }): string {
    return Buffer.from(JSON.stringify(params)).toString('base64url');
  }

  private decodeMessageCursor(cursor: string): {
    createdAt: string;
    id: string;
  } {
    const parsed = this.parseCursorPayload(cursor, 'Invalid before cursor');
    const createdAt = this.assertValidIsoDate(
      parsed.createdAt,
      'Invalid before cursor',
    );
    const id = this.assertValidCursorId(parsed.id, 'Invalid before cursor');
    return { createdAt, id };
  }

  private encodeReportCursor(params: {
    createdAt: string;
    id: string;
  }): string {
    return Buffer.from(JSON.stringify(params)).toString('base64url');
  }

  private decodeReportCursor(cursor: string): {
    createdAt: string;
    id: string;
  } {
    const parsed = this.parseCursorPayload(cursor, 'Invalid cursor');
    const createdAt = this.assertValidIsoDate(parsed.createdAt, 'Invalid cursor');
    const id = this.assertValidCursorId(parsed.id, 'Invalid cursor');
    return { createdAt, id };
  }

  private parseCursorPayload(
    cursor: string,
    invalidMessage: string,
  ): Record<string, unknown> {
    try {
      const parsed = JSON.parse(
        Buffer.from(cursor, 'base64url').toString('utf8'),
      );
      if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
        throw new Error('Invalid cursor shape');
      }
      return parsed as Record<string, unknown>;
    } catch {
      throw {
        status: 422,
        errorCode: EErrorCode.FIELD_INVALID,
        message: invalidMessage,
      } as IThrowedError;
    }
  }

  private assertValidIsoDate(value: unknown, invalidMessage: string): string {
    if (typeof value !== 'string' || Number.isNaN(Date.parse(value))) {
      throw {
        status: 422,
        errorCode: EErrorCode.FIELD_INVALID,
        message: invalidMessage,
      } as IThrowedError;
    }
    return value;
  }

  private assertValidCursorId(value: unknown, invalidMessage: string): string {
    if (typeof value !== 'string' || value.trim().length === 0) {
      throw {
        status: 422,
        errorCode: EErrorCode.FIELD_INVALID,
        message: invalidMessage,
      } as IThrowedError;
    }
    return value.trim();
  }
}
