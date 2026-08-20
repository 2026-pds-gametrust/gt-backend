import {
  EUserGroup,
  authorizeByGroup,
  handleTranslatedError,
} from '@sauvvitech/st-packages';
import { Request, Response, Router } from 'express';
import { ListingService } from '../../domain/listings/service/listing.service';
import { EListingStatus } from '../../domain/listings/entity/enums/EListingStatus';
import { IController } from '../../domain/server/interfaces/IController';
import { ErrorCatalog } from '../../infraestructure/i18n/error-catalog';
import { requireAccessToken } from '../middleware/require-access-token';

export class ListingsController implements IController {
  router: Router;
  private readonly listingService: ListingService;

  constructor(listingService: ListingService) {
    this.listingService = listingService;
    this.router = Router();
    this.initRoutes();
  }

  initRoutes() {
    this.router.get('/listings/mine', requireAccessToken, this.listMyListings);
    this.router.get('/listings', this.listListings);
    this.router.get('/listings/:id/events', this.listListingEvents);
    this.router.get('/listings/:id', this.getListingById);
    this.router.post('/listings', requireAccessToken, this.createListing);
    this.router.put('/listings/:id', requireAccessToken, this.updateListing);
    this.router.post(
      '/listings/:id/submit',
      requireAccessToken,
      this.submitListing,
    );
    this.router.post(
      '/listings/:id/publish',
      requireAccessToken,
      authorizeByGroup([EUserGroup.BACKOFFICE, EUserGroup.ADMIN]),
      this.publishListing,
    );
    this.router.post(
      '/listings/:id/pause',
      requireAccessToken,
      this.pauseListing,
    );
  }

  listListings = async (req: Request, res: Response): Promise<void> => {
    try {
      const sellerId =
        typeof req.query.sellerId === 'string'
          ? req.query.sellerId.trim()
          : undefined;

      if (sellerId) {
        const listings = await this.listingService.listListingsForViewer(
          req.actor,
          { sellerId },
        );
        res.status(200).json(listings);
        return;
      }

      const page = await this.listingService.listPublicListings({
        limit:
          req.query.limit !== undefined ? Number(req.query.limit) : undefined,
        offset:
          req.query.offset !== undefined ? Number(req.query.offset) : undefined,
      });
      res.status(200).json(page);
    } catch (error) {
      handleTranslatedError(error, ErrorCatalog, res);
    }
  };

  listMyListings = async (req: Request, res: Response): Promise<void> => {
    try {
      const statusRaw =
        typeof req.query.status === 'string' ? req.query.status : undefined;
      const status = statusRaw
        ? (statusRaw.toUpperCase() as EListingStatus)
        : undefined;
      const page = await this.listingService.listMyListings(req.actor, {
        status,
        limit:
          req.query.limit !== undefined ? Number(req.query.limit) : undefined,
        offset:
          req.query.offset !== undefined ? Number(req.query.offset) : undefined,
      });
      res.status(200).json(page);
    } catch (error) {
      handleTranslatedError(error, ErrorCatalog, res);
    }
  };

  getListingById = async (
    req: Request<{ id: string }>,
    res: Response,
  ): Promise<void> => {
    try {
      const listing = await this.listingService.getListingById(
        req.params.id,
        req.actor,
      );
      res.status(200).json(listing);
    } catch (error) {
      handleTranslatedError(error, ErrorCatalog, res);
    }
  };

  createListing = async (req: Request, res: Response): Promise<void> => {
    try {
      const created = await this.listingService.createListing(
        {
          id: req.body.id,
          sellerId: req.body.sellerId,
          productId: req.body.productId,
          title: req.body.title,
          description: req.body.description,
          condition: req.body.condition,
          priceCents: req.body.priceCents,
          listPriceCents: req.body.listPriceCents,
          currency: req.body.currency,
          attributes: req.body.attributes,
          media: req.body.media,
          shipping: req.body.shipping,
          locationApprox: req.body.locationApprox,
          warranty: req.body.warranty,
          acceptsOffers: req.body.acceptsOffers,
          buyNowEnabled: req.body.buyNowEnabled,
          quantity: req.body.quantity,
        },
        req.actor,
      );
      res.status(201).json(created);
    } catch (error) {
      handleTranslatedError(error, ErrorCatalog, res);
    }
  };

  updateListing = async (
    req: Request<{ id: string }>,
    res: Response,
  ): Promise<void> => {
    try {
      const updated = await this.listingService.updateListingById(
        req.params.id,
        { listingData: req.body },
        req.actor,
      );
      res.status(200).json(updated);
    } catch (error) {
      handleTranslatedError(error, ErrorCatalog, res);
    }
  };

  submitListing = async (
    req: Request<{ id: string }>,
    res: Response,
  ): Promise<void> => {
    try {
      const updated = await this.listingService.submitListing(
        req.params.id,
        req.actor,
      );
      res.status(200).json(updated);
    } catch (error) {
      handleTranslatedError(error, ErrorCatalog, res);
    }
  };

  publishListing = async (
    req: Request<{ id: string }>,
    res: Response,
  ): Promise<void> => {
    try {
      const updated = await this.listingService.publishListing(
        req.params.id,
        req.actor,
      );
      res.status(200).json(updated);
    } catch (error) {
      handleTranslatedError(error, ErrorCatalog, res);
    }
  };

  pauseListing = async (
    req: Request<{ id: string }>,
    res: Response,
  ): Promise<void> => {
    try {
      const updated = await this.listingService.pauseListing(
        req.params.id,
        req.actor,
      );
      res.status(200).json(updated);
    } catch (error) {
      handleTranslatedError(error, ErrorCatalog, res);
    }
  };

  listListingEvents = async (
    req: Request<{ id: string }>,
    res: Response,
  ): Promise<void> => {
    try {
      const events = await this.listingService.listEvents(
        req.params.id,
        req.actor,
      );
      res.status(200).json(events);
    } catch (error) {
      handleTranslatedError(error, ErrorCatalog, res);
    }
  };

  public getRoutes(): Router {
    return this.router;
  }
}
