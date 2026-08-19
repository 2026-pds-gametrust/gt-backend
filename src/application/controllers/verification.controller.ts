import {
  EUserGroup,
  authorizeByGroup,
  handleTranslatedError,
} from '@sauvvitech/st-packages';
import { Request, Response, Router } from 'express';
import { IController } from '../../domain/server/interfaces/IController';
import { EvidenceItemService } from '../../domain/verification/service/evidence-item.service';
import { SealService } from '../../domain/verification/service/seal.service';
import { VerificationCaseService } from '../../domain/verification/service/verification-case.service';
import { ErrorCatalog } from '../../infraestructure/i18n/error-catalog';
import { requireAccessToken } from '../middleware/require-access-token';

export class VerificationController implements IController {
  router: Router;
  private readonly verificationCaseService: VerificationCaseService;
  private readonly evidenceItemService: EvidenceItemService;
  private readonly sealService: SealService;

  constructor(
    verificationCaseService: VerificationCaseService,
    evidenceItemService: EvidenceItemService,
    sealService: SealService,
  ) {
    this.verificationCaseService = verificationCaseService;
    this.evidenceItemService = evidenceItemService;
    this.sealService = sealService;
    this.router = Router();
    this.initRoutes();
  }

  initRoutes() {
    this.router.get(
      '/verification-cases',
      requireAccessToken,
      authorizeByGroup([EUserGroup.BACKOFFICE, EUserGroup.ADMIN]),
      this.listVerificationCases,
    );
    this.router.get(
      '/verification-cases/:id',
      requireAccessToken,
      authorizeByGroup([EUserGroup.BACKOFFICE, EUserGroup.ADMIN]),
      this.getVerificationCaseById,
    );
    this.router.post('/verification-cases', this.openVerificationCase);
    this.router.post(
      '/verification-cases/:id/assign',
      requireAccessToken,
      authorizeByGroup([EUserGroup.BACKOFFICE, EUserGroup.ADMIN]),
      this.assignReviewer,
    );
    this.router.post(
      '/verification-cases/:id/approve',
      requireAccessToken,
      authorizeByGroup([EUserGroup.BACKOFFICE, EUserGroup.ADMIN]),
      this.approveCase,
    );
    this.router.post(
      '/verification-cases/:id/reject',
      requireAccessToken,
      authorizeByGroup([EUserGroup.BACKOFFICE, EUserGroup.ADMIN]),
      this.rejectCase,
    );
    this.router.post(
      '/verification-cases/:id/request-changes',
      requireAccessToken,
      authorizeByGroup([EUserGroup.BACKOFFICE, EUserGroup.ADMIN]),
      this.requestChangesCase,
    );

    this.router.get(
      '/verification-cases/:caseId/evidence',
      this.listEvidence,
    );
    this.router.post(
      '/verification-cases/:caseId/evidence',
      this.addEvidence,
    );

    this.router.get('/seals', this.listSeals);
    this.router.get('/seals/:id', this.getSealById);
    this.router.post(
      '/seals/:id/revoke',
      requireAccessToken,
      authorizeByGroup([EUserGroup.BACKOFFICE, EUserGroup.ADMIN]),
      this.revokeSeal,
    );
  }

  listVerificationCases = async (
    req: Request,
    res: Response,
  ): Promise<void> => {
    try {
      const status =
        typeof req.query.status === 'string' ? req.query.status : undefined;
      const q = typeof req.query.q === 'string' ? req.query.q : undefined;
      const moderatorId =
        typeof req.query.moderatorId === 'string'
          ? req.query.moderatorId
          : undefined;
      const limit =
        req.query.limit !== undefined ? Number(req.query.limit) : undefined;
      const offset =
        req.query.offset !== undefined ? Number(req.query.offset) : undefined;
      const minScore =
        req.query.minScore !== undefined ? Number(req.query.minScore) : undefined;
      const maxScore =
        req.query.maxScore !== undefined ? Number(req.query.maxScore) : undefined;
      const hasAiScore =
        req.query.hasAiScore === 'true'
          ? true
          : req.query.hasAiScore === 'false'
            ? false
            : undefined;

      const page = await this.verificationCaseService.listModerationQueue({
        status: status as never,
        q,
        moderatorId,
        minScore,
        maxScore,
        hasAiScore,
        limit,
        offset,
      });
      res.status(200).json(page);
    } catch (error) {
      handleTranslatedError(error, ErrorCatalog, res);
    }
  };

