import { IThrowedError, serviceLogErrorHandler } from '@sauvvitech/st-packages';
import { ICategoryAttributeSchema } from '../../../domain/catalog/entity/interfaces/category-attribute-schema.interface';
import { ICategoryAttributeSchemaRepositoryWrite } from '../../../domain/catalog/repository/category-attribute-schema.repository.write';
import { EErrorCode } from '../../../domain/common/errors/enums/EErrorCode';
import { CategoryAttributeSchemaModel } from '../../db/mongo/models/category-attribute-schema.model';
import {
  dbToInternal,
  internalToDb,
} from './adapters/category-attribute-schema.adapter';

export class CategoryAttributeSchemaRepositoryWrite
  implements ICategoryAttributeSchemaRepositoryWrite
{
  async createSchema(
    schema: ICategoryAttributeSchema,
  ): Promise<ICategoryAttributeSchema> {
    try {
      const doc = await CategoryAttributeSchemaModel.create(
        internalToDb(schema),
      );
      return dbToInternal(doc);
    } catch (error: any) {
      serviceLogErrorHandler(error, {
        eventName: 'CategoryAttributeSchemaRepositoryWrite.createSchema',
        eventData: { schema },
      });
      throw {
        status: 500,
        errorCode: EErrorCode.DATABASE_ERROR,
      } as IThrowedError;
    }
  }

  async updateSchemaById(
    id: string,
    data: Partial<ICategoryAttributeSchema>,
  ): Promise<ICategoryAttributeSchema | null> {
    try {
      const doc = await CategoryAttributeSchemaModel.findOneAndUpdate(
        { id },
        { $set: data },
        { new: true },
      );
      return doc ? dbToInternal(doc) : null;
    } catch (error: any) {
      serviceLogErrorHandler(error, {
        eventName: 'CategoryAttributeSchemaRepositoryWrite.updateSchemaById',
        eventData: { id, data },
      });
      throw {
        status: 500,
        errorCode: EErrorCode.DATABASE_ERROR,
      } as IThrowedError;
    }
  }
}
