import { handleTranslatedError } from '@sauvvitech/st-packages';
import { Request, Response, Router } from 'express';
import { FavoriteService } from '../../domain/favorites/service/favorite.service';
import { IController } from '../../domain/server/interfaces/IController';
import { ErrorCatalog } from '../../infraestructure/i18n/error-catalog';

export class FavoritesController implements IController {
  router: Router;
  private readonly favoriteService: FavoriteService;

  constructor(favoriteService: FavoriteService) {
    this.favoriteService = favoriteService;
    this.router = Router();
    this.initRoutes();
  }

  initRoutes() {
    this.router.get('/favorites', this.listFavorites);
    this.router.post('/favorites', this.createFavorite);
    this.router.delete('/favorites/:id', this.deleteFavorite);
  }

  listFavorites = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.query.userId as string;
      const favorites = userId
        ? await this.favoriteService.listByUserId(userId)
        : [];
      res.status(200).json(favorites);
    } catch (error) {
      handleTranslatedError(error, ErrorCatalog, res);
    }
  };

  createFavorite = async (req: Request, res: Response): Promise<void> => {
    try {
      const created = await this.favoriteService.createFavorite(
        {
          id: req.body.id,
          targetType: req.body.targetType,
          targetId: req.body.targetId,
        },
        req.actor,
      );
      res.status(201).json(created);
    } catch (error) {
      handleTranslatedError(error, ErrorCatalog, res);
    }
  };

  deleteFavorite = async (
    req: Request<{ id: string }>,
    res: Response,
  ): Promise<void> => {
    try {
      await this.favoriteService.deleteFavoriteById(req.params.id, req.actor);
      res.status(204).send();
    } catch (error) {
      handleTranslatedError(error, ErrorCatalog, res);
    }
  };

  public getRoutes(): Router {
    return this.router;
  }
}
