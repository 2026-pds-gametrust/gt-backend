import { randomUUID } from 'crypto';
import { PriceHistoryRepositoryRead } from '../../../../../infraestructure/repository/catalog/price-history.repository.read';
import { PriceHistoryModel } from '../../../../../infraestructure/db/mongo/models/price-history.model';
import { EPriceHistorySource } from '../../../../../domain/catalog/entity/enums/EPriceHistorySource';
import { EErrorCode } from '../../../../../domain/common/errors/enums/EErrorCode';
import { Types } from 'mongoose';

const repositoryRead = new PriceHistoryRepositoryRead();

afterEach(() => {
  jest.restoreAllMocks();
});

describe('when we find a price history entry by id via repository', () => {
  it('should return the entry when it exists', async () => {
    const entry = {
      id: randomUUID(),
      productId: new Types.ObjectId().toHexString(),
      priceCents: 1000,
      currency: 'BRL',
      source: EPriceHistorySource.MANUAL,
      observedAt: new Date(),
    };
    await PriceHistoryModel.create(entry);

    const found = await repositoryRead.findById(entry.id);

    expect(found).toMatchObject({
      id: entry.id,
      productId: entry.productId,
      priceCents: 1000,
    });
  });

  it('should return null when the entry does not exist', async () => {
    const found = await repositoryRead.findById(randomUUID());
    expect(found).toBeNull();
  });
});

describe('when PriceHistoryModel.findOne rejects for findById', () => {
  it('should reject with DATABASE_ERROR', async () => {
    jest
      .spyOn(PriceHistoryModel, 'findOne')
      .mockRejectedValue(new Error('mongo failure'));

    await expect(repositoryRead.findById(randomUUID())).rejects.toMatchObject({
      status: 500,
      errorCode: EErrorCode.DATABASE_ERROR,
    });
  });
});
