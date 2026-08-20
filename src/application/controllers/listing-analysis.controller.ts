import { handleTranslatedError } from '@sauvvitech/st-packages';
import { Request, Response, Router } from 'express';
import { IListingAnalysisService } from '../../domain/ai/service/listing-analysis.service.interface';
import { IController } from '../../domain/server/interfaces/IController';
import { ErrorCatalog } from '../../infraestructure/i18n/error-catalog';
import { requireAccessToken } from '../middleware/require-access-token';

export class ListingAnalysisController implements IController {
  router: Router;
  private readonly listingAnalysisService: IListingAnalysisService;

  constructor(listingAnalysisService: IListingAnalysisService) {
    this.listingAnalysisService = listingAnalysisService;
    this.router = Router();
    this.initRoutes();
  }

  initRoutes() {
    this.router.get(
      '/listings/:id/analysis',
      requireAccessToken,
      this.getListingAnalysis,
    );
  }

  getListingAnalysis = async (
    req: Request<{ id: string }>,
    res: Response,
  ): Promise<void> => {
    try {
      const analysis = await this.listingAnalysisService.getAnalysisForListing(
        req.params.id,
        req.actor!,
      );
      res.status(200).json(analysis);
    } catch (error) {
      handleTranslatedError(error, ErrorCatalog, res);
    }
  };

  public getRoutes(): Router {
    return this.router;
  }
}
