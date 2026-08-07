import { IThrowedError } from '@sauvvitech/st-packages';
import { randomUUID } from 'crypto';
import { EErrorCode } from '../../common/errors/enums/EErrorCode';
import { createEventEnvelope } from '../../common/messaging/event-envelope';
import { IEventPublisher } from '../../common/messaging/event-publisher.interface';
import { normalizeSynonym } from '../../common/types/normalize-synonym';
import { CategoryServiceEntity } from '../entity/category.entity';
import { ECategoryStatus } from '../entity/enums/ECategoryStatus';
import { ICategory } from '../entity/interfaces/category.interface';
import { ICategoryRepositoryRead } from '../repository/category.repository.read';
import { ICategoryRepositoryWrite } from '../repository/category.repository.write';
import { IServiceTaxonomyRepositoryRead } from '../repository/service-taxonomy.repository.read';
import {
  ICategoryService,
  IParamsCategoryService,
  IParamsCreateCategory,
  IParamsUpdateCategory,
} from './category.service.interface';
import { assertTaxonomySynonymAvailable } from './taxonomy-synonym.guard';

export class CategoryService implements ICategoryService {
  private readonly categoryRepositoryRead: ICategoryRepositoryRead;
  private readonly categoryRepositoryWrite: ICategoryRepositoryWrite;
  private readonly serviceTaxonomyRepositoryRead: IServiceTaxonomyRepositoryRead;
  private readonly eventPublisher: IEventPublisher;

  constructor({
    categoryRepositoryRead,
    categoryRepositoryWrite,
    serviceTaxonomyRepositoryRead,
    eventPublisher,
  }: IParamsCategoryService) {
    this.categoryRepositoryRead = categoryRepositoryRead;
    this.categoryRepositoryWrite = categoryRepositoryWrite;
    this.serviceTaxonomyRepositoryRead = serviceTaxonomyRepositoryRead;
    this.eventPublisher = eventPublisher;
  }

  async createCategory(params: IParamsCreateCategory): Promise<ICategory> {
    const entity = new CategoryServiceEntity({
      id: params.id,
      slug: params.slug,
      name: params.name,
      synonyms: params.synonyms ?? [],
      parentId: params.parentId ?? null,
      status: params.status ?? ECategoryStatus.ACTIVE,
      createdAt: new Date(),
    });

    await this.assertUnique(entity);

    const created = await this.categoryRepositoryWrite.createCategory(entity);

    await this.eventPublisher.publish(
      createEventEnvelope({
        eventId: randomUUID(),
        eventType: 'catalog.category.created',
        aggregateId: created.id,
        producerModule: 'catalog',
        correlationId: randomUUID(),
        payload: {
          categoryId: created.id,
          slug: created.slug,
          name: created.name,
          synonyms: created.synonyms,
          status: created.status,
        },
      }),
    );

    return created;
  }

  async getCategoryById(id: string): Promise<ICategory> {
    const category = await this.categoryRepositoryRead.findCategoryById(id);
    if (!category) {
      throw {
        status: 404,
        errorCode: EErrorCode.RESOURCE_NOT_FOUND,
        message: 'Category not found',
        details: { id },
      } as IThrowedError;
    }
    return category;
  }

  async listCategories(filter: Partial<ICategory> = {}): Promise<ICategory[]> {
    return this.categoryRepositoryRead.listCategories(filter);
  }

  async updateCategoryById(
    id: string,
    params: IParamsUpdateCategory,
  ): Promise<ICategory> {
    const existing = await this.getCategoryById(id);
    const nextSynonyms = params.categoryData.synonyms
      ? params.categoryData.synonyms.map(normalizeSynonym).filter(Boolean)
      : existing.synonyms;

    const candidate: ICategory = {
      ...existing,
      ...params.categoryData,
      synonyms: nextSynonyms,
      name: params.categoryData.name?.trim() ?? existing.name,
    };

    if (candidate.name !== existing.name) {
      const byName = await this.categoryRepositoryRead.findCategoryByName(
        candidate.name,
      );
      if (byName && byName.id !== id) {
        throw this.conflict('name', candidate.name);
      }
    }

    await this.assertSynonymsAvailable(nextSynonyms, id);

    const updated = await this.categoryRepositoryWrite.updateCategoryById(id, {
      name: candidate.name,
      synonyms: nextSynonyms,
      status: candidate.status,
      parentId: candidate.parentId,
    });

    if (!updated) {
      throw {
        status: 404,
        errorCode: EErrorCode.RESOURCE_NOT_FOUND,
        message: 'Category not found',
        details: { id },
      } as IThrowedError;
    }

    await this.eventPublisher.publish(
      createEventEnvelope({
        eventId: randomUUID(),
        eventType: 'catalog.category.updated',
        aggregateId: updated.id,
        producerModule: 'catalog',
        correlationId: randomUUID(),
        payload: {
          categoryId: updated.id,
          slug: updated.slug,
          name: updated.name,
          synonyms: updated.synonyms,
          status: updated.status,
        },
      }),
    );

    return updated;
  }

  private async assertUnique(entity: ICategory): Promise<void> {
    const bySlug = await this.categoryRepositoryRead.findCategoryBySlug(
      entity.slug,
    );
    if (bySlug) {
      throw this.conflict('slug', entity.slug);
    }

    const byName = await this.categoryRepositoryRead.findCategoryByName(
      entity.name,
    );
    if (byName) {
      throw this.conflict('name', entity.name);
    }

    await this.assertSynonymsAvailable(entity.synonyms);
  }

  private async assertSynonymsAvailable(
    synonyms: string[],
    excludeCategoryId?: string,
  ): Promise<void> {
    for (const synonym of synonyms) {
      await assertTaxonomySynonymAvailable({
        synonym,
        categoryRepositoryRead: this.categoryRepositoryRead,
        serviceTaxonomyRepositoryRead: this.serviceTaxonomyRepositoryRead,
        excludeCategoryId,
      });
    }
  }

  private conflict(field: string, value: string): IThrowedError {
    return {
      status: 409,
      errorCode: EErrorCode.RESOURCE_CONFLICT,
      message: `Category ${field} already exists`,
      details: { [field]: value },
    } as IThrowedError;
  }
}
