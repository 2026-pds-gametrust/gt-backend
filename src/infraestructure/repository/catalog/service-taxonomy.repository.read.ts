import { IThrowedError, serviceLogErrorHandler } from '@sauvvitech/st-packages';
import { IServiceTaxonomy } from '../../../domain/catalog/entity/interfaces/service-taxonomy.interface';
import { IServiceTaxonomyRepositoryRead } from '../../../domain/catalog/repository/service-taxonomy.repository.read';
import { EErrorCode } from '../../../domain/common/errors/enums/EErrorCode';
import { ServiceTaxonomyModel } from '../../db/mongo/models/service-taxonomy.model';
import { dbToInternal } from './adapters/service-taxonomy.adapter';

export class ServiceTaxonomyRepositoryRead
  implements IServiceTaxonomyRepositoryRead
{
  async findById(id: string): Promise<IServiceTaxonomy | null> {
    try {
      const doc = await ServiceTaxonomyModel.findOne({ id });
      return doc ? dbToInternal(doc) : null;
    } catch (error: any) {
      serviceLogErrorHandler(error, {
        eventName: 'ServiceTaxonomyRepositoryRead.findById',
        eventData: { id },
      });
      throw {
        status: 500,
        errorCode: EErrorCode.DATABASE_ERROR,
      } as IThrowedError;
    }
  }

  async findBySlug(slug: string): Promise<IServiceTaxonomy | null> {
    try {
      const doc = await ServiceTaxonomyModel.findOne({ slug });
      return doc ? dbToInternal(doc) : null;
    } catch (error: any) {
      serviceLogErrorHandler(error, {
        eventName: 'ServiceTaxonomyRepositoryRead.findBySlug',
        eventData: { slug },
      });
      throw {
        status: 500,
        errorCode: EErrorCode.DATABASE_ERROR,
      } as IThrowedError;
    }
  }

  async findByName(name: string): Promise<IServiceTaxonomy | null> {
    try {
      const doc = await ServiceTaxonomyModel.findOne({ name });
      return doc ? dbToInternal(doc) : null;
    } catch (error: any) {
      serviceLogErrorHandler(error, {
        eventName: 'ServiceTaxonomyRepositoryRead.findByName',
        eventData: { name },
      });
      throw {
        status: 500,
        errorCode: EErrorCode.DATABASE_ERROR,
      } as IThrowedError;
    }
  }

  async findBySynonym(synonym: string): Promise<IServiceTaxonomy | null> {
    try {
      const doc = await ServiceTaxonomyModel.findOne({ synonyms: synonym });
      return doc ? dbToInternal(doc) : null;
    } catch (error: any) {
      serviceLogErrorHandler(error, {
        eventName: 'ServiceTaxonomyRepositoryRead.findBySynonym',
        eventData: { synonym },
      });
      throw {
        status: 500,
        errorCode: EErrorCode.DATABASE_ERROR,
      } as IThrowedError;
    }
  }

  async list(
    filter: Partial<IServiceTaxonomy> = {},
  ): Promise<IServiceTaxonomy[]> {
    try {
      const docs = await ServiceTaxonomyModel.find(filter);
      return docs.map(dbToInternal);
    } catch (error: any) {
      serviceLogErrorHandler(error, {
        eventName: 'ServiceTaxonomyRepositoryRead.list',
        eventData: { filter },
      });
      throw {
        status: 500,
        errorCode: EErrorCode.DATABASE_ERROR,
      } as IThrowedError;
    }
  }
}
