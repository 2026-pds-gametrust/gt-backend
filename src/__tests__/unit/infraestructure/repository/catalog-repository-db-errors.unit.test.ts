import { CategoryModel } from '../../../../infraestructure/db/mongo/models/category.model';
import { ProductModel } from '../../../../infraestructure/db/mongo/models/product.model';
import { ServiceTaxonomyModel } from '../../../../infraestructure/db/mongo/models/service-taxonomy.model';
import { CategoryAttributeSchemaModel } from '../../../../infraestructure/db/mongo/models/category-attribute-schema.model';
import { PriceHistoryModel } from '../../../../infraestructure/db/mongo/models/price-history.model';
import { CategoryRepositoryRead } from '../../../../infraestructure/repository/catalog/category.repository.read';
import { CategoryRepositoryWrite } from '../../../../infraestructure/repository/catalog/category.repository.write';
import { ProductRepositoryRead } from '../../../../infraestructure/repository/catalog/product.repository.read';
import { ProductRepositoryWrite } from '../../../../infraestructure/repository/catalog/product.repository.write';
import { ServiceTaxonomyRepositoryRead } from '../../../../infraestructure/repository/catalog/service-taxonomy.repository.read';
import { ServiceTaxonomyRepositoryWrite } from '../../../../infraestructure/repository/catalog/service-taxonomy.repository.write';
import { CategoryAttributeSchemaRepositoryRead } from '../../../../infraestructure/repository/catalog/category-attribute-schema.repository.read';
import { CategoryAttributeSchemaRepositoryWrite } from '../../../../infraestructure/repository/catalog/category-attribute-schema.repository.write';
import { PriceHistoryRepositoryRead } from '../../../../infraestructure/repository/catalog/price-history.repository.read';
import { PriceHistoryRepositoryWrite } from '../../../../infraestructure/repository/catalog/price-history.repository.write';
import { EErrorCode } from '../../../../domain/common/errors/enums/EErrorCode';

const categoryRead = new CategoryRepositoryRead();
const categoryWrite = new CategoryRepositoryWrite();
const productRead = new ProductRepositoryRead();
const productWrite = new ProductRepositoryWrite();
const serviceRead = new ServiceTaxonomyRepositoryRead();
const serviceWrite = new ServiceTaxonomyRepositoryWrite();
const schemaRead = new CategoryAttributeSchemaRepositoryRead();
const schemaWrite = new CategoryAttributeSchemaRepositoryWrite();
const priceRead = new PriceHistoryRepositoryRead();
const priceWrite = new PriceHistoryRepositoryWrite();

