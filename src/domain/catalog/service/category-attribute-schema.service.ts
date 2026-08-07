import { IThrowedError } from '@sauvvitech/st-packages';
import { randomUUID } from 'crypto';
import { EErrorCode } from '../../common/errors/enums/EErrorCode';
import { CategoryAttributeSchemaServiceEntity } from '../entity/category-attribute-schema.entity';
import { ICategoryAttributeSchema } from '../entity/interfaces/category-attribute-schema.interface';
import { ICategoryRepositoryRead } from '../repository/category.repository.read';
import { ICategoryAttributeSchemaRepositoryRead } from '../repository/category-attribute-schema.repository.read';
import { ICategoryAttributeSchemaRepositoryWrite } from '../repository/category-attribute-schema.repository.write';
import {
  ICategoryAttributeSchemaService,
  IParamsCategoryAttributeSchemaService,
  IParamsUpsertCategoryAttributeSchema,
} from './category-attribute-schema.service.interface';

export class CategoryAttributeSchemaService
  implements ICategoryAttributeSchemaService
{
  private readonly categoryAttributeSchemaRepositoryRead: ICategoryAttributeSchemaRepositoryRead;
  private readonly categoryAttributeSchemaRepositoryWrite: ICategoryAttributeSchemaRepositoryWrite;
  private readonly categoryRepositoryRead: ICategoryRepositoryRead;

  constructor({
    categoryAttributeSchemaRepositoryRead,
    categoryAttributeSchemaRepositoryWrite,
    categoryRepositoryRead,
  }: IParamsCategoryAttributeSchemaService) {
    this.categoryAttributeSchemaRepositoryRead =
      categoryAttributeSchemaRepositoryRead;
    this.categoryAttributeSchemaRepositoryWrite =
      categoryAttributeSchemaRepositoryWrite;
    this.categoryRepositoryRead = categoryRepositoryRead;
  }

  async getByCategoryId(categoryId: string): Promise<ICategoryAttributeSchema> {
    await this.assertCategoryExists(categoryId);
    const schema =
      await this.categoryAttributeSchemaRepositoryRead.findByCategoryId(
        categoryId,
      );
    if (!schema) {
      throw {
        status: 404,
        errorCode: EErrorCode.RESOURCE_NOT_FOUND,
        message: 'Category attribute schema not found',
        details: { categoryId },
      } as IThrowedError;
    }
    return schema;
  }

  async upsertByCategoryId(
    categoryId: string,
    params: IParamsUpsertCategoryAttributeSchema,
  ): Promise<ICategoryAttributeSchema> {
    await this.assertCategoryExists(categoryId);

    const existing =
      await this.categoryAttributeSchemaRepositoryRead.findByCategoryId(
        categoryId,
      );

    if (!existing) {
      const entity = new CategoryAttributeSchemaServiceEntity({
        id: params.id ?? randomUUID(),
        categoryId,
        attributes: params.attributes,
        version: 1,
        createdAt: new Date(),
      });
      return this.categoryAttributeSchemaRepositoryWrite.createSchema(entity);
    }

    const entity = new CategoryAttributeSchemaServiceEntity({
      ...existing,
      attributes: params.attributes,
      version: existing.version + 1,
    });

    const updated =
      await this.categoryAttributeSchemaRepositoryWrite.updateSchemaById(
        existing.id,
        {
          attributes: entity.attributes,
          version: entity.version,
        },
      );

    if (!updated) {
      throw {
        status: 404,
        errorCode: EErrorCode.RESOURCE_NOT_FOUND,
        message: 'Category attribute schema not found',
        details: { categoryId },
      } as IThrowedError;
    }

    return updated;
  }

  private async assertCategoryExists(categoryId: string): Promise<void> {
    const category =
      await this.categoryRepositoryRead.findCategoryById(categoryId);
    if (!category) {
      throw {
        status: 404,
        errorCode: EErrorCode.RESOURCE_NOT_FOUND,
        message: 'Category not found',
        details: { categoryId },
      } as IThrowedError;
    }
  }
}
