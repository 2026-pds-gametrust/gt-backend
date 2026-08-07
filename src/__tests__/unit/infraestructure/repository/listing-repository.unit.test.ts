import { ListingModel } from '../../../../infraestructure/db/mongo/models/listing.model';
import { ListingEventModel } from '../../../../infraestructure/db/mongo/models/listing-event.model';
import { ListingRepositoryRead } from '../../../../infraestructure/repository/listings/listing.repository.read';
import { ListingRepositoryWrite } from '../../../../infraestructure/repository/listings/listing.repository.write';
import { ListingEventRepositoryRead } from '../../../../infraestructure/repository/listings/listing-event.repository.read';
import { ListingEventRepositoryWrite } from '../../../../infraestructure/repository/listings/listing-event.repository.write';
import { EErrorCode } from '../../../../domain/common/errors/enums/EErrorCode';

const listingRepositoryRead = new ListingRepositoryRead();
const listingRepositoryWrite = new ListingRepositoryWrite();
const listingEventRepositoryRead = new ListingEventRepositoryRead();
const listingEventRepositoryWrite = new ListingEventRepositoryWrite();

describe('when repositories hit database failures', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should throw DATABASE_ERROR on ListingRepositoryRead.findListingById', async () => {
    jest.spyOn(ListingModel, 'findOne').mockRejectedValueOnce(new Error('boom'));
    await expect(listingRepositoryRead.findListingById(...['id'])).rejects.toMatchObject({
      status: 500,
      errorCode: EErrorCode.DATABASE_ERROR,
    });
  });

  it('should throw DATABASE_ERROR on ListingRepositoryRead.listListings', async () => {
    jest.spyOn(ListingModel, 'find').mockRejectedValueOnce(new Error('boom'));
    await expect(listingRepositoryRead.listListings(...[])).rejects.toMatchObject({
      status: 500,
      errorCode: EErrorCode.DATABASE_ERROR,
    });
  });

  it('should throw DATABASE_ERROR on ListingRepositoryWrite.createListing', async () => {
    jest.spyOn(ListingModel, 'create').mockRejectedValueOnce(new Error('boom'));
    await expect(listingRepositoryWrite.createListing(...[{ id: '1' } as any])).rejects.toMatchObject({
      status: 500,
      errorCode: EErrorCode.DATABASE_ERROR,
    });
  });

  it('should throw DATABASE_ERROR on ListingRepositoryWrite.updateListingById', async () => {
    jest.spyOn(ListingModel, 'findOneAndUpdate').mockRejectedValueOnce(new Error('boom'));
    await expect(listingRepositoryWrite.updateListingById(...['id', { title: 'x' }])).rejects.toMatchObject({
      status: 500,
      errorCode: EErrorCode.DATABASE_ERROR,
    });
  });

  it('should throw DATABASE_ERROR on ListingEventRepositoryRead.listByListingId', async () => {
    const chain = { sort: jest.fn().mockRejectedValue(new Error('boom')), limit: jest.fn().mockReturnThis() };
    jest.spyOn(ListingEventModel, 'find').mockReturnValue(chain as any);
    await expect(listingEventRepositoryRead.listByListingId(...['id'])).rejects.toMatchObject({
      status: 500,
      errorCode: EErrorCode.DATABASE_ERROR,
    });
  });

  it('should throw DATABASE_ERROR on ListingEventRepositoryWrite.appendListingEvent', async () => {
    jest.spyOn(ListingEventModel, 'create').mockRejectedValueOnce(new Error('boom'));
    await expect(listingEventRepositoryWrite.appendListingEvent(...[{ id: '1' } as any])).rejects.toMatchObject({
      status: 500,
      errorCode: EErrorCode.DATABASE_ERROR,
    });
  });

});
