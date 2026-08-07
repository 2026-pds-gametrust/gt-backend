import { IThrowedError, serviceLogErrorHandler } from '@sauvvitech/st-packages';
import { ICategoryAttributeSchema } from '../../../domain/catalog/entity/interfaces/category-attribute-schema.interface';
import { ICategoryAttributeSchemaRepositoryRead } from '../../../domain/catalog/repository/category-attribute-schema.repository.read';
import { EErrorCode } from '../../../domain/common/errors/enums/EErrorCode';
import { CategoryAttributeSchemaModel } from '../../db/mongo/models/category-attribute-schema.model';
import { dbToInternal } from './adapters/category-attribute-schema.adapter';

export class CategoryAttributeSchemaRepositoryRead
  implements ICategoryAttributeSchemaRepositoryRead
{
  async findById(id: string): Promise<ICategoryAttributeSchema | null> {
    try {
      const doc = await CategoryAttributeSchemaModel.findOne({ id });
      return doc ? dbToInternal(doc) : null;
    } catch (error: any) {
      serviceLogErrorHandler(error, {
        eventName: 'CategoryAttributeSchemaRepositoryRead.findById',
        eventData: { id },
      });
      throw {
        status: 500,
        errorCode: EErrorCode.DATABASE_ERROR,
      } as IThrowedError;
    }
  }

  async findByCategoryId(
    categoryId: string,
  ): Promise<ICategoryAttributeSchema | null> {
    try {
      const doc = await CategoryAttributeSchemaModel.findOne({ categoryId });
      return doc ? dbToInternal(doc) : null;
    } catch (error: any) {
      serviceLogErrorHandler(error, {
        eventName: 'CategoryAttributeSchemaRepositoryRead.findByCategoryId',
        eventData: { categoryId },
      });
      throw {
        status: 500,
        errorCode: EErrorCode.DATABASE_ERROR,
      } as IThrowedError;
    }
  }
}
