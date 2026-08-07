import { IThrowedError } from '@sauvvitech/st-packages';
import { EErrorCode } from '../../common/errors/enums/EErrorCode';
import { ICategoryRepositoryRead } from '../repository/category.repository.read';
import { IServiceTaxonomyRepositoryRead } from '../repository/service-taxonomy.repository.read';

/** DEC-024: synonym unique across categories ∪ services */
export async function assertTaxonomySynonymAvailable(params: {
  synonym: string;
  categoryRepositoryRead: ICategoryRepositoryRead;
  serviceTaxonomyRepositoryRead: IServiceTaxonomyRepositoryRead;
  excludeCategoryId?: string;
  excludeServiceId?: string;
}): Promise<void> {
  const {
    synonym,
    categoryRepositoryRead,
    serviceTaxonomyRepositoryRead,
    excludeCategoryId,
    excludeServiceId,
  } = params;

  const categoryOwner =
    await categoryRepositoryRead.findCategoryBySynonym(synonym);
  if (categoryOwner && categoryOwner.id !== excludeCategoryId) {
    throw {
      status: 409,
      errorCode: EErrorCode.RESOURCE_CONFLICT,
      message: 'Synonym already used by a category',
      details: { synonym, ownerType: 'category', ownerId: categoryOwner.id },
    } as IThrowedError;
  }

  const serviceOwner =
    await serviceTaxonomyRepositoryRead.findBySynonym(synonym);
  if (serviceOwner && serviceOwner.id !== excludeServiceId) {
    throw {
      status: 409,
      errorCode: EErrorCode.RESOURCE_CONFLICT,
      message: 'Synonym already used by a service',
      details: { synonym, ownerType: 'service', ownerId: serviceOwner.id },
    } as IThrowedError;
  }
}
