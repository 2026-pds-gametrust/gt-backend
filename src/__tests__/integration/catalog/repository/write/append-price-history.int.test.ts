import { randomUUID } from 'crypto';
import { Types } from 'mongoose';
import { PriceHistoryRepositoryWrite } from '../../../../../infraestructure/repository/catalog/price-history.repository.write';
import { PriceHistoryModel } from '../../../../../infraestructure/db/mongo/models/price-history.model';
import { EPriceHistorySource } from '../../../../../domain/catalog/entity/enums/EPriceHistorySource';
import { EErrorCode } from '../../../../../domain/common/errors/enums/EErrorCode';

const repositoryWrite = new PriceHistoryRepositoryWrite();

afterEach(() => {
  jest.restoreAllMocks();
});

describe('when we append price history via repository', () => {
  it('should return the created entry as a domain object', async () => {
    const entry = {
      id: randomUUID(),
      productId: new Types.ObjectId().toHexString(),
      priceCents: 1500,
      currency: 'BRL',
      source: EPriceHistorySource.MANUAL,
      observedAt: new Date(),
      createdAt: new Date(),
    };

    const created = await repositoryWrite.appendPriceHistory(entry);

    expect(created).toMatchObject({
      id: entry.id,
      productId: entry.productId,
      priceCents: 1500,
      source: EPriceHistorySource.MANUAL,
    });
    expect(created.createdAt).toBeDefined();
  });
});

describe('when PriceHistoryModel.create rejects for appendPriceHistory', () => {
  it('should reject with DATABASE_ERROR', async () => {
    jest
      .spyOn(PriceHistoryModel, 'create')
      .mockRejectedValue(new Error('mongo failure'));

    await expect(
      repositoryWrite.appendPriceHistory({
        id: randomUUID(),
        productId: new Types.ObjectId().toHexString(),
        priceCents: 100,
        currency: 'BRL',
        source: EPriceHistorySource.MANUAL,
        observedAt: new Date(),
        createdAt: new Date(),
      }),
    ).rejects.toMatchObject({
      status: 500,
      errorCode: EErrorCode.DATABASE_ERROR,
    });
  });
});
