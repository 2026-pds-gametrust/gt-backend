import {
  EUserGroup,
  authorizeByGroup,
  handleTranslatedError,
} from '@sauvvitech/st-packages';
import { Request, Response, Router } from 'express';
import { ProfileService } from '../../domain/identity/service/profile.service';
import { UserService } from '../../domain/identity/service/user.service';
import { IController } from '../../domain/server/interfaces/IController';
import { ErrorCatalog } from '../../infraestructure/i18n/error-catalog';

export class IdentityController implements IController {
  router: Router;
  private readonly userService: UserService;
  private readonly profileService: ProfileService;

  constructor(userService: UserService, profileService: ProfileService) {
    this.userService = userService;
    this.profileService = profileService;
    this.router = Router();
    this.initRoutes();
  }

  initRoutes() {
    this.router.get(
      '/users',
      authorizeByGroup([EUserGroup.BACKOFFICE, EUserGroup.ADMIN]),
      this.getUsers,
    );
    this.router.get('/users/:id', this.getUserById);
    this.router.post('/users', this.createUser);
    this.router.put('/users/:id', this.updateUser);
    this.router.delete('/users/:id', this.deleteUser);
    this.router.post(
      '/users/:id/verify',
      authorizeByGroup([EUserGroup.BACKOFFICE, EUserGroup.ADMIN]),
      this.verifyUser,
    );

    this.router.get(
      '/profiles',
      authorizeByGroup([EUserGroup.BACKOFFICE, EUserGroup.ADMIN]),
      this.listProfiles,
    );
    this.router.get('/profiles/by-user/:userId', this.getProfileByUserId);
    this.router.get('/profiles/:id', this.getProfileById);
    this.router.post('/profiles', this.createProfile);
    this.router.put('/profiles/:id', this.updateProfile);
  }

  getUsers = async (_req: Request, res: Response): Promise<void> => {
    try {
      const users = await this.userService.listUsers();
      res.status(200).json(users);
    } catch (error) {
      handleTranslatedError(error, ErrorCatalog, res);
    }
  };

  getUserById = async (
    req: Request<{ id: string }>,
    res: Response,
  ): Promise<void> => {
    try {
      const user = await this.userService.getUserById(req.params.id);
      res.status(200).json(user);
    } catch (error) {
      handleTranslatedError(error, ErrorCatalog, res);
    }
  };

  createUser = async (req: Request, res: Response): Promise<void> => {
    try {
      const newUser = await this.userService.createUser({
        id: req.body.id,
        fullName: req.body.fullName,
        email: req.body.email,
        phone: req.body.phone,
        cpf: req.body.cpf,
        birthDate: req.body.birthDate,
        verified: req.body.verified,
        phoneVerified: req.body.phoneVerified,
        status: req.body.status,
      });
      res.status(201).json(newUser);
    } catch (error) {
      handleTranslatedError(error, ErrorCatalog, res);
    }
  };

  updateUser = async (
    req: Request<{ id: string }>,
    res: Response,
  ): Promise<void> => {
    try {
      const updatedUser = await this.userService.updateUserById(req.params.id, {
        userData: req.body,
      });
      res.status(200).json(updatedUser);
    } catch (error) {
      handleTranslatedError(error, ErrorCatalog, res);
    }
  };

  deleteUser = async (
    req: Request<{ id: string }>,
    res: Response,
  ): Promise<void> => {
    try {
      await this.userService.deleteUserById(req.params.id);
      res.status(200).json({ message: 'User deleted successfully' });
    } catch (error) {
      handleTranslatedError(error, ErrorCatalog, res);
    }
  };

  verifyUser = async (
    req: Request<{ id: string }>,
    res: Response,
  ): Promise<void> => {
    try {
      const verified = await this.userService.verifyUser(req.params.id);
      res.status(200).json(verified);
    } catch (error) {
      handleTranslatedError(error, ErrorCatalog, res);
    }
  };

  listProfiles = async (_req: Request, res: Response): Promise<void> => {
    try {
      const profiles = await this.profileService.listProfiles();
      res.status(200).json(profiles);
    } catch (error) {
      handleTranslatedError(error, ErrorCatalog, res);
    }
  };

  getProfileById = async (
    req: Request<{ id: string }>,
    res: Response,
  ): Promise<void> => {
    try {
      const profile = await this.profileService.getProfileById(req.params.id);
      res.status(200).json(profile);
    } catch (error) {
      handleTranslatedError(error, ErrorCatalog, res);
    }
  };

  getProfileByUserId = async (
    req: Request<{ userId: string }>,
    res: Response,
  ): Promise<void> => {
    try {
      const profile = await this.profileService.getProfileByUserId(
        req.params.userId,
      );
      res.status(200).json(profile);
    } catch (error) {
      handleTranslatedError(error, ErrorCatalog, res);
    }
  };

  createProfile = async (req: Request, res: Response): Promise<void> => {
    try {
      const created = await this.profileService.createProfile(
        {
          id: req.body.id,
          userId: req.body.userId,
          displayName: req.body.displayName,
          bio: req.body.bio,
          locationApprox: req.body.locationApprox,
          addresses: req.body.addresses,
          defaultShippingAddressId: req.body.defaultShippingAddressId,
          setupItems: req.body.setupItems,
        },
        req.actor,
      );
      res.status(201).json(created);
    } catch (error) {
      handleTranslatedError(error, ErrorCatalog, res);
    }
  };

  updateProfile = async (
    req: Request<{ id: string }>,
    res: Response,
  ): Promise<void> => {
    try {
      const updated = await this.profileService.updateProfileById(
        req.params.id,
        { profileData: req.body },
        req.actor,
      );
      res.status(200).json(updated);
    } catch (error) {
      handleTranslatedError(error, ErrorCatalog, res);
    }
  };

  public getRoutes(): Router {
    return this.router;
  }
}
