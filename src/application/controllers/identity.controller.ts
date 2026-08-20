import {
  EUserGroup,
  authorizeByGroup,
  handleTranslatedError,
} from '@sauvvitech/st-packages';
import { Request, Response, Router } from 'express';
import { IAuthService } from '../../domain/identity/service/auth.service.interface';
import { ICepService } from '../../domain/identity/service/cep.service';
import { ProfileService } from '../../domain/identity/service/profile.service';
import { UserService } from '../../domain/identity/service/user.service';
import { IController } from '../../domain/server/interfaces/IController';
import { ErrorCatalog } from '../../infraestructure/i18n/error-catalog';
import { requireAccessToken } from '../middleware/require-access-token';

export class IdentityController implements IController {
  router: Router;
  private readonly userService: UserService;
  private readonly profileService: ProfileService;
  private readonly authService: IAuthService;
  private readonly cepService: ICepService;

  constructor(
    userService: UserService,
    profileService: ProfileService,
    authService: IAuthService,
    cepService: ICepService,
  ) {
    this.userService = userService;
    this.profileService = profileService;
    this.authService = authService;
    this.cepService = cepService;
    this.router = Router();
    this.initRoutes();
  }

  initRoutes() {
    this.router.get(
      '/users',
      requireAccessToken,
      authorizeByGroup([EUserGroup.BACKOFFICE, EUserGroup.ADMIN]),
      this.getUsers,
    );
    this.router.get('/users/:id', requireAccessToken, this.getUserById);
    this.router.post(
      '/users',
      requireAccessToken,
      authorizeByGroup([EUserGroup.ADMIN]),
      this.createUser,
    );
    this.router.put('/users/:id', requireAccessToken, this.updateUser);
    this.router.delete('/users/:id', requireAccessToken, this.deleteUser);
    this.router.put(
      '/users/:id/groups',
      requireAccessToken,
      authorizeByGroup([EUserGroup.ADMIN]),
      this.assignUserGroups,
    );
    this.router.post(
      '/users/:id/verify',
      requireAccessToken,
      authorizeByGroup([EUserGroup.BACKOFFICE, EUserGroup.ADMIN]),
      this.verifyUser,
    );

    this.router.get(
      '/cep/:cep',
      requireAccessToken,
      authorizeByGroup([
        EUserGroup.APP_USER,
        EUserGroup.PARTNER,
        EUserGroup.BACKOFFICE,
        EUserGroup.ADMIN,
      ]),
      this.lookupCep,
    );

    this.router.get(
      '/profiles',
      requireAccessToken,
      authorizeByGroup([EUserGroup.BACKOFFICE, EUserGroup.ADMIN]),
      this.listProfiles,
    );
    this.router.get(
      '/profiles/near',
      requireAccessToken,
      authorizeByGroup([
        EUserGroup.APP_USER,
        EUserGroup.PARTNER,
        EUserGroup.BACKOFFICE,
        EUserGroup.ADMIN,
      ]),
      this.findProfilesNear,
    );
    this.router.get('/profiles/me', requireAccessToken, this.getMyProfile);
    this.router.get('/profiles/by-user/:userId', this.getProfileByUserId);
    this.router.get('/profiles/:id', this.getProfileById);
    this.router.post('/profiles', requireAccessToken, this.createProfile);
    this.router.put('/profiles/:id', requireAccessToken, this.updateProfile);
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
      const user = await this.userService.getUserById(req.params.id, req.actor);
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
      const updatedUser = await this.userService.updateUserById(
        req.params.id,
        {
          userData: {
            fullName: req.body.fullName,
            email: req.body.email,
            phone: req.body.phone,
            cpf: req.body.cpf,
            birthDate: req.body.birthDate,
          },
        },
        req.actor,
      );
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
      await this.userService.deleteUserById(req.params.id, req.actor);
      res.status(200).json({ message: 'User deleted successfully' });
    } catch (error) {
      handleTranslatedError(error, ErrorCatalog, res);
    }
  };

  assignUserGroups = async (
    req: Request<{ id: string }>,
    res: Response,
  ): Promise<void> => {
    try {
      const updated = await this.authService.assignGroups(
        req.actor,
        req.params.id,
        req.body.groups,
      );
      res.status(200).json(updated);
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

  lookupCep = async (
    req: Request<{ cep: string }>,
    res: Response,
  ): Promise<void> => {
    try {
      const result = await this.cepService.lookupByCep(req.params.cep);
      const body: Record<string, unknown> = {
        postalCode: result.postalCode,
        street: result.street,
        district: result.district,
        city: result.city,
        state: result.state,
      };
      if (
        result.lat !== undefined &&
        result.lng !== undefined &&
        Number.isFinite(result.lat) &&
        Number.isFinite(result.lng)
      ) {
        body.geo = {
          type: 'Point',
          coordinates: [result.lng, result.lat],
        };
      }
      res.status(200).json(body);
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

  findProfilesNear = async (req: Request, res: Response): Promise<void> => {
    try {
      const near = await this.profileService.findProfilesNear({
        lng: Number(req.query.lng),
        lat: Number(req.query.lat),
        radiusMeters:
          req.query.radiusMeters !== undefined
            ? Number(req.query.radiusMeters)
            : undefined,
        limit:
          req.query.limit !== undefined ? Number(req.query.limit) : undefined,
      });
      res.status(200).json(near);
    } catch (error) {
      handleTranslatedError(error, ErrorCatalog, res);
    }
  };

  getMyProfile = async (req: Request, res: Response): Promise<void> => {
    try {
      const profile = await this.profileService.getMyProfile(req.actor);
      res.status(200).json(profile);
    } catch (error) {
      handleTranslatedError(error, ErrorCatalog, res);
    }
  };

  getProfileById = async (
    req: Request<{ id: string }>,
    res: Response,
  ): Promise<void> => {
    try {
      const profile = await this.profileService.getProfileById(
        req.params.id,
        req.actor,
      );
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
        req.actor,
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
      const profileData: {
        displayName?: string;
        bio?: string;
        locationApprox?: string;
        addresses?: unknown;
        defaultShippingAddressId?: string;
        setupItems?: unknown;
      } = {};
      if (req.body.displayName !== undefined) {
        profileData.displayName = req.body.displayName;
      }
      if (req.body.bio !== undefined) {
        profileData.bio = req.body.bio;
      }
      if (req.body.locationApprox !== undefined) {
        profileData.locationApprox = req.body.locationApprox;
      }
      if (req.body.addresses !== undefined) {
        profileData.addresses = req.body.addresses;
      }
      if (req.body.defaultShippingAddressId !== undefined) {
        profileData.defaultShippingAddressId =
          req.body.defaultShippingAddressId;
      }
      if (req.body.setupItems !== undefined) {
        profileData.setupItems = req.body.setupItems;
      }
      const updated = await this.profileService.updateProfileById(
        req.params.id,
        { profileData: profileData as never },
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
