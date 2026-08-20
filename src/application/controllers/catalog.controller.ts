import {
  EUserGroup,
  authorizeByGroup,
  handleTranslatedError,
} from '@sauvvitech/st-packages';
import { Request, Response, Router } from 'express';
import { CategoryAttributeSchemaService } from '../../domain/catalog/service/category-attribute-schema.service';
import { CategoryService } from '../../domain/catalog/service/category.service';
import { PriceHistoryService } from '../../domain/catalog/service/price-history.service';
import { ProductService } from '../../domain/catalog/service/product.service';
import { ServiceTaxonomyService } from '../../domain/catalog/service/service-taxonomy.service';
import { IController } from '../../domain/server/interfaces/IController';
import { ErrorCatalog } from '../../infraestructure/i18n/error-catalog';
import { requireAccessToken } from '../middleware/require-access-token';

export class CatalogController implements IController {
  router: Router;
  private readonly categoryService: CategoryService;
  private readonly serviceTaxonomyService: ServiceTaxonomyService;
  private readonly categoryAttributeSchemaService: CategoryAttributeSchemaService;
  private readonly productService: ProductService;
  private readonly priceHistoryService: PriceHistoryService;

  constructor(
    categoryService: CategoryService,
    serviceTaxonomyService: ServiceTaxonomyService,
    categoryAttributeSchemaService: CategoryAttributeSchemaService,
    productService: ProductService,
    priceHistoryService: PriceHistoryService,
  ) {
    this.categoryService = categoryService;
    this.serviceTaxonomyService = serviceTaxonomyService;
    this.categoryAttributeSchemaService = categoryAttributeSchemaService;
    this.productService = productService;
    this.priceHistoryService = priceHistoryService;
    this.router = Router();
    this.initRoutes();
  }

  initRoutes() {
    this.router.get('/categories', this.listCategories);
    this.router.get(
      '/categories/:categoryId/attribute-schema',
      this.getAttributeSchema,
    );
    this.router.put(
      '/categories/:categoryId/attribute-schema',
      requireAccessToken,
      authorizeByGroup([EUserGroup.BACKOFFICE, EUserGroup.ADMIN]),
      this.upsertAttributeSchema,
    );
    this.router.get('/categories/:id', this.getCategoryById);
    this.router.post(
      '/categories',
      requireAccessToken,
      authorizeByGroup([EUserGroup.BACKOFFICE, EUserGroup.ADMIN]),
      this.createCategory,
    );
    this.router.put(
      '/categories/:id',
      requireAccessToken,
      authorizeByGroup([EUserGroup.BACKOFFICE, EUserGroup.ADMIN]),
      this.updateCategory,
    );

    this.router.get('/services', this.listServices);
    this.router.get('/services/:id', this.getServiceById);
    this.router.post(
      '/services',
      requireAccessToken,
      authorizeByGroup([EUserGroup.BACKOFFICE, EUserGroup.ADMIN]),
      this.createService,
    );
    this.router.put(
      '/services/:id',
      requireAccessToken,
      authorizeByGroup([EUserGroup.BACKOFFICE, EUserGroup.ADMIN]),
      this.updateService,
    );

    this.router.get('/products', this.listProducts);
    this.router.get('/products/:productId/price-history', this.getPriceHistory);
    this.router.get('/products/:id', this.getProductById);
    this.router.post(
      '/products',
      requireAccessToken,
      authorizeByGroup([EUserGroup.BACKOFFICE, EUserGroup.ADMIN]),
      this.createProduct,
    );
    this.router.put(
      '/products/:id',
      requireAccessToken,
      authorizeByGroup([EUserGroup.BACKOFFICE, EUserGroup.ADMIN]),
      this.updateProduct,
    );
  }

  listCategories = async (_req: Request, res: Response): Promise<void> => {
    try {
      const categories = await this.categoryService.listCategories();
      res.status(200).json(categories);
    } catch (error) {
      handleTranslatedError(error, ErrorCatalog, res);
    }
  };

  getCategoryById = async (
    req: Request<{ id: string }>,
    res: Response,
  ): Promise<void> => {
    try {
      const category = await this.categoryService.getCategoryById(
        req.params.id,
      );
      res.status(200).json(category);
    } catch (error) {
      handleTranslatedError(error, ErrorCatalog, res);
    }
  };

  createCategory = async (req: Request, res: Response): Promise<void> => {
    try {
      const created = await this.categoryService.createCategory({
        id: req.body.id,
        slug: req.body.slug,
        name: req.body.name,
        synonyms: req.body.synonyms,
        parentId: req.body.parentId ?? null,
        status: req.body.status,
      });
      res.status(201).json(created);
    } catch (error) {
      handleTranslatedError(error, ErrorCatalog, res);
    }
  };

