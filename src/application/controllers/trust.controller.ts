import {
  EUserGroup,
  authorizeByGroup,
  handleTranslatedError,
} from '@sauvvitech/st-packages';
import { Request, Response, Router } from 'express';
import { IController } from '../../domain/server/interfaces/IController';
import { SellerLevelService } from '../../domain/trust/service/seller-level.service';
import { TrustEventService } from '../../domain/trust/service/trust-event.service';
import { TrustScoreService } from '../../domain/trust/service/trust-score.service';
import { ErrorCatalog } from '../../infraestructure/i18n/error-catalog';
import { requireAccessToken } from '../middleware/require-access-token';

export class TrustController implements IController {
  router: Router;
  private readonly trustEventService: TrustEventService;
  private readonly trustScoreService: TrustScoreService;
  private readonly sellerLevelService: SellerLevelService;

  constructor(
    trustEventService: TrustEventService,
    trustScoreService: TrustScoreService,
    sellerLevelService: SellerLevelService,
  ) {
    this.trustEventService = trustEventService;
    this.trustScoreService = trustScoreService;
    this.sellerLevelService = sellerLevelService;
    this.router = Router();
    this.initRoutes();
  }

  initRoutes() {
    this.router.get('/trust-events', this.listTrustEvents);
    this.router.post(
      '/trust-events',
      requireAccessToken,
      authorizeByGroup([EUserGroup.BACKOFFICE, EUserGroup.ADMIN]),
      this.appendTrustEvent,
    );
    this.router.get(
      '/trust-scores/:sellerId',
      this.getTrustScoreBySellerId,
    );
    this.router.post(
      '/trust-scores/:sellerId/recompute',
      requireAccessToken,
      authorizeByGroup([EUserGroup.BACKOFFICE, EUserGroup.ADMIN]),
      this.recomputeTrustScore,
    );
    this.router.get(
      '/seller-levels/:sellerId',
      this.getSellerLevelBySellerId,
    );
  }

  listTrustEvents = async (req: Request, res: Response): Promise<void> => {
    try {
      const sellerId = req.query.sellerId as string;
      const events = sellerId
        ? await this.trustEventService.listBySellerId(sellerId)
        : [];
      res.status(200).json(events);
    } catch (error) {
      handleTranslatedError(error, ErrorCatalog, res);
    }
  };

  appendTrustEvent = async (req: Request, res: Response): Promise<void> => {
    try {
      const created = await this.trustEventService.appendTrustEvent({
        id: req.body.id,
        sellerId: req.body.sellerId,
        type: req.body.type,
        sourceEventId: req.body.sourceEventId,
        payload: req.body.payload ?? {},
        occurredAt: req.body.occurredAt
          ? new Date(req.body.occurredAt)
          : undefined,
      });
      res.status(201).json(created);
    } catch (error) {
      handleTranslatedError(error, ErrorCatalog, res);
    }
  };

  getTrustScoreBySellerId = async (
    req: Request<{ sellerId: string }>,
    res: Response,
  ): Promise<void> => {
    try {
      const score = await this.trustScoreService.getTrustScoreBySellerId(
        req.params.sellerId,
      );
      res.status(200).json(score);
    } catch (error) {
      handleTranslatedError(error, ErrorCatalog, res);
    }
  };

  recomputeTrustScore = async (
    req: Request<{ sellerId: string }>,
    res: Response,
  ): Promise<void> => {
    try {
      const score = await this.trustScoreService.recomputeForSeller(
        req.params.sellerId,
      );
      res.status(200).json(score);
    } catch (error) {
      handleTranslatedError(error, ErrorCatalog, res);
    }
  };

  getSellerLevelBySellerId = async (
    req: Request<{ sellerId: string }>,
    res: Response,
  ): Promise<void> => {
    try {
      const level = await this.sellerLevelService.getSellerLevelBySellerId(
        req.params.sellerId,
      );
      res.status(200).json(level);
    } catch (error) {
      handleTranslatedError(error, ErrorCatalog, res);
    }
  };

  public getRoutes(): Router {
    return this.router;
  }
}
