import { IThrowedError, serviceLogErrorHandler } from '@sauvvitech/st-packages';
import { ICategory } from '../../../domain/catalog/entity/interfaces/category.interface';
import { ICategoryRepositoryRead } from '../../../domain/catalog/repository/category.repository.read';
import { EErrorCode } from '../../../domain/common/errors/enums/EErrorCode';
import { CategoryModel } from '../../db/mongo/models/category.model';
import { dbToInternal } from './adapters/category.adapter';

export class CategoryRepositoryRead implements ICategoryRepositoryRead {
  async findCategoryById(id: string): Promise<ICategory | null> {
    try {
      const doc = await CategoryModel.findOne({ id });
      return doc ? dbToInternal(doc) : null;
    } catch (error: any) {
      serviceLogErrorHandler(error, {
        eventName: 'CategoryRepositoryRead.findCategoryById',
        eventData: { id },
      });
      throw {
        status: 500,
        errorCode: EErrorCode.DATABASE_ERROR,
      } as IThrowedError;
    }
  }

  async findCategoryBySlug(slug: string): Promise<ICategory | null> {
    try {
      const doc = await CategoryModel.findOne({ slug });
      return doc ? dbToInternal(doc) : null;
    } catch (error: any) {
      serviceLogErrorHandler(error, {
        eventName: 'CategoryRepositoryRead.findCategoryBySlug',
        eventData: { slug },
      });
      throw {
        status: 500,
        errorCode: EErrorCode.DATABASE_ERROR,
      } as IThrowedError;
    }
  }

  async findCategoryByName(name: string): Promise<ICategory | null> {
    try {
      const doc = await CategoryModel.findOne({ name });
      return doc ? dbToInternal(doc) : null;
    } catch (error: any) {
      serviceLogErrorHandler(error, {
        eventName: 'CategoryRepositoryRead.findCategoryByName',
        eventData: { name },
      });
      throw {
        status: 500,
        errorCode: EErrorCode.DATABASE_ERROR,
      } as IThrowedError;
    }
  }

  async findCategoryBySynonym(synonym: string): Promise<ICategory | null> {
    try {
      const doc = await CategoryModel.findOne({ synonyms: synonym });
      return doc ? dbToInternal(doc) : null;
    } catch (error: any) {
      serviceLogErrorHandler(error, {
        eventName: 'CategoryRepositoryRead.findCategoryBySynonym',
        eventData: { synonym },
      });
      throw {
        status: 500,
        errorCode: EErrorCode.DATABASE_ERROR,
      } as IThrowedError;
    }
  }

  async listCategories(filter: Partial<ICategory> = {}): Promise<ICategory[]> {
    try {
      const docs = await CategoryModel.find(filter);
      return docs.map(dbToInternal);
    } catch (error: any) {
      serviceLogErrorHandler(error, {
        eventName: 'CategoryRepositoryRead.listCategories',
        eventData: { filter },
      });
      throw {
        status: 500,
        errorCode: EErrorCode.DATABASE_ERROR,
      } as IThrowedError;
    }
  }
}
