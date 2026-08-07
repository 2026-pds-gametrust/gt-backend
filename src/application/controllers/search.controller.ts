import {
  EUserGroup,
  authorizeByGroup,
  handleTranslatedError,
} from '@sauvvitech/st-packages';
import { Request, Response, Router } from 'express';
import { SearchDocumentService } from '../../domain/search/service/search-document.service';
import { SearchReconciliationService } from '../../domain/search/service/search-reconciliation.service';
import { SynonymService } from '../../domain/search/service/synonym.service';
import { IController } from '../../domain/server/interfaces/IController';
import { ErrorCatalog } from '../../infraestructure/i18n/error-catalog';

export class SearchController implements IController {
  router: Router;
  private readonly searchDocumentService: SearchDocumentService;
  private readonly synonymService: SynonymService;
  private readonly searchReconciliationService: SearchReconciliationService;

  constructor(
    searchDocumentService: SearchDocumentService,
    synonymService: SynonymService,
    searchReconciliationService: SearchReconciliationService,
  ) {
    this.searchDocumentService = searchDocumentService;
    this.synonymService = synonymService;
    this.searchReconciliationService = searchReconciliationService;
    this.router = Router();
    this.initRoutes();
  }

  initRoutes() {
    this.router.get('/search', this.search);
    this.router.post(
      '/search/reconcile',
      authorizeByGroup([EUserGroup.BACKOFFICE, EUserGroup.ADMIN]),
      this.reconcile,
    );
    this.router.get('/synonyms', this.listSynonyms);
  }

  search = async (req: Request, res: Response): Promise<void> => {
    try {
      let filters: Record<string, string | number | boolean> | undefined;
      if (typeof req.query.filters === 'string' && req.query.filters.trim()) {
        filters = JSON.parse(req.query.filters);
      }

      const results = await this.searchDocumentService.search({
        q: req.query.q as string | undefined,
        categoryId: req.query.categoryId as string | undefined,
        filters,
        userId: req.query.userId as string | undefined,
      });
      res.status(200).json(results);
    } catch (error) {
      handleTranslatedError(error, ErrorCatalog, res);
    }
  };

  listSynonyms = async (req: Request, res: Response): Promise<void> => {
    try {
      const synonyms = await this.synonymService.listSynonyms(
        req.query.q as string | undefined,
      );
      res.status(200).json(synonyms);
    } catch (error) {
      handleTranslatedError(error, ErrorCatalog, res);
    }
  };

  reconcile = async (_req: Request, res: Response): Promise<void> => {
    try {
      const result = await this.searchReconciliationService.reconcile();
      res.status(200).json(result);
    } catch (error) {
      handleTranslatedError(error, ErrorCatalog, res);
    }
  };

  public getRoutes(): Router {
    return this.router;
  }
}
