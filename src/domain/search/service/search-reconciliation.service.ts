import { ICategory } from '../../catalog/entity/interfaces/category.interface';
import { IServiceTaxonomy } from '../../catalog/entity/interfaces/service-taxonomy.interface';
import { normalizeSynonym } from '../../common/types/normalize-synonym';
import { EListingStatus } from '../../listings/entity/enums/EListingStatus';
import { ESynonymTargetType } from '../entity/enums/ESynonymTargetType';
import {
  IParamsSearchReconciliationService,
  ISearchReconcileResult,
  ISearchReconciliationService,
} from './search-reconciliation.service.interface';

export class SearchReconciliationService
  implements ISearchReconciliationService
{
  private readonly listingRepositoryRead: IParamsSearchReconciliationService['listingRepositoryRead'];
  private readonly categoryRepositoryRead: IParamsSearchReconciliationService['categoryRepositoryRead'];
  private readonly serviceTaxonomyRepositoryRead: IParamsSearchReconciliationService['serviceTaxonomyRepositoryRead'];
  private readonly searchDocumentService: IParamsSearchReconciliationService['searchDocumentService'];
  private readonly synonymService: IParamsSearchReconciliationService['synonymService'];

  constructor(params: IParamsSearchReconciliationService) {
    this.listingRepositoryRead = params.listingRepositoryRead;
    this.categoryRepositoryRead = params.categoryRepositoryRead;
    this.serviceTaxonomyRepositoryRead = params.serviceTaxonomyRepositoryRead;
    this.searchDocumentService = params.searchDocumentService;
    this.synonymService = params.synonymService;
  }

  async reconcile(): Promise<ISearchReconcileResult> {
    const listingsReindexed = await this.reindexPublishedListings();
    const synonymsUpserted = await this.rebuildSynonymProjection();

    return { listingsReindexed, synonymsUpserted };
  }

  private async reindexPublishedListings(): Promise<number> {
    const publishedListings = await this.listingRepositoryRead.listListings({
      status: EListingStatus.PUBLISHED,
    });

    let listingsReindexed = 0;
    for (const listing of publishedListings) {
      const document = await this.searchDocumentService.reindexListing(
        listing.id,
      );
      if (document) {
        listingsReindexed += 1;
      }
    }

    return listingsReindexed;
  }

  private async rebuildSynonymProjection(): Promise<number> {
    let synonymsUpserted = 0;

    const categories = await this.categoryRepositoryRead.listCategories();
    for (const category of categories) {
      synonymsUpserted += await this.projectCategorySynonyms(category);
    }

    const services = await this.serviceTaxonomyRepositoryRead.list();
    for (const service of services) {
      synonymsUpserted += await this.projectServiceSynonyms(service);
    }

    return synonymsUpserted;
  }

  private async projectCategorySynonyms(category: ICategory): Promise<number> {
    const terms = [category.name, ...(category.synonyms ?? [])];
    let upserted = 0;

    for (const term of terms) {
      if (!normalizeSynonym(term)) {
        continue;
      }
      await this.synonymService.upsertFromTaxonomy(
        term,
        ESynonymTargetType.CATEGORY,
        category.id,
        category.name,
      );
      upserted += 1;
    }

    return upserted;
  }

  private async projectServiceSynonyms(
    service: IServiceTaxonomy,
  ): Promise<number> {
    const terms = [service.name, ...(service.synonyms ?? [])];
    let upserted = 0;

    for (const term of terms) {
      if (!normalizeSynonym(term)) {
        continue;
      }
      await this.synonymService.upsertFromTaxonomy(
        term,
        ESynonymTargetType.SERVICE,
        service.id,
        service.name,
      );
      upserted += 1;
    }

    return upserted;
  }
}
