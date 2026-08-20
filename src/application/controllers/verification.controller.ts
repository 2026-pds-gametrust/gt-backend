import {
  EUserGroup,
  authorizeByGroup,
  handleTranslatedError,
} from '@sauvvitech/st-packages';
import { Request, Response, Router } from 'express';
import { IProofCodeAnalysisService } from '../../domain/ai/service/proof-code-analysis.service.interface';
import { IController } from '../../domain/server/interfaces/IController';
import { IParamsListModerationQueue } from '../../domain/verification/entity/interfaces/moderation-queue.interface';
import { EvidenceItemService } from '../../domain/verification/service/evidence-item.service';
import { SealService } from '../../domain/verification/service/seal.service';
import { VerificationCaseService } from '../../domain/verification/service/verification-case.service';
import { ErrorCatalog } from '../../infraestructure/i18n/error-catalog';
import { requireAccessToken } from '../middleware/require-access-token';
import '../middleware/attach-actor-context';

export class VerificationController implements IController {
  router: Router;
  private readonly verificationCaseService: VerificationCaseService;
  private readonly evidenceItemService: EvidenceItemService;
  private readonly sealService: SealService;
  private readonly proofCodeAnalysisService: IProofCodeAnalysisService;

  constructor(
    verificationCaseService: VerificationCaseService,
    evidenceItemService: EvidenceItemService,
    sealService: SealService,
    proofCodeAnalysisService: IProofCodeAnalysisService,
  ) {
    this.verificationCaseService = verificationCaseService;
    this.evidenceItemService = evidenceItemService;
    this.sealService = sealService;
    this.proofCodeAnalysisService = proofCodeAnalysisService;
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
      '/listings/:listingId/proof-code',
      requireAccessToken,
      this.getProofCodeForListing,
    );
    this.router.get(
      '/verification-cases/:id/proof-code',
      requireAccessToken,
      this.getProofCode,
    );
    this.router.get(
      '/verification-cases/:id/proof-code-analysis',
      requireAccessToken,
      authorizeByGroup([EUserGroup.BACKOFFICE, EUserGroup.ADMIN]),
      this.getProofCodeAnalysis,
    );
    this.router.post(
      '/verification-cases/:id/proof-code-analysis/reanalyze',
      requireAccessToken,
      authorizeByGroup([EUserGroup.BACKOFFICE, EUserGroup.ADMIN]),
      this.reanalyzeProofCodeAnalysis,
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
      requireAccessToken,
      this.listEvidence,
    );
    this.router.post(
      '/verification-cases/:caseId/evidence',
      requireAccessToken,
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
    req: Request<
      unknown,
      unknown,
      unknown,
      IParamsListModerationQueue
    >,
    res: Response,
  ): Promise<void> => {
    try {
      const page = await this.verificationCaseService.listModerationQueue({
        status: req.query.status,
        q: req.query.q,
        moderatorId: req.query.moderatorId,
        minScore: req.query.minScore,
        maxScore: req.query.maxScore,
        hasAiScore: req.query.hasAiScore,
        limit: req.query.limit,
        offset: req.query.offset,
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

  getProofCode = async (
    req: Request<{ id: string }>,
    res: Response,
  ): Promise<void> => {
    try {
      const proofCode = await this.verificationCaseService.getProofCodePlaintext(
        req.actor,
        req.params.id,
      );
      res.status(200).json(proofCode);
    } catch (error) {
      handleTranslatedError(error, ErrorCatalog, res);
    }
  };

  getProofCodeForListing = async (
    req: Request<{ listingId: string }>,
    res: Response,
  ): Promise<void> => {
    try {
      const proofCode =
        await this.verificationCaseService.getProofCodeForListing(
          req.actor,
          req.params.listingId,
        );
      res.status(200).json(proofCode);
    } catch (error) {
      handleTranslatedError(error, ErrorCatalog, res);
    }
  };

  getProofCodeAnalysis = async (
    req: Request<{ id: string }>,
    res: Response,
  ): Promise<void> => {
    try {
      const analysis = await this.proofCodeAnalysisService.getAnalysisForCase(
        req.params.id,
        req.actor!,
      );
      res.status(200).json(analysis);
    } catch (error) {
      handleTranslatedError(error, ErrorCatalog, res);
    }
  };

  reanalyzeProofCodeAnalysis = async (
    req: Request<{ id: string }>,
    res: Response,
  ): Promise<void> => {
    try {
      const caseId = String(req.params.id ?? '').trim();
      await this.proofCodeAnalysisService.assertModeratorMayReanalyze(
        caseId,
        req.actor!,
      );
      // Fire-and-forget: 202 must not wait on the vision provider.
      void this.proofCodeAnalysisService
        .requestAnalysis(caseId, { force: true })
        .catch(() => undefined);
      res.status(202).json({
        caseId,
        status: 'PENDING',
      });
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
        req.actor,
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
      const created = await this.evidenceItemService.addEvidence(
        {
          id: req.body.id,
          caseId: req.params.caseId,
          type: req.body.type,
          storageKey: req.body.storageKey,
          assetId: req.body.assetId,
          contentHash: req.body.contentHash,
        },
        req.actor,
      );
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