  updateCategory = async (
    req: Request<{ id: string }>,
    res: Response,
  ): Promise<void> => {
    try {
      const updated = await this.categoryService.updateCategoryById(
        req.params.id,
        { categoryData: req.body },
      );
      res.status(200).json(updated);
    } catch (error) {
      handleTranslatedError(error, ErrorCatalog, res);
    }
  };

  getAttributeSchema = async (
    req: Request<{ categoryId: string }>,
    res: Response,
  ): Promise<void> => {
    try {
      const schema = await this.categoryAttributeSchemaService.getByCategoryId(
        req.params.categoryId,
      );
      res.status(200).json(schema);
    } catch (error) {
      handleTranslatedError(error, ErrorCatalog, res);
    }
  };

  upsertAttributeSchema = async (
    req: Request<{ categoryId: string }>,
    res: Response,
  ): Promise<void> => {
    try {
      const schema =
        await this.categoryAttributeSchemaService.upsertByCategoryId(
          req.params.categoryId,
          {
            id: req.body.id,
            attributes: req.body.attributes,
          },
        );
      res.status(200).json(schema);
    } catch (error) {
      handleTranslatedError(error, ErrorCatalog, res);
    }
  };

  listServices = async (_req: Request, res: Response): Promise<void> => {
    try {
      const services = await this.serviceTaxonomyService.listServices();
      res.status(200).json(services);
    } catch (error) {
      handleTranslatedError(error, ErrorCatalog, res);
    }
  };

  getServiceById = async (
    req: Request<{ id: string }>,
    res: Response,
  ): Promise<void> => {
    try {
      const service = await this.serviceTaxonomyService.getServiceById(
        req.params.id,
      );
      res.status(200).json(service);
    } catch (error) {
      handleTranslatedError(error, ErrorCatalog, res);
    }
  };

  createService = async (req: Request, res: Response): Promise<void> => {
    try {
      const created = await this.serviceTaxonomyService.createService({
        id: req.body.id,
        slug: req.body.slug,
        name: req.body.name,
        synonyms: req.body.synonyms,
        status: req.body.status,
      });
      res.status(201).json(created);
    } catch (error) {
      handleTranslatedError(error, ErrorCatalog, res);
    }
  };

  updateService = async (
    req: Request<{ id: string }>,
    res: Response,
  ): Promise<void> => {
    try {
      const updated = await this.serviceTaxonomyService.updateServiceById(
        req.params.id,
        { serviceData: req.body },
      );
      res.status(200).json(updated);
    } catch (error) {
      handleTranslatedError(error, ErrorCatalog, res);
    }
  };

  listProducts = async (_req: Request, res: Response): Promise<void> => {
    try {
      const products = await this.productService.listProducts();
      res.status(200).json(products);
    } catch (error) {
      handleTranslatedError(error, ErrorCatalog, res);
    }
  };

  getProductById = async (
    req: Request<{ id: string }>,
    res: Response,
  ): Promise<void> => {
    try {
      const product = await this.productService.getProductById(req.params.id);
      res.status(200).json(product);
    } catch (error) {
      handleTranslatedError(error, ErrorCatalog, res);
    }
  };

  createProduct = async (req: Request, res: Response): Promise<void> => {
    try {
      const created = await this.productService.createProduct({
        id: req.body.id,
        categoryId: req.body.categoryId,
        brand: req.body.brand,
        model: req.body.model,
        series: req.body.series,
        slug: req.body.slug,
        mpn: req.body.mpn,
        ean: req.body.ean,
        sku: req.body.sku,
        specs: req.body.specs,
        imageUrls: req.body.imageUrls,
        imageAssetIds: req.body.imageAssetIds,
        referencePriceCents: req.body.referencePriceCents,
        currency: req.body.currency,
        status: req.body.status,
      });
      res.status(201).json(created);
    } catch (error) {
      handleTranslatedError(error, ErrorCatalog, res);
    }
  };

  updateProduct = async (
    req: Request<{ id: string }>,
    res: Response,
  ): Promise<void> => {
    try {
      const updated = await this.productService.updateProductById(
        req.params.id,
        { productData: req.body },
      );
      res.status(200).json(updated);
    } catch (error) {
      handleTranslatedError(error, ErrorCatalog, res);
    }
  };

  getPriceHistory = async (
    req: Request<{ productId: string }>,
    res: Response,
  ): Promise<void> => {
    try {
      const history = await this.priceHistoryService.listByProductId(
        req.params.productId,
      );
      res.status(200).json(history);
    } catch (error) {
      handleTranslatedError(error, ErrorCatalog, res);
    }
  };

  public getRoutes(): Router {
    return this.router;
  }
}
