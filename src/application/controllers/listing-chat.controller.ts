import { authorizeByGroup, EUserGroup } from '@sauvvitech/st-packages';
import { handleTranslatedError } from '@sauvvitech/st-packages';
import { Request, Response, Router } from 'express';
import { EChatReportTargetType } from '../../domain/listing-chat/entity/enums/EChatReportTargetType';
import { ListingChatService } from '../../domain/listing-chat/service/listing-chat.service';
import { IController } from '../../domain/server/interfaces/IController';
import { ErrorCatalog } from '../../infraestructure/i18n/error-catalog';
import {
  chatOpenConversationRateLimit,
  chatReportRateLimit,
  chatSendRateLimit,
} from '../middleware/listing-chat-rate-limit';
import { requireAccessToken } from '../middleware/require-access-token';

export class ListingChatController implements IController {
  router: Router;
  private readonly listingChatService: ListingChatService;

  constructor(listingChatService: ListingChatService) {
    this.listingChatService = listingChatService;
    this.router = Router();
    this.initRoutes();
  }

  initRoutes() {
    this.router.post(
      '/conversations',
      requireAccessToken,
      chatOpenConversationRateLimit,
      this.openConversation,
    );
    this.router.get(
      '/conversations',
      requireAccessToken,
      this.listConversations,
    );
    this.router.get(
      '/conversations/:conversationId',
      requireAccessToken,
      this.getConversation,
    );
    this.router.get(
      '/conversations/:conversationId/messages',
      requireAccessToken,
      this.listMessages,
    );
    this.router.post(
      '/conversations/:conversationId/messages',
      requireAccessToken,
      chatSendRateLimit,
      this.sendMessage,
    );
    this.router.post(
      '/conversations/:conversationId/read',
      requireAccessToken,
      this.markConversationRead,
    );
    this.router.post(
      '/conversations/:conversationId/block',
      requireAccessToken,
      this.blockParticipant,
    );
    this.router.post(
      '/conversations/:conversationId/reports',
      requireAccessToken,
      chatReportRateLimit,
      this.reportConversation,
    );
    this.router.post(
      '/conversations/:conversationId/messages/:messageId/reports',
      requireAccessToken,
      chatReportRateLimit,
      this.reportMessage,
    );
    this.router.get(
      '/chat-reports',
      requireAccessToken,
      authorizeByGroup([EUserGroup.BACKOFFICE, EUserGroup.ADMIN]),
      this.listChatReports,
    );
  }

  openConversation = async (req: Request, res: Response): Promise<void> => {
    try {
      const conversation = await this.listingChatService.openConversation(
        req.body.listingId,
        req.actor,
      );
      res.status(201).json(conversation);
    } catch (error) {
      handleTranslatedError(error, ErrorCatalog, res);
    }
  };

  listConversations = async (req: Request, res: Response): Promise<void> => {
    try {
      const limit = req.query.limit
        ? Number(req.query.limit)
        : undefined;
      const cursor =
        typeof req.query.cursor === 'string' ? req.query.cursor : undefined;
      const page = await this.listingChatService.listConversations(
        req.actor,
        limit,
        cursor,
      );
      res.status(200).json(page);
    } catch (error) {
      handleTranslatedError(error, ErrorCatalog, res);
    }
  };

  getConversation = async (
    req: Request<{ conversationId: string }>,
    res: Response,
  ): Promise<void> => {
    try {
      const conversation = await this.listingChatService.getConversation(
        req.params.conversationId,
        req.actor,
      );
      res.status(200).json(conversation);
    } catch (error) {
      handleTranslatedError(error, ErrorCatalog, res);
    }
  };

  listMessages = async (
    req: Request<{ conversationId: string }>,
    res: Response,
  ): Promise<void> => {
    try {
      const limit = req.query.limit
        ? Number(req.query.limit)
        : undefined;
      const before =
        typeof req.query.before === 'string' ? req.query.before : undefined;
      const page = await this.listingChatService.listMessages(
        req.params.conversationId,
        req.actor,
        limit,
        before,
      );
      res.status(200).json(page);
    } catch (error) {
      handleTranslatedError(error, ErrorCatalog, res);
    }
  };

  sendMessage = async (
    req: Request<{ conversationId: string }>,
    res: Response,
  ): Promise<void> => {
    try {
      const message = await this.listingChatService.sendMessage(
        req.params.conversationId,
        req.body.body,
        req.actor,
      );
      res.status(201).json(message);
    } catch (error) {
      handleTranslatedError(error, ErrorCatalog, res);
    }
  };

  markConversationRead = async (
    req: Request<{ conversationId: string }>,
    res: Response,
  ): Promise<void> => {
    try {
      await this.listingChatService.markConversationRead(
        req.params.conversationId,
        req.actor,
      );
      res.status(204).send();
    } catch (error) {
      handleTranslatedError(error, ErrorCatalog, res);
    }
  };

  blockParticipant = async (
    req: Request<{ conversationId: string }>,
    res: Response,
  ): Promise<void> => {
    try {
      await this.listingChatService.blockParticipant(
        req.params.conversationId,
        req.actor,
      );
      res.status(204).send();
    } catch (error) {
      handleTranslatedError(error, ErrorCatalog, res);
    }
  };

  reportConversation = async (
    req: Request<{ conversationId: string }>,
    res: Response,
  ): Promise<void> => {
    try {
      const report = await this.listingChatService.createReport(
        req.params.conversationId,
        req.actor,
        req.body.reason,
        EChatReportTargetType.CONVERSATION,
      );
      res.status(201).json(report);
    } catch (error) {
      handleTranslatedError(error, ErrorCatalog, res);
    }
  };

  reportMessage = async (
    req: Request<{ conversationId: string; messageId: string }>,
    res: Response,
  ): Promise<void> => {
    try {
      const report = await this.listingChatService.createReport(
        req.params.conversationId,
        req.actor,
        req.body.reason,
        EChatReportTargetType.MESSAGE,
        req.params.messageId,
      );
      res.status(201).json(report);
    } catch (error) {
      handleTranslatedError(error, ErrorCatalog, res);
    }
  };

  listChatReports = async (req: Request, res: Response): Promise<void> => {
    try {
      const limit = req.query.limit
        ? Number(req.query.limit)
        : undefined;
      const cursor =
        typeof req.query.cursor === 'string' ? req.query.cursor : undefined;
      const page = await this.listingChatService.listChatReports(limit, cursor);
      res.status(200).json(page);
    } catch (error) {
      handleTranslatedError(error, ErrorCatalog, res);
    }
  };

  public getRoutes(): Router {
    return this.router;
  }
}
