import { handleTranslatedError } from '@sauvvitech/st-packages';
import { Request, RequestHandler, Response, Router } from 'express';
import { IAuthService } from '../../domain/identity/service/auth.service.interface';
import { IController } from '../../domain/server/interfaces/IController';
import { ErrorCatalog } from '../../infraestructure/i18n/error-catalog';
import { requireAccessToken } from '../middleware/require-access-token';

export class AuthController implements IController {
  router: Router;
  private readonly authService: IAuthService;
  private readonly authRateLimit: RequestHandler;

  constructor(authService: IAuthService, authRateLimit: RequestHandler) {
    this.authService = authService;
    this.authRateLimit = authRateLimit;
    this.router = Router();
    this.initRoutes();
  }

  initRoutes() {
    this.router.post(
      '/auth/register',
      this.authRateLimit,
      this.register,
    );
    this.router.post('/auth/login', this.authRateLimit, this.login);
    this.router.post('/auth/refresh', this.authRateLimit, this.refresh);
    this.router.post('/auth/logout', requireAccessToken, this.logout);
    this.router.get('/auth/me', requireAccessToken, this.me);
  }

  register = async (req: Request, res: Response): Promise<void> => {
    try {
      const session = await this.authService.register({
        id: req.body.id,
        fullName: req.body.fullName,
        email: req.body.email,
        phone: req.body.phone,
        cpf: req.body.cpf,
        birthDate: req.body.birthDate,
        password: req.body.password,
      });
      res.status(201).json(session);
    } catch (error) {
      handleTranslatedError(error, ErrorCatalog, res);
    }
  };

  login = async (req: Request, res: Response): Promise<void> => {
    try {
      const session = await this.authService.login({
        email: req.body.email,
        password: req.body.password,
      });
      res.status(200).json(session);
    } catch (error) {
      handleTranslatedError(error, ErrorCatalog, res);
    }
  };

  refresh = async (req: Request, res: Response): Promise<void> => {
    try {
      const session = await this.authService.refresh({
        refreshToken: req.body.refreshToken,
      });
      res.status(200).json(session);
    } catch (error) {
      handleTranslatedError(error, ErrorCatalog, res);
    }
  };

  logout = async (req: Request, res: Response): Promise<void> => {
    try {
      await this.authService.logout(req.actor);
      res.status(204).send();
    } catch (error) {
      handleTranslatedError(error, ErrorCatalog, res);
    }
  };

  me = async (req: Request, res: Response): Promise<void> => {
    try {
      const user = await this.authService.me(req.actor);
      res.status(200).json(user);
    } catch (error) {
      handleTranslatedError(error, ErrorCatalog, res);
    }
  };

  public getRoutes(): Router {
    return this.router;
  }
}
