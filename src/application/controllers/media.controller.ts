import { handleTranslatedError } from '@sauvvitech/st-packages';
import { Request, Response, Router } from 'express';
import { MediaAssetService } from '../../domain/media/service/media-asset.service';
import { IController } from '../../domain/server/interfaces/IController';
import { ErrorCatalog } from '../../infraestructure/i18n/error-catalog';

export class MediaController implements IController {
  router: Router;
  private readonly mediaAssetService: MediaAssetService;

  constructor(mediaAssetService: MediaAssetService) {
    this.mediaAssetService = mediaAssetService;
    this.router = Router();
    this.initRoutes();
  }

  initRoutes() {
    this.router.post('/media/uploads', this.createUpload);
    this.router.post('/media/uploads/:id/complete', this.completeUpload);
    this.router.get('/media/assets/:id', this.getMediaAssetById);
    this.router.get('/media/assets/:id/content', this.getMediaContent);
  }

  createUpload = async (req: Request, res: Response): Promise<void> => {
    try {
      const created = await this.mediaAssetService.createUpload(
        {
          id: req.body.id,
          purpose: req.body.purpose,
          ownerId: req.body.ownerId,
          contentType: req.body.contentType,
          byteSize: req.body.byteSize,
        },
        req.actor,
      );
      const view = await this.mediaAssetService.getMediaAssetView(
        created.asset.id,
        req.actor,
      );
      res.status(201).json({
        ...view,
        upload: {
          url: created.upload.url,
          headers: created.upload.headers,
          expiresAt: created.upload.expiresAt,
        },
      });
    } catch (error) {
      handleTranslatedError(error, ErrorCatalog, res);
    }
  };

  completeUpload = async (
    req: Request<{ id: string }>,
    res: Response,
  ): Promise<void> => {
    try {
      const asset = await this.mediaAssetService.completeUpload(
        req.params.id,
        req.actor,
      );
      const view = await this.mediaAssetService.getMediaAssetView(
        asset.id,
        req.actor,
      );
      res.status(200).json(view);
    } catch (error) {
      handleTranslatedError(error, ErrorCatalog, res);
    }
  };

  getMediaAssetById = async (
    req: Request<{ id: string }>,
    res: Response,
  ): Promise<void> => {
    try {
      const asset = await this.mediaAssetService.getMediaAssetView(
        req.params.id,
        req.actor,
      );
      res.status(200).json(asset);
    } catch (error) {
      handleTranslatedError(error, ErrorCatalog, res);
    }
  };

  getMediaContent = async (
    req: Request<{ id: string }>,
    res: Response,
  ): Promise<void> => {
    try {
      const grant = await this.mediaAssetService.getContentGrant(
        req.params.id,
        req.actor,
      );
      res.status(200).json(grant);
    } catch (error) {
      handleTranslatedError(error, ErrorCatalog, res);
    }
  };

  public getRoutes(): Router {
    return this.router;
  }
}
