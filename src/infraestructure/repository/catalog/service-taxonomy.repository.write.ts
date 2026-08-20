import { IThrowedError, serviceLogErrorHandler } from '@sauvvitech/st-packages';
import { IServiceTaxonomy } from '../../../domain/catalog/entity/interfaces/service-taxonomy.interface';
import { IServiceTaxonomyRepositoryWrite } from '../../../domain/catalog/repository/service-taxonomy.repository.write';
import { EErrorCode } from '../../../domain/common/errors/enums/EErrorCode';
import { ServiceTaxonomyModel } from '../../db/mongo/models/service-taxonomy.model';
import { dbToInternal, internalToDb } from './adapters/service-taxonomy.adapter';

export class ServiceTaxonomyRepositoryWrite
  implements IServiceTaxonomyRepositoryWrite
{
  async create(data: IServiceTaxonomy): Promise<IServiceTaxonomy> {
    try {
      const doc = await ServiceTaxonomyModel.create(internalToDb(data));
      return dbToInternal(doc);
    } catch (error: any) {
      serviceLogErrorHandler(error, {
        eventName: 'ServiceTaxonomyRepositoryWrite.create',
        eventData: { data },
      });
      throw {
        status: 500,
        errorCode: EErrorCode.DATABASE_ERROR,
      } as IThrowedError;
    }
  }

  async updateById(
    id: string,
    data: Partial<IServiceTaxonomy>,
  ): Promise<IServiceTaxonomy | null> {
    try {
      const doc = await ServiceTaxonomyModel.findOneAndUpdate(
        { id },
        { $set: data },
        { new: true },
      );
      return doc ? dbToInternal(doc) : null;
    } catch (error: any) {
      serviceLogErrorHandler(error, {
        eventName: 'ServiceTaxonomyRepositoryWrite.updateById',
        eventData: { id, data },
      });
      throw {
        status: 500,
        errorCode: EErrorCode.DATABASE_ERROR,
      } as IThrowedError;
    }
  }
}