describe('when repositories hit database failures', () => {
  afterEach(() => jest.restoreAllMocks());

  it('should throw DATABASE_ERROR on categoryRead.findCategoryById', async () => {
    jest.spyOn(CategoryModel, 'findOne').mockRejectedValueOnce(new Error('boom'));
    await expect(categoryRead.findCategoryById(...['id'])).rejects.toMatchObject({ status: 500, errorCode: EErrorCode.DATABASE_ERROR });
  });

  it('should throw DATABASE_ERROR on categoryRead.findCategoryBySlug', async () => {
    jest.spyOn(CategoryModel, 'findOne').mockRejectedValueOnce(new Error('boom'));
    await expect(categoryRead.findCategoryBySlug(...['s'])).rejects.toMatchObject({ status: 500, errorCode: EErrorCode.DATABASE_ERROR });
  });

  it('should throw DATABASE_ERROR on categoryRead.findCategoryByName', async () => {
    jest.spyOn(CategoryModel, 'findOne').mockRejectedValueOnce(new Error('boom'));
    await expect(categoryRead.findCategoryByName(...['n'])).rejects.toMatchObject({ status: 500, errorCode: EErrorCode.DATABASE_ERROR });
  });

  it('should throw DATABASE_ERROR on categoryRead.findCategoryBySynonym', async () => {
    jest.spyOn(CategoryModel, 'findOne').mockRejectedValueOnce(new Error('boom'));
    await expect(categoryRead.findCategoryBySynonym(...['syn'])).rejects.toMatchObject({ status: 500, errorCode: EErrorCode.DATABASE_ERROR });
  });

  it('should throw DATABASE_ERROR on categoryRead.listCategories', async () => {
    jest.spyOn(CategoryModel, 'find').mockRejectedValueOnce(new Error('boom'));
    await expect(categoryRead.listCategories(...[])).rejects.toMatchObject({ status: 500, errorCode: EErrorCode.DATABASE_ERROR });
  });

  it('should throw DATABASE_ERROR on categoryWrite.createCategory', async () => {
    jest.spyOn(CategoryModel, 'create').mockRejectedValueOnce(new Error('boom'));
    await expect(categoryWrite.createCategory(...[{ id:'1', name:'n', slug:'s', synonyms:[], active:true, createdAt:new Date() } as any])).rejects.toMatchObject({ status: 500, errorCode: EErrorCode.DATABASE_ERROR });
  });

  it('should throw DATABASE_ERROR on categoryWrite.updateCategoryById', async () => {
    jest.spyOn(CategoryModel, 'findOneAndUpdate').mockRejectedValueOnce(new Error('boom'));
    await expect(categoryWrite.updateCategoryById(...['id',{ name:'x' }])).rejects.toMatchObject({ status: 500, errorCode: EErrorCode.DATABASE_ERROR });
  });

  it('should throw DATABASE_ERROR on productRead.findProductById', async () => {
    jest.spyOn(ProductModel, 'findOne').mockRejectedValueOnce(new Error('boom'));
    await expect(productRead.findProductById(...['id'])).rejects.toMatchObject({ status: 500, errorCode: EErrorCode.DATABASE_ERROR });
  });

  it('should throw DATABASE_ERROR on productRead.findProductBySlug', async () => {
    jest.spyOn(ProductModel, 'findOne').mockRejectedValueOnce(new Error('boom'));
    await expect(productRead.findProductBySlug(...['s'])).rejects.toMatchObject({ status: 500, errorCode: EErrorCode.DATABASE_ERROR });
  });

  it('should throw DATABASE_ERROR on productRead.findProductBySku', async () => {
    jest.spyOn(ProductModel, 'findOne').mockRejectedValueOnce(new Error('boom'));
    await expect(productRead.findProductBySku(...['sku'])).rejects.toMatchObject({ status: 500, errorCode: EErrorCode.DATABASE_ERROR });
  });

  it('should throw DATABASE_ERROR on productRead.listProducts', async () => {
    jest.spyOn(ProductModel, 'find').mockRejectedValueOnce(new Error('boom'));
    await expect(productRead.listProducts(...[])).rejects.toMatchObject({ status: 500, errorCode: EErrorCode.DATABASE_ERROR });
  });

  it('should throw DATABASE_ERROR on productWrite.createProduct', async () => {
    jest.spyOn(ProductModel, 'create').mockRejectedValueOnce(new Error('boom'));
    await expect(productWrite.createProduct(...[{ id:'1' } as any])).rejects.toMatchObject({ status: 500, errorCode: EErrorCode.DATABASE_ERROR });
  });

  it('should throw DATABASE_ERROR on productWrite.updateProductById', async () => {
    jest.spyOn(ProductModel, 'findOneAndUpdate').mockRejectedValueOnce(new Error('boom'));
    await expect(productWrite.updateProductById(...['id',{ brand:'x' }])).rejects.toMatchObject({ status: 500, errorCode: EErrorCode.DATABASE_ERROR });
  });

  it('should throw DATABASE_ERROR on serviceRead.findById', async () => {
    jest.spyOn(ServiceTaxonomyModel, 'findOne').mockRejectedValueOnce(new Error('boom'));
    await expect(serviceRead.findById(...['id'])).rejects.toMatchObject({ status: 500, errorCode: EErrorCode.DATABASE_ERROR });
  });

  it('should throw DATABASE_ERROR on serviceRead.findBySlug', async () => {
    jest.spyOn(ServiceTaxonomyModel, 'findOne').mockRejectedValueOnce(new Error('boom'));
    await expect(serviceRead.findBySlug(...['s'])).rejects.toMatchObject({ status: 500, errorCode: EErrorCode.DATABASE_ERROR });
  });

  it('should throw DATABASE_ERROR on serviceRead.findByName', async () => {
    jest.spyOn(ServiceTaxonomyModel, 'findOne').mockRejectedValueOnce(new Error('boom'));
    await expect(serviceRead.findByName(...['n'])).rejects.toMatchObject({ status: 500, errorCode: EErrorCode.DATABASE_ERROR });
  });

  it('should throw DATABASE_ERROR on serviceRead.findBySynonym', async () => {
    jest.spyOn(ServiceTaxonomyModel, 'findOne').mockRejectedValueOnce(new Error('boom'));
    await expect(serviceRead.findBySynonym(...['syn'])).rejects.toMatchObject({ status: 500, errorCode: EErrorCode.DATABASE_ERROR });
  });

  it('should throw DATABASE_ERROR on serviceRead.list', async () => {
    jest.spyOn(ServiceTaxonomyModel, 'find').mockRejectedValueOnce(new Error('boom'));
    await expect(serviceRead.list(...[])).rejects.toMatchObject({ status: 500, errorCode: EErrorCode.DATABASE_ERROR });
  });

  it('should throw DATABASE_ERROR on serviceWrite.create', async () => {
    jest.spyOn(ServiceTaxonomyModel, 'create').mockRejectedValueOnce(new Error('boom'));
    await expect(serviceWrite.create(...[{ id:'1' } as any])).rejects.toMatchObject({ status: 500, errorCode: EErrorCode.DATABASE_ERROR });
  });

  it('should throw DATABASE_ERROR on serviceWrite.updateById', async () => {
    jest.spyOn(ServiceTaxonomyModel, 'findOneAndUpdate').mockRejectedValueOnce(new Error('boom'));
    await expect(serviceWrite.updateById(...['id',{ name:'x' }])).rejects.toMatchObject({ status: 500, errorCode: EErrorCode.DATABASE_ERROR });
  });

  it('should throw DATABASE_ERROR on schemaRead.findById', async () => {
    jest.spyOn(CategoryAttributeSchemaModel, 'findOne').mockRejectedValueOnce(new Error('boom'));
    await expect(schemaRead.findById(...['id'])).rejects.toMatchObject({ status: 500, errorCode: EErrorCode.DATABASE_ERROR });
  });

  it('should throw DATABASE_ERROR on schemaRead.findByCategoryId', async () => {
    jest.spyOn(CategoryAttributeSchemaModel, 'findOne').mockRejectedValueOnce(new Error('boom'));
    await expect(schemaRead.findByCategoryId(...['c'])).rejects.toMatchObject({ status: 500, errorCode: EErrorCode.DATABASE_ERROR });
  });

  it('should throw DATABASE_ERROR on schemaWrite.createSchema', async () => {
    jest.spyOn(CategoryAttributeSchemaModel, 'create').mockRejectedValueOnce(new Error('boom'));
    await expect(schemaWrite.createSchema(...[{ id:'1' } as any])).rejects.toMatchObject({ status: 500, errorCode: EErrorCode.DATABASE_ERROR });
  });

  it('should throw DATABASE_ERROR on schemaWrite.updateSchemaById', async () => {
    jest.spyOn(CategoryAttributeSchemaModel, 'findOneAndUpdate').mockRejectedValueOnce(new Error('boom'));
    await expect(schemaWrite.updateSchemaById(...['id',{ version:2 }])).rejects.toMatchObject({ status: 500, errorCode: EErrorCode.DATABASE_ERROR });
  });

  it('should throw DATABASE_ERROR on priceRead.findById', async () => {
    jest.spyOn(PriceHistoryModel, 'findOne').mockRejectedValueOnce(new Error('boom'));
    await expect(priceRead.findById(...['id'])).rejects.toMatchObject({ status: 500, errorCode: EErrorCode.DATABASE_ERROR });
  });

  it('should throw DATABASE_ERROR on priceRead.listByProductId', async () => {
    jest.spyOn(PriceHistoryModel, 'find').mockReturnValue({
      sort: jest.fn().mockRejectedValue(new Error('boom')),
    } as any);
    await expect(priceRead.listByProductId(...['p'])).rejects.toMatchObject({ status: 500, errorCode: EErrorCode.DATABASE_ERROR });
  });

  it('should throw DATABASE_ERROR on priceWrite.appendPriceHistory', async () => {
    jest.spyOn(PriceHistoryModel, 'create').mockRejectedValueOnce(new Error('boom'));
    await expect(priceWrite.appendPriceHistory(...[{ id:'1' } as any])).rejects.toMatchObject({ status: 500, errorCode: EErrorCode.DATABASE_ERROR });
  });

});