  getVerificationCaseById = async (
    req: Request<{ id: string }>,
    res: Response,
  ): Promise<void> => {
    try {
      const verificationCase =
        await this.verificationCaseService.getVerificationCaseById(
          req.params.id,
        );
      res.status(200).json(verificationCase);
    } catch (error) {
      handleTranslatedError(error, ErrorCatalog, res);
    }
  };

  openVerificationCase = async (
    req: Request,
    res: Response,
  ): Promise<void> => {
    try {
      const created = await this.verificationCaseService.openCase({
        id: req.body.id,
        listingId: req.body.listingId,
        checklist: req.body.checklist,
      });
      res.status(201).json(created);
    } catch (error) {
      handleTranslatedError(error, ErrorCatalog, res);
    }
  };

  assignReviewer = async (
    req: Request<{ id: string }>,
    res: Response,
  ): Promise<void> => {
    try {
      const updated = await this.verificationCaseService.assignReviewer(
        req.params.id,
        { moderatorId: req.body.moderatorId },
      );
      res.status(200).json(updated);
    } catch (error) {
      handleTranslatedError(error, ErrorCatalog, res);
    }
  };

  approveCase = async (
    req: Request<{ id: string }>,
    res: Response,
  ): Promise<void> => {
    try {
      const updated = await this.verificationCaseService.approveCase(
        req.params.id,
        {
          decisionReason: req.body?.decisionReason,
          sealType: req.body?.sealType,
        },
      );
      res.status(200).json(updated);
    } catch (error) {
      handleTranslatedError(error, ErrorCatalog, res);
    }
  };

  rejectCase = async (
    req: Request<{ id: string }>,
    res: Response,
  ): Promise<void> => {
    try {
      const updated = await this.verificationCaseService.rejectCase(
        req.params.id,
        { reason: req.body.reason },
      );
      res.status(200).json(updated);
    } catch (error) {
      handleTranslatedError(error, ErrorCatalog, res);
    }
  };

  requestChangesCase = async (
    req: Request<{ id: string }>,
    res: Response,
  ): Promise<void> => {
    try {
      const updated = await this.verificationCaseService.requestChangesCase(
        req.params.id,
        {
          summary: req.body.summary,
          requiredChanges: req.body.requiredChanges,
        },
      );
      res.status(200).json(updated);
    } catch (error) {
      handleTranslatedError(error, ErrorCatalog, res);
    }
  };

  listEvidence = async (
    req: Request<{ caseId: string }>,
    res: Response,
  ): Promise<void> => {
    try {
      const items = await this.evidenceItemService.listByCaseId(
        req.params.caseId,
      );
      res.status(200).json(items);
    } catch (error) {
      handleTranslatedError(error, ErrorCatalog, res);
    }
  };

  addEvidence = async (
    req: Request<{ caseId: string }>,
    res: Response,
  ): Promise<void> => {
    try {
      const created = await this.evidenceItemService.addEvidence({
        id: req.body.id,
        caseId: req.params.caseId,
        type: req.body.type,
        storageKey: req.body.storageKey,
        assetId: req.body.assetId,
        contentHash: req.body.contentHash,
      });
      res.status(201).json(created);
    } catch (error) {
      handleTranslatedError(error, ErrorCatalog, res);
    }
  };

  listSeals = async (req: Request, res: Response): Promise<void> => {
    try {
      const listingId = req.query.listingId as string;
      const seals = listingId
        ? await this.sealService.listSealsByListingId(listingId)
        : [];
      res.status(200).json(seals);
    } catch (error) {
      handleTranslatedError(error, ErrorCatalog, res);
    }
  };

  getSealById = async (
    req: Request<{ id: string }>,
    res: Response,
  ): Promise<void> => {
    try {
      const seal = await this.sealService.getSealById(req.params.id);
      res.status(200).json(seal);
    } catch (error) {
      handleTranslatedError(error, ErrorCatalog, res);
    }
  };

  revokeSeal = async (
    req: Request<{ id: string }>,
    res: Response,
  ): Promise<void> => {
    try {
      const seal = await this.sealService.revokeSeal(
        req.params.id,
        req.body.sellerId,
      );
      res.status(200).json(seal);
    } catch (error) {
      handleTranslatedError(error, ErrorCatalog, res);
    }
  };

  public getRoutes(): Router {
    return this.router;
  }
}
