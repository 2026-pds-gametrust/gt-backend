import { IThrowedError } from '@sauvvitech/st-packages';
import { randomUUID } from 'crypto';
import { EErrorCode } from '../../common/errors/enums/EErrorCode';
import { createEventEnvelope } from '../../common/messaging/event-envelope';
import { IEventPublisher } from '../../common/messaging/event-publisher.interface';
import { normalizeSynonym } from '../../common/types/normalize-synonym';
import { ServiceTaxonomyServiceEntity } from '../entity/service-taxonomy.entity';
import { EServiceTaxonomyStatus } from '../entity/enums/EServiceTaxonomyStatus';
import { IServiceTaxonomy } from '../entity/interfaces/service-taxonomy.interface';
import { ICategoryRepositoryRead } from '../repository/category.repository.read';
import { IServiceTaxonomyRepositoryRead } from '../repository/service-taxonomy.repository.read';
import { IServiceTaxonomyRepositoryWrite } from '../repository/service-taxonomy.repository.write';
import {
  IParamsCreateServiceTaxonomy,
  IParamsServiceTaxonomyService,
  IParamsUpdateServiceTaxonomy,
  IServiceTaxonomyService,
} from './service-taxonomy.service.interface';
import { assertTaxonomySynonymAvailable } from './taxonomy-synonym.guard';

export class ServiceTaxonomyService implements IServiceTaxonomyService {
  private readonly serviceTaxonomyRepositoryRead: IServiceTaxonomyRepositoryRead;
  private readonly serviceTaxonomyRepositoryWrite: IServiceTaxonomyRepositoryWrite;
  private readonly categoryRepositoryRead: ICategoryRepositoryRead;
  private readonly eventPublisher: IEventPublisher;

  constructor({
    serviceTaxonomyRepositoryRead,
    serviceTaxonomyRepositoryWrite,
    categoryRepositoryRead,
    eventPublisher,
  }: IParamsServiceTaxonomyService) {
    this.serviceTaxonomyRepositoryRead = serviceTaxonomyRepositoryRead;
    this.serviceTaxonomyRepositoryWrite = serviceTaxonomyRepositoryWrite;
    this.categoryRepositoryRead = categoryRepositoryRead;
    this.eventPublisher = eventPublisher;
  }

  async createService(
    params: IParamsCreateServiceTaxonomy,
  ): Promise<IServiceTaxonomy> {
    const entity = new ServiceTaxonomyServiceEntity({
      id: params.id,
      slug: params.slug,
      name: params.name,
      synonyms: params.synonyms ?? [],
      status: params.status ?? EServiceTaxonomyStatus.ACTIVE,
      createdAt: new Date(),
    });

    await this.assertUnique(entity);

    const created = await this.serviceTaxonomyRepositoryWrite.create(entity);

    await this.eventPublisher.publish(
      createEventEnvelope({
        eventId: randomUUID(),
        eventType: 'catalog.service.created',
        aggregateId: created.id,
        producerModule: 'catalog',
        correlationId: randomUUID(),
        payload: {
          serviceId: created.id,
          slug: created.slug,
          name: created.name,
          synonyms: created.synonyms,
          status: created.status,
        },
      }),
    );

    return created;
  }

  async getServiceById(id: string): Promise<IServiceTaxonomy> {
    const service = await this.serviceTaxonomyRepositoryRead.findById(id);
    if (!service) {
      throw {
        status: 404,
        errorCode: EErrorCode.RESOURCE_NOT_FOUND,
        message: 'Service not found',
        details: { id },
      } as IThrowedError;
    }
    return service;
  }

  async listServices(
    filter: Partial<IServiceTaxonomy> = {},
  ): Promise<IServiceTaxonomy[]> {
    return this.serviceTaxonomyRepositoryRead.list(filter);
  }

  async updateServiceById(
    id: string,
    params: IParamsUpdateServiceTaxonomy,
  ): Promise<IServiceTaxonomy> {
    const existing = await this.getServiceById(id);
    const nextSynonyms = params.serviceData.synonyms
      ? params.serviceData.synonyms.map(normalizeSynonym).filter(Boolean)
      : existing.synonyms;

    const candidate: IServiceTaxonomy = {
      ...existing,
      ...params.serviceData,
      synonyms: nextSynonyms,
      name: params.serviceData.name?.trim() ?? existing.name,
    };

    if (candidate.name !== existing.name) {
      const byName = await this.serviceTaxonomyRepositoryRead.findByName(
        candidate.name,
      );
      if (byName && byName.id !== id) {
        throw this.conflict('name', candidate.name);
      }
    }

    await this.assertSynonymsAvailable(nextSynonyms, id);

    const updated = await this.serviceTaxonomyRepositoryWrite.updateById(id, {
      name: candidate.name,
      synonyms: nextSynonyms,
      status: candidate.status,
    });

    if (!updated) {
      throw {
        status: 404,
        errorCode: EErrorCode.RESOURCE_NOT_FOUND,
        message: 'Service not found',
        details: { id },
      } as IThrowedError;
    }

    await this.eventPublisher.publish(
      createEventEnvelope({
        eventId: randomUUID(),
        eventType: 'catalog.service.updated',
        aggregateId: updated.id,
        producerModule: 'catalog',
        correlationId: randomUUID(),
        payload: {
          serviceId: updated.id,
          slug: updated.slug,
          name: updated.name,
          synonyms: updated.synonyms,
          status: updated.status,
        },
      }),
    );

    return updated;
  }

  private async assertUnique(entity: IServiceTaxonomy): Promise<void> {
    const bySlug = await this.serviceTaxonomyRepositoryRead.findBySlug(
      entity.slug,
    );
    if (bySlug) {
      throw this.conflict('slug', entity.slug);
    }

    const byName = await this.serviceTaxonomyRepositoryRead.findByName(
      entity.name,
    );
    if (byName) {
      throw this.conflict('name', entity.name);
    }

    await this.assertSynonymsAvailable(entity.synonyms);
  }

  private async assertSynonymsAvailable(
    synonyms: string[],
    excludeServiceId?: string,
  ): Promise<void> {
    for (const synonym of synonyms) {
      await assertTaxonomySynonymAvailable({
        synonym,
        categoryRepositoryRead: this.categoryRepositoryRead,
        serviceTaxonomyRepositoryRead: this.serviceTaxonomyRepositoryRead,
        excludeServiceId,
      });
    }
  }

  private conflict(field: string, value: string): IThrowedError {
    return {
      status: 409,
      errorCode: EErrorCode.RESOURCE_CONFLICT,
      message: `Service ${field} already exists`,
      details: { [field]: value },
    } as IThrowedError;
  }
}
