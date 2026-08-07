import { IThrowedError, serviceLogErrorHandler } from '@sauvvitech/st-packages';
import { ICategory } from '../../../domain/catalog/entity/interfaces/category.interface';
import { ICategoryRepositoryWrite } from '../../../domain/catalog/repository/category.repository.write';
import { EErrorCode } from '../../../domain/common/errors/enums/EErrorCode';
import { CategoryModel } from '../../db/mongo/models/category.model';
import { dbToInternal, internalToDb } from './adapters/category.adapter';

export class CategoryRepositoryWrite implements ICategoryRepositoryWrite {
  async createCategory(category: ICategory): Promise<ICategory> {
    try {
      const doc = await CategoryModel.create(internalToDb(category));
      return dbToInternal(doc);
    } catch (error: any) {
      serviceLogErrorHandler(error, {
        eventName: 'CategoryRepositoryWrite.createCategory',
        eventData: { category },
      });
      throw {
        status: 500,
        errorCode: EErrorCode.DATABASE_ERROR,
      } as IThrowedError;
    }
  }

  async updateCategoryById(
    id: string,
    data: Partial<ICategory>,
  ): Promise<ICategory | null> {
    try {
      const doc = await CategoryModel.findOneAndUpdate(
        { id },
        { $set: data },
        { new: true },
      );
      return doc ? dbToInternal(doc) : null;
    } catch (error: any) {
      serviceLogErrorHandler(error, {
        eventName: 'CategoryRepositoryWrite.updateCategoryById',
        eventData: { id, data },
      });
      throw {
        status: 500,
        errorCode: EErrorCode.DATABASE_ERROR,
      } as IThrowedError;
    }
  }
}
