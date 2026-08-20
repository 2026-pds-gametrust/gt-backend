import { Types } from 'mongoose';
import { EListingStatus } from '../../domain/listings/entity/enums/EListingStatus';
import { ListingModel } from '../../infraestructure/db/mongo/models/listing.model';
import { ProfileModel } from '../../infraestructure/db/mongo/models/profile.model';
import { UserModel } from '../../infraestructure/db/mongo/models/user.model';
import { validListingMock } from '../__mocks__/listing.mock';
import { validProfileMock } from '../__mocks__/profile.mock';
import { validUserMock } from '../__mocks__/user.mock';

export interface IListingChatFixture {
  buyerId: string;
  sellerId: string;
  listingId: string;
}

export async function seedListingChatFixture(
  override?: Partial<{ buyerId: string; sellerId: string; listingId: string }>,
): Promise<IListingChatFixture> {
  const buyerId = override?.buyerId ?? new Types.ObjectId().toHexString();
  const sellerId = override?.sellerId ?? new Types.ObjectId().toHexString();
  const listingId = override?.listingId ?? new Types.ObjectId().toHexString();

  await UserModel.create([
    validUserMock({ id: buyerId }),
    validUserMock({ id: sellerId }),
  ]);

  await ProfileModel.create([
    validProfileMock({ userId: buyerId, displayName: 'Comprador' }),
    validProfileMock({ userId: sellerId, displayName: 'Vendedor' }),
  ]);

  await ListingModel.create(
    validListingMock({
      id: listingId,
      sellerId,
      status: EListingStatus.PUBLISHED,
      title: 'GPU RTX 4070',
    }),
  );

  return { buyerId, sellerId, listingId };
}
